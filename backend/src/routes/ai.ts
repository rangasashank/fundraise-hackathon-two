import express from 'express';
import {
  processTranscript,
  reprocessTranscript,
  getProcessingStatus,
  testAIAgents
} from '../controllers/aiController';

const router = express.Router();

/**
 * AI Processing Routes
 */

// Process transcript with AI agents manually
router.post('/process-transcript', processTranscript);

// Reprocess transcript with AI agents (force reprocessing)
router.post('/reprocess-transcript', reprocessTranscript);

// Get AI processing status for a transcript
router.get('/status/:transcriptId', getProcessingStatus);

// Test AI agents with sample text
router.post('/test', testAIAgents);

export default router;
