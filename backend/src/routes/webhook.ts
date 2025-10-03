import express from 'express';
import { handleWebhook } from '../controllers/webhookController';

const router = express.Router();

// Comprehensive logging middleware for ALL webhook requests
router.use('/nylas', (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log('\n========================================');
  console.log(`[${timestamp}] WEBHOOK REQUEST RECEIVED`);
  console.log('========================================');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Full URL:', req.protocol + '://' + req.get('host') + req.originalUrl);
  console.log('IP Address:', req.ip || req.connection.remoteAddress);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Query Params:', JSON.stringify(req.query, null, 2));

  if (req.method === 'POST') {
    console.log('Body type:', typeof req.body);
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('Raw body available:', !!(req as any).rawBody);
    console.log('Raw body type:', typeof (req as any).rawBody);
  }

  console.log('========================================\n');
  next();
});

// Nylas webhook challenge verification (GET)
router.get('/nylas', (req, res) => {
  const challenge = req.query.challenge;
  if (!challenge) {
    console.error('❌ No challenge parameter received');
    return res.status(400).send('No challenge parameter received');
  }
  console.log('✅ Webhook challenge received:', challenge);
  console.log('✅ Responding with challenge value');
  res.setHeader('Content-Type', 'text/plain');
  res.send(challenge);
});

// Nylas webhook endpoint (POST)
router.post('/nylas', handleWebhook);

export default router;

