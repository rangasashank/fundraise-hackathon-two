import express from 'express';
import {
  sessionUpdatesSSE,
  getSSEStatus,
  sendTestUpdate
} from '../controllers/sseController';

const router = express.Router();

/**
 * Server-Sent Events routes for real-time updates
 */

// SSE endpoint for session updates
router.get('/sessions', sessionUpdatesSSE);

// Get SSE connection status
router.get('/status', getSSEStatus);

// Send test update (for debugging)
router.post('/test', sendTestUpdate);

export default router;
