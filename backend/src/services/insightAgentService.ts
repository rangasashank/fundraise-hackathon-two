import OpenAI from 'openai'
import Transcript from '../models/Transcript'
import Insight from '../models/Insight'
import InsightContext from '../models/InsightContext'
import { logAIInfo, logAISuccess, logAIError } from '../utils/errorHandler'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface AnalyzedIssue {
  issueTitle: string
  score: number
  rationale: string
  occurrenceCount: number
  relatedMeetingIds: string[]
}

class InsightAgentService {
  /**
   * Initial full analysis - Run once to analyze all existing meetings
   */
  async analyzeAllMeetings(): Promise<{ success: boolean; insights?: any[]; error?: string }> {
    try {
      logAIInfo('Starting full meeting analysis for insights')

      // Fetch all transcripts with summaries and action items
      const transcripts = await Transcript.find({
        summaryText: { $exists: true, $ne: null },
      })
        .sort({ createdAt: 1 })
        .limit(100)
        .lean()

      if (transcripts.length === 0) {
        return { success: false, error: 'No transcripts found to analyze' }
      }

      logAIInfo(`Analyzing ${transcripts.length} transcripts`)

      // Prepare meeting data for OpenAI
      const meetingData = transcripts.map((t, idx) => ({
        id: String(t._id),
        date: t.createdAt,
        summary: t.summaryText || 'No summary available',
        actionItems: t.actionItems || [],
      }))

      // Create prompt for OpenAI
      const systemPrompt = `You are an expert nonprofit operations analyst. Your task is to analyze meeting transcripts and identify recurring issues, challenges, or themes that the organization faces.

For each issue you identify:
1. Provide a clear, concise title
2. Assign a score from 0-100 based on:
   - Urgency (how time-sensitive is this issue?)
   - Impact (how many people/programs are affected?)
   - Frequency (how often does it appear across meetings?)
3. Provide a brief rationale explaining the score
4. Count how many meetings mention this issue
5. List the meeting IDs where this issue appears

Focus on actionable, strategic issues rather than minor operational details.
Return your analysis as a JSON array of issues, sorted by score (highest first).
Limit to the top 5 most important issues.`

      const userPrompt = `Analyze these ${meetingData.length} nonprofit meeting summaries and identify the top 5 recurring issues:

${meetingData
  .map(
    (m, idx) => `
Meeting ${idx + 1} (ID: ${m.id}, Date: ${m.date}):
Summary: ${m.summary}
Action Items: ${m.actionItems.join('; ')}
`
  )
  .join('\n---\n')}

Return a JSON array with this structure:
[
  {
    "issueTitle": "string",
    "score": number (0-100),
    "rationale": "string",
    "occurrenceCount": number,
    "relatedMeetingIds": ["id1", "id2"]
  }
]`

      // Call OpenAI API
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('No response from OpenAI')
      }

      // Parse response
      const parsed = JSON.parse(content)
      const issues: AnalyzedIssue[] = parsed.issues || parsed.data || []

      if (!Array.isArray(issues) || issues.length === 0) {
        throw new Error('Invalid response format from OpenAI')
      }

      logAISuccess(`Identified ${issues.length} key issues`)

      // Save insights to database
      const savedInsights = []
      const now = new Date()

      for (const issue of issues) {
        const firstMeetingId = issue.relatedMeetingIds[0]
        const lastMeetingId = issue.relatedMeetingIds[issue.relatedMeetingIds.length - 1]

        const firstMeeting = transcripts.find((t) => String(t._id) === firstMeetingId)
        const lastMeeting = transcripts.find((t) => String(t._id) === lastMeetingId)

        const insight = await Insight.create({
          issueTitle: issue.issueTitle,
          score: issue.score,
          rationale: issue.rationale,
          occurrenceCount: issue.occurrenceCount,
          firstSeenDate: firstMeeting?.createdAt || now,
          lastSeenDate: lastMeeting?.createdAt || now,
          relatedMeetingIds: issue.relatedMeetingIds,
        })

        savedInsights.push(insight)
      }

      // Save context for incremental updates
      const contextSummary = `Analyzed ${transcripts.length} meetings. Key themes: ${issues
        .slice(0, 3)
        .map((i) => i.issueTitle)
        .join(', ')}`

      const lastTranscript = transcripts[transcripts.length - 1]
      if (lastTranscript) {
        await InsightContext.create({
          contextType: 'full_analysis',
          summary: contextSummary,
          totalMeetingsAnalyzed: transcripts.length,
          lastAnalyzedMeetingId: String(lastTranscript._id),
          lastAnalyzedDate: now,
        })
      }

      logAISuccess(`Saved ${savedInsights.length} insights to database`)

      return { success: true, insights: savedInsights }
    } catch (error: any) {
      logAIError(error, { operation: 'analyzeAllMeetings' })
      return { success: false, error: error.message }
    }
  }

  /**
   * Incremental update - Process a new meeting against existing insights
   */
  async processNewMeeting(transcriptId: string): Promise<{ success: boolean; error?: string }> {
    try {
      logAIInfo('Processing new meeting for insights', { transcriptId })

      // Fetch the new transcript
      const transcript = await Transcript.findById(transcriptId).lean()
      if (!transcript || !transcript.summaryText) {
        return { success: false, error: 'Transcript not found or has no summary' }
      }

      // Fetch existing insights
      const existingInsights = await Insight.find().sort({ score: -1 }).lean()

      if (existingInsights.length === 0) {
        logAIInfo('No existing insights found, skipping incremental update')
        return { success: true }
      }

      // Prepare prompt for incremental analysis
      const systemPrompt = `You are an expert nonprofit operations analyst. You are analyzing a new meeting transcript to update existing insights about recurring organizational issues.

Your task:
1. Determine if the new meeting relates to any existing issues
2. For each related issue, decide if the score should be updated (increase if issue is escalating, decrease if improving)
3. Identify any NEW issues not captured in existing insights
4. Provide updated rationales

Return a JSON object with:
- "updates": array of {issueId, newScore, newRationale, shouldUpdate: boolean}
- "newIssues": array of new issues with same structure as existing insights`

      const userPrompt = `New Meeting (ID: ${transcriptId}, Date: ${transcript.createdAt}):
Summary: ${transcript.summaryText}
Action Items: ${transcript.actionItems?.join('; ') || 'None'}

Existing Issues:
${existingInsights
  .map(
    (i, idx) => `
${idx + 1}. ${i.issueTitle} (ID: ${i._id}, Score: ${i.score})
   Rationale: ${i.rationale}
   Last seen: ${i.lastSeenDate}
`
  )
  .join('\n')}

Analyze if this new meeting relates to any existing issues or introduces new ones.
Return JSON with structure:
{
  "updates": [
    {
      "issueId": "string",
      "newScore": number,
      "newRationale": "string",
      "shouldUpdate": boolean,
      "isRelated": boolean
    }
  ],
  "newIssues": [
    {
      "issueTitle": "string",
      "score": number,
      "rationale": "string"
    }
  ]
}`

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('No response from OpenAI')
      }

      const parsed = JSON.parse(content)
      const updates = parsed.updates || []
      const newIssues = parsed.newIssues || []

      // Apply updates to existing insights
      for (const update of updates) {
        if (update.shouldUpdate && update.isRelated) {
          await Insight.findByIdAndUpdate(update.issueId, {
            $set: {
              score: update.newScore,
              rationale: update.newRationale,
              lastSeenDate: transcript.createdAt,
            },
            $inc: { occurrenceCount: 1 },
            $addToSet: { relatedMeetingIds: transcriptId },
          })
          logAIInfo(`Updated insight: ${update.issueId}`)
        }
      }

      // Create new insights
      for (const issue of newIssues) {
        await Insight.create({
          issueTitle: issue.issueTitle,
          score: issue.score,
          rationale: issue.rationale,
          occurrenceCount: 1,
          firstSeenDate: transcript.createdAt,
          lastSeenDate: transcript.createdAt,
          relatedMeetingIds: [transcriptId],
        })
        logAIInfo(`Created new insight: ${issue.issueTitle}`)
      }

      logAISuccess('Processed new meeting for insights', {
        updatedCount: updates.filter((u: any) => u.shouldUpdate).length,
        newIssuesCount: newIssues.length,
      })

      return { success: true }
    } catch (error: any) {
      logAIError(error, { operation: 'processNewMeeting', transcriptId })
      return { success: false, error: error.message }
    }
  }
}

export default InsightAgentService

