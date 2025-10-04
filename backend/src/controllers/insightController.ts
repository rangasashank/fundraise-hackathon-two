import { Request, Response } from 'express'
import Insight from '../models/Insight'
import Solution from '../models/Solution'
import InsightAgentService from '../services/insightAgentService'
import BrainstormAgentService from '../services/brainstormAgentService'

const insightAgent = new InsightAgentService()
const brainstormAgent = new BrainstormAgentService()

/**
 * POST /api/insights/analyze-all
 * Trigger full analysis of all meetings (first-time setup)
 */
export const analyzeAllMeetings = async (req: Request, res: Response) => {
  try {
    console.log('🔍 Starting full meeting analysis...')
    const result = await insightAgent.analyzeAllMeetings()

    if (!result.success) {
      return res.status(500).json({ success: false, error: result.error })
    }

    res.json({
      success: true,
      message: `Successfully analyzed meetings and identified ${result.insights?.length || 0} key issues`,
      data: result.insights,
    })
  } catch (err: any) {
    console.error('analyzeAllMeetings error', err)
    res.status(500).json({ success: false, error: 'Failed to analyze meetings' })
  }
}

/**
 * GET /api/insights
 * Fetch all ranked issues
 */
export const listInsights = async (req: Request, res: Response) => {
  try {
    const insights = await Insight.find().sort({ score: -1 }).limit(50)
    res.json({ success: true, data: insights })
  } catch (err: any) {
    console.error('listInsights error', err)
    res.status(500).json({ success: false, error: 'Failed to fetch insights' })
  }
}

/**
 * GET /api/insights/:id
 * Fetch a specific issue with its solutions
 */
export const getInsight = async (req: Request, res: Response) => {
  try {
    const insight = await Insight.findById(req.params.id)
    if (!insight) {
      return res.status(404).json({ success: false, error: 'Insight not found' })
    }

    // Fetch associated solutions
    const solutions = await Solution.find({ insightId: req.params.id })

    res.json({
      success: true,
      data: {
        insight,
        solutions,
      },
    })
  } catch (err: any) {
    console.error('getInsight error', err)
    res.status(500).json({ success: false, error: 'Failed to fetch insight' })
  }
}

/**
 * POST /api/insights/process-new-meeting/:transcriptId
 * Process a new meeting for incremental insight updates
 */
export const processNewMeeting = async (req: Request, res: Response) => {
  try {
    const transcriptId = req.params.transcriptId
    if (!transcriptId) {
      return res.status(400).json({ success: false, error: 'Transcript ID is required' })
    }

    console.log(`🔄 Processing new meeting for insights: ${transcriptId}`)

    const result = await insightAgent.processNewMeeting(transcriptId)

    if (!result.success) {
      return res.status(500).json({ success: false, error: result.error })
    }

    res.json({
      success: true,
      message: 'Successfully processed new meeting for insights',
    })
  } catch (err: any) {
    console.error('processNewMeeting error', err)
    res.status(500).json({ success: false, error: 'Failed to process new meeting' })
  }
}

/**
 * POST /api/insights/:issueId/brainstorm
 * Generate solutions for a specific issue
 */
export const brainstormSolutions = async (req: Request, res: Response) => {
  try {
    const issueId = req.params.issueId
    if (!issueId) {
      return res.status(400).json({ success: false, error: 'Issue ID is required' })
    }

    const { regenerate } = req.body

    console.log(`💡 Generating solutions for issue: ${issueId}`)

    let result
    if (regenerate) {
      result = await brainstormAgent.regenerateSolutions(issueId)
    } else {
      result = await brainstormAgent.generateSolutions(issueId)
    }

    if (!result.success) {
      return res.status(500).json({ success: false, error: result.error })
    }

    res.json({
      success: true,
      message: `Successfully generated ${result.solutions?.length || 0} solutions`,
      data: result.solutions,
    })
  } catch (err: any) {
    console.error('brainstormSolutions error', err)
    res.status(500).json({ success: false, error: 'Failed to generate solutions' })
  }
}

/**
 * DELETE /api/insights/:id
 * Delete an insight and its solutions
 */
export const deleteInsight = async (req: Request, res: Response) => {
  try {
    const insight = await Insight.findByIdAndDelete(req.params.id)
    if (!insight) {
      return res.status(404).json({ success: false, error: 'Insight not found' })
    }

    // Delete associated solutions
    await Solution.deleteMany({ insightId: req.params.id })

    res.json({ success: true, message: 'Insight and solutions deleted successfully' })
  } catch (err: any) {
    console.error('deleteInsight error', err)
    res.status(500).json({ success: false, error: 'Failed to delete insight' })
  }
}

