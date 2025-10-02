import { Request, Response } from 'express';
import crypto from 'crypto';
import WebhookEvent from '../models/WebhookEvent';
import NotetakerSession from '../models/NotetakerSession';
import Transcript from '../models/Transcript';
import nylasService from '../services/nylasService';

/**
 * Verify Nylas webhook signature
 */
const verifyWebhookSignature = (req: Request): boolean => {
  const webhookSecret = process.env.NYLAS_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    console.warn('NYLAS_WEBHOOK_SECRET not set - skipping signature verification');
    return true; // Allow in development
  }

  const signature = req.headers['x-nylas-signature'] as string;
  
  if (!signature) {
    console.error('No signature header found');
    return false;
  }

  const body = JSON.stringify(req.body);
  const hmac = crypto.createHmac('sha256', webhookSecret);
  hmac.update(body);
  const expectedSignature = hmac.digest('hex');

  return signature === expectedSignature;
};

/**
 * Handle Nylas webhook notifications
 */
export const handleWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    // Verify webhook signature
    if (!verifyWebhookSignature(req)) {
      console.error('Invalid webhook signature');
      res.status(401).json({ error: 'Invalid signature' });
      return;
    }

    const { id, type, data } = req.body;

    console.log(`Received webhook: ${type} (ID: ${id})`);

    // Store webhook event
    const webhookEvent = await WebhookEvent.create({
      eventId: id,
      eventType: type,
      notetakerId: data?.object?.id,
      payload: req.body,
      processed: false,
    });

    // Process webhook based on type
    try {
      await processWebhook(type, data, webhookEvent);
      
      // Mark as processed
      webhookEvent.processed = true;
      webhookEvent.processedAt = new Date();
      await webhookEvent.save();
    } catch (error: any) {
      console.error(`Error processing webhook ${id}:`, error);
      webhookEvent.errorMessage = error.message;
      webhookEvent.retryCount += 1;
      await webhookEvent.save();
    }

    // Always return 200 to Nylas
    res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('Error handling webhook:', error);
    // Still return 200 to prevent retries for malformed requests
    res.status(200).json({ received: true, error: error.message });
  }
};

/**
 * Process webhook based on type
 */
async function processWebhook(type: string, data: any, webhookEvent: any): Promise<void> {
  const notetakerId = data?.object?.id;

  if (!notetakerId) {
    console.warn('No notetaker ID in webhook data');
    return;
  }

  switch (type) {
    case 'notetaker.created':
      await handleNotetakerCreated(data);
      break;

    case 'notetaker.updated':
      await handleNotetakerUpdated(data);
      break;

    case 'notetaker.meeting_state':
      await handleMeetingState(data);
      break;

    case 'notetaker.media':
      await handleMediaAvailable(data);
      break;

    case 'notetaker.deleted':
      await handleNotetakerDeleted(data);
      break;

    default:
      console.log(`Unhandled webhook type: ${type}`);
  }
}

/**
 * Handle notetaker.created event
 */
async function handleNotetakerCreated(data: any): Promise<void> {
  const notetakerId = data.object.id;
  
  console.log(`Notetaker created: ${notetakerId}`);
  
  // Update session if it exists
  const session = await NotetakerSession.findOne({ notetakerId });
  if (session) {
    session.state = 'scheduled';
    await session.save();
  }
}

/**
 * Handle notetaker.updated event
 */
async function handleNotetakerUpdated(data: any): Promise<void> {
  const notetakerId = data.object.id;
  const state = data.object.state;
  
  console.log(`Notetaker updated: ${notetakerId}, state: ${state}`);
  
  const session = await NotetakerSession.findOne({ notetakerId });
  if (session) {
    session.state = state;
    await session.save();
  }
}

/**
 * Handle notetaker.meeting_state event
 */
async function handleMeetingState(data: any): Promise<void> {
  const notetakerId = data.object.id;
  const state = data.object.state;
  const meetingState = data.object.meeting_state;
  
  console.log(`Meeting state changed: ${notetakerId}, state: ${state}, meeting_state: ${meetingState}`);
  
  const session = await NotetakerSession.findOne({ notetakerId });
  if (session) {
    session.state = state;
    session.meetingState = meetingState;
    
    // Store additional metadata if available
    if (data.object.grant_id) session.grantId = data.object.grant_id;
    if (data.object.calendar_id) session.calendarId = data.object.calendar_id;
    if (data.object.event?.event_id) session.eventId = data.object.event.event_id;
    
    await session.save();
  }
}

/**
 * Handle notetaker.media event - Download and store transcript/media
 */
async function handleMediaAvailable(data: any): Promise<void> {
  const notetakerId = data.object.id;
  const mediaType = data.object.media_type;
  const mediaUrl = data.object.media_url;
  
  console.log(`Media available: ${notetakerId}, type: ${mediaType}, url: ${mediaUrl}`);
  
  // Find or create transcript record
  let transcript = await Transcript.findOne({ notetakerId });
  
  if (!transcript) {
    const session = await NotetakerSession.findOne({ notetakerId });
    if (!session) {
      console.error(`No session found for notetaker ${notetakerId}`);
      return;
    }
    
    transcript = await Transcript.create({
      notetakerId,
      sessionId: session._id,
      status: 'processing',
    });
  }

  // Download and store media based on type
  try {
    switch (mediaType) {
      case 'transcript':
        const transcriptText = await nylasService.downloadTextFile(mediaUrl);
        transcript.transcriptText = transcriptText;
        transcript.transcriptUrl = mediaUrl;
        break;

      case 'audio':
        transcript.audioUrl = mediaUrl;
        break;

      case 'video':
        transcript.videoUrl = mediaUrl;
        break;

      case 'summary':
        const summaryText = await nylasService.downloadTextFile(mediaUrl);
        transcript.summaryText = summaryText;
        transcript.summaryUrl = mediaUrl;
        break;

      case 'action_items':
        const actionItemsText = await nylasService.downloadTextFile(mediaUrl);
        // Parse action items (assuming they're newline-separated or JSON)
        try {
          const actionItems = JSON.parse(actionItemsText);
          transcript.actionItems = Array.isArray(actionItems) ? actionItems : [actionItemsText];
        } catch {
          // If not JSON, split by newlines
          transcript.actionItems = actionItemsText.split('\n').filter(item => item.trim());
        }
        transcript.actionItemsUrl = mediaUrl;
        break;

      default:
        console.log(`Unknown media type: ${mediaType}`);
    }

    // Add to media files array
    transcript.mediaFiles.push({
      type: mediaType,
      url: mediaUrl,
      downloadedAt: new Date(),
    });

    // Update status to completed if we have transcript
    if (transcript.transcriptText) {
      transcript.status = 'completed';
    }

    await transcript.save();
    
    console.log(`Successfully processed ${mediaType} for notetaker ${notetakerId}`);
  } catch (error: any) {
    console.error(`Error downloading ${mediaType}:`, error);
    transcript.status = 'partial';
    transcript.errorMessage = `Failed to download ${mediaType}: ${error.message}`;
    await transcript.save();
  }
}

/**
 * Handle notetaker.deleted event
 */
async function handleNotetakerDeleted(data: any): Promise<void> {
  const notetakerId = data.object.id;
  
  console.log(`Notetaker deleted: ${notetakerId}`);
  
  const session = await NotetakerSession.findOne({ notetakerId });
  if (session) {
    session.state = 'cancelled';
    await session.save();
  }
}

