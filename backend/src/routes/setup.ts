import express from 'express';
import {
  registerWebhook,
  listWebhooks,
  getWebhook,
  deleteWebhook,
  rotateWebhookSecret,
  getSetupStatus,
} from '../controllers/setupController';

const router = express.Router();

/**
 * Setup and webhook management routes
 */

// Get setup status and configuration
router.get('/status', getSetupStatus);

// Register or update webhook
router.post('/webhook', registerWebhook);

// List all webhooks
router.get('/webhooks', listWebhooks);

// Get webhook by ID
router.get('/webhooks/:id', getWebhook);

// Delete webhook by ID
router.delete('/webhooks/:id', deleteWebhook);

// Rotate webhook secret
router.post('/webhooks/:id/rotate-secret', rotateWebhookSecret);

export default router;

