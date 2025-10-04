import { Router } from 'express'
import * as insightController from '../controllers/insightController'

const router = Router()

// Full analysis (first-time setup)
router.post('/analyze-all', insightController.analyzeAllMeetings)

// List all insights
router.get('/', insightController.listInsights)

// Get specific insight with solutions
router.get('/:id', insightController.getInsight)

// Process new meeting (incremental update)
router.post('/process-new-meeting/:transcriptId', insightController.processNewMeeting)

// Generate solutions for an issue
router.post('/:issueId/brainstorm', insightController.brainstormSolutions)

// Delete insight
router.delete('/:id', insightController.deleteInsight)

export default router

