import OpenAI from 'openai'
import Insight from '../models/Insight'
import Solution from '../models/Solution'
import Transcript from '../models/Transcript'
import { logAIInfo, logAISuccess, logAIError } from '../utils/errorHandler'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface GeneratedSolution {
  title: string
  description: string
  expectedImpact: string
  nextSteps: string[]
}

class BrainstormAgentService {
  /**
   * Generate practical solutions for a specific issue
   */
  async generateSolutions(
    insightId: string
  ): Promise<{ success: boolean; solutions?: any[]; error?: string }> {
    try {
      logAIInfo('Generating solutions for insight', { insightId })

      // Fetch the insight
      const insight = await Insight.findById(insightId).lean()
      if (!insight) {
        return { success: false, error: 'Insight not found' }
      }

      // Check if solutions already exist (caching)
      const existingSolutions = await Solution.find({ insightId }).lean()
      if (existingSolutions.length > 0) {
        logAIInfo('Returning cached solutions', { count: existingSolutions.length })
        return { success: true, solutions: existingSolutions }
      }

      // Fetch related meeting transcripts for context
      const relatedTranscripts = await Transcript.find({
        _id: { $in: insight.relatedMeetingIds },
      })
        .select('summaryText actionItems createdAt')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean()

      // Prepare context from meetings
      const meetingContext = relatedTranscripts
        .map(
          (t, idx) => `
Meeting ${idx + 1} (${new Date(t.createdAt).toLocaleDateString()}):
Summary: ${t.summaryText || 'No summary'}
Action Items: ${t.actionItems?.join('; ') || 'None'}
`
        )
        .join('\n---\n')

      // Create prompt for OpenAI
      const systemPrompt = `You are an expert nonprofit consultant specializing in practical, actionable solutions. Your task is to generate 2-3 concrete solution ideas for organizational challenges.

For each solution, provide:
1. A clear, actionable title
2. A detailed description (2-3 sentences) explaining the solution
3. Expected impact (what outcomes can be expected)
4. 3-5 specific next steps to implement the solution

Focus on:
- Practical, implementable solutions (not just high-level strategies)
- Solutions appropriate for nonprofit organizations with limited resources
- Measurable outcomes and clear action steps
- Building on what the organization is already doing (based on meeting context)

Return your solutions as a JSON array.`

      const userPrompt = `Issue: ${insight.issueTitle}
Score: ${insight.score}/100
Rationale: ${insight.rationale}
Occurrences: ${insight.occurrenceCount} meetings
Date Range: ${new Date(insight.firstSeenDate).toLocaleDateString()} - ${new Date(
        insight.lastSeenDate
      ).toLocaleDateString()}

Context from Related Meetings:
${meetingContext}

Generate 2-3 practical solution ideas for this issue. Return JSON with structure:
{
  "solutions": [
    {
      "title": "string",
      "description": "string",
      "expectedImpact": "string",
      "nextSteps": ["step1", "step2", "step3"]
    }
  ]
}`

      // Call OpenAI API
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('No response from OpenAI')
      }

      // Parse response
      const parsed = JSON.parse(content)
      const solutions: GeneratedSolution[] = parsed.solutions || []

      if (!Array.isArray(solutions) || solutions.length === 0) {
        throw new Error('Invalid response format from OpenAI')
      }

      logAISuccess(`Generated ${solutions.length} solutions`)

      // Save solutions to database
      const savedSolutions = []
      for (const solution of solutions) {
        const saved = await Solution.create({
          insightId,
          title: solution.title,
          description: solution.description,
          expectedImpact: solution.expectedImpact,
          nextSteps: solution.nextSteps,
        })
        savedSolutions.push(saved)
      }

      logAISuccess(`Saved ${savedSolutions.length} solutions to database`)

      return { success: true, solutions: savedSolutions }
    } catch (error: any) {
      logAIError(error, { operation: 'generateSolutions', insightId })
      return { success: false, error: error.message }
    }
  }

  /**
   * Regenerate solutions (clear cache and generate new ones)
   */
  async regenerateSolutions(
    insightId: string
  ): Promise<{ success: boolean; solutions?: any[]; error?: string }> {
    try {
      // Delete existing solutions
      await Solution.deleteMany({ insightId })
      logAIInfo('Cleared existing solutions', { insightId })

      // Generate new solutions
      return await this.generateSolutions(insightId)
    } catch (error: any) {
      logAIError(error, { operation: 'regenerateSolutions', insightId })
      return { success: false, error: error.message }
    }
  }
}

export default BrainstormAgentService

