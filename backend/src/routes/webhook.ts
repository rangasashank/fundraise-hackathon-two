import express from 'express';
import { handleWebhook } from '../controllers/webhookController';

const router = express.Router();

// Nylas webhook endpoint
router.post('/nylas', handleWebhook);

export default router;

