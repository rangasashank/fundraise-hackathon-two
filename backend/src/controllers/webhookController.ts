import { Request, Response } from 'express';
import crypto from 'crypto';
import NotetakerSession from '../models/NotetakerSession';
import Transcript from '../models/Transcript';
import nylasService from '../services/nylasService';
import { emitSessionUpdate, emitTranscriptUpdate } from './sseController';

/**
 * Verify Nylas webhook signature
 */
const verifyWebhookSignature = (req: Request): boolean => {
  const webhookSecret = process.env.NYLAS_WEBHOOK_SECRET;
  const skipVerification = process.env.SKIP_WEBHOOK_VERIFICATION === 'true';

  if (skipVerification) {
    console.warn('🔐 SKIP_WEBHOOK_VERIFICATION=true - bypassing signature verification');
    return true;
  }

  if (!webhookSecret) {
    console.warn('🔐 NYLAS_WEBHOOK_SECRET not set - skipping signature verification');
    return true; // Allow in development
  }

  const signature = req.headers['x-nylas-signature'] as string;

  if (!signature) {
    console.error('🔐 No signature header found');
    return false;
  }

  // Use raw body if available, otherwise fall back to stringified JSON
  const body = (req as any).rawBody || JSON.stringify(req.body);

  console.log('🔐 Signature verification details:');
  console.log('   Received signature:', signature);
  console.log('   Webhook secret length:', webhookSecret.length);
  console.log('   Body type:', typeof body);
  console.log('   Body length:', body.length);

  const hmac = crypto.createHmac('sha256', webhookSecret);
  hmac.update(body, 'utf8');
  const expectedSignature = hmac.digest('hex');

  console.log('   Expected signature:', expectedSignature);
  console.log('   Signatures match:', signature === expectedSignature);

  return signature === expectedSignature;
};

/**
 * Handle Nylas webhook notifications
 */
export const handleWebhook = async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();
  console.log('\n🔔 ===== PROCESSING WEBHOOK =====');

  try {
    // Log raw request details
    console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
    console.log('🔑 Signature header:', req.headers['x-nylas-signature']);

    // Verify webhook signature
    const signatureValid = verifyWebhookSignature(req);
    console.log(`🔐 Signature verification: ${signatureValid ? '✅ VALID' : '❌ INVALID'}`);

    if (!signatureValid) {
      console.error('❌ Invalid webhook signature - rejecting request');
      res.status(401).json({ error: 'Invalid signature' });
      return;
    }

    const { id, type, data } = req.body;

    if (!id || !type) {
      console.error('❌ Missing required fields (id or type) in webhook body');
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    console.log(`📨 Webhook Type: ${type}`);
    console.log(`🆔 Webhook ID: ${id}`);
    console.log(`🤖 Notetaker ID: ${data?.object?.id || 'N/A'}`);

    // Process webhook based on type (no longer storing raw webhook events)
    try {
      console.log(`⚙️  Processing webhook type: ${type}...`);
      await processWebhook(type, data);

      const duration = Date.now() - startTime;
      console.log(`✅ Webhook processed successfully in ${duration}ms`);
    } catch (error: any) {
      console.error(`❌ Error processing webhook ${id}:`, error);
      console.error('Stack trace:', error.stack);
    }

    console.log('🔔 ===== WEBHOOK PROCESSING COMPLETE =====\n');

    // Always return 200 to Nylas
    res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('❌ CRITICAL ERROR handling webhook:', error);
    console.error('Stack trace:', error.stack);
    // Still return 200 to prevent retries for malformed requests
    res.status(200).json({ received: true, error: error.message });
  }
};

/**
 * Process webhook based on type
 */
async function processWebhook(type: string, data: any): Promise<void> {
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
      console.log('Webhook data:', JSON.stringify(data, null, 2));

      // Check if this unhandled webhook contains transcript data
      if (data?.object?.transcript || data?.transcript) {
        console.log('⚠️  Unhandled webhook contains transcript data - processing as media event');
        await handleMediaAvailable(data);
      }
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
  console.log('Full webhook data:', JSON.stringify(data, null, 2));

  const session = await NotetakerSession.findOne({ notetakerId });
  if (session) {
    // Update state - Nylas v3 states map directly to our model
    session.state = state;

    // Store additional metadata if available
    if (data.object.grant_id) session.grantId = data.object.grant_id;
    if (data.object.calendar_id) session.calendarId = data.object.calendar_id;
    if (data.object.event?.event_id) session.eventId = data.object.event.event_id;

    await session.save();
    console.log(`Updated session ${session._id} to state: ${state}`);

    // Emit SSE update to connected clients
    emitSessionUpdate({
      notetakerId,
      state,
      sessionId: session._id,
      meetingState: session.meetingState,
      timestamp: new Date().toISOString()
    });
  } else {
    console.warn(`No session found for notetaker ${notetakerId}`);
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
  console.log('Full meeting state data:', JSON.stringify(data, null, 2));

  const session = await NotetakerSession.findOne({ notetakerId });
  if (session) {
    // Update both state and meeting_state
    session.state = state;
    session.meetingState = meetingState;

    // Store additional metadata if available
    if (data.object.grant_id) session.grantId = data.object.grant_id;
    if (data.object.calendar_id) session.calendarId = data.object.calendar_id;
    if (data.object.event?.event_id) session.eventId = data.object.event.event_id;

    await session.save();
    console.log(`Updated session ${session._id} - state: ${state}, meeting_state: ${meetingState}`);

    // Emit SSE update to connected clients
    emitSessionUpdate({
      notetakerId,
      state,
      sessionId: session._id,
      meetingState,
      timestamp: new Date().toISOString()
    });
  } else {
    console.warn(`No session found for notetaker ${notetakerId}`);
  }
}

/**
 * Handle notetaker.media event - Download and store transcript/media
 * Nylas v3 sends all media URLs in a single webhook with a 'media' object
 */
async function handleMediaAvailable(data: any): Promise<void> {
  const notetakerId = data.object.id;
  const mediaState = data.object.state; // 'processing', 'available', 'error', 'deleted'
  const media = data.object.media;

  console.log(`Media event received: ${notetakerId}, state: ${mediaState}`);
  console.log('Media data:', JSON.stringify(data, null, 2));

  // Check if transcript data is directly in the webhook payload (alternative format)
  const directTranscript = data.object.transcript || data.transcript;
  if (directTranscript && !media?.transcript) {
    console.log('📝 Found transcript data directly in webhook payload');
    // Create a synthetic media object for consistent processing
    if (!data.object.media) {
      data.object.media = {};
    }
    data.object.media.transcript = directTranscript;
  }

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

  // Update status based on media state
  if (mediaState === 'processing') {
    transcript.status = 'processing';
    await transcript.save();
    console.log(`Transcript ${transcript._id} is processing`);
    return;
  }

  if (mediaState === 'error') {
    transcript.status = 'failed';
    transcript.errorMessage = 'Nylas encountered an error while processing the recording';
    await transcript.save();
    console.error(`Transcript ${transcript._id} failed processing`);
    return;
  }

  if (mediaState === 'deleted') {
    transcript.status = 'failed';
    transcript.errorMessage = 'Media was deleted';
    await transcript.save();
    console.log(`Transcript ${transcript._id} media was deleted`);
    return;
  }

  // Process available media
  if (mediaState === 'available' && media) {
    try {
      // Handle transcript data (can be URL or direct object)
      if (media.transcript) {
        console.log(`Processing transcript data:`, typeof media.transcript);
        try {
          let transcriptText: string;

          if (typeof media.transcript === 'string') {
            // Transcript is a URL - download it
            console.log(`Downloading transcript from URL: ${media.transcript}`);
            const downloadedContent = await nylasService.downloadTextFile(media.transcript);
            transcript.transcriptUrl = media.transcript;

            // Check if downloaded content is JSON (structured transcript)
            try {
              const parsedContent = JSON.parse(downloadedContent);
              console.log(`📋 Parsed downloaded content:`, JSON.stringify(parsedContent, null, 2));
              console.log(`📋 parsedContent.transcript type:`, typeof parsedContent.transcript);
              console.log(`📋 parsedContent.transcript isArray:`, Array.isArray(parsedContent.transcript));

              if (parsedContent.transcript && Array.isArray(parsedContent.transcript)) {
                // Downloaded content is structured transcript - extract speaker-labeled text
                console.log(`✅ Downloaded content is structured transcript with ${parsedContent.transcript.length} segments`);
                transcriptText = parsedContent.transcript
                  .map((segment: any) => {
                    console.log(`📝 Processing segment:`, segment);
                    return `${segment.speaker}: ${segment.text}`;
                  })
                  .join('\n\n');
                console.log(`✅ Extracted transcript text (${transcriptText.length} chars):`, transcriptText.substring(0, 200) + '...');
              } else if (parsedContent.object === 'transcript' && parsedContent.transcript) {
                // Alternative structure check - sometimes the transcript array might be nested differently
                console.log(`🔄 Trying alternative transcript structure extraction`);
                const transcriptData = parsedContent.transcript;
                if (Array.isArray(transcriptData)) {
                  transcriptText = transcriptData
                    .map((segment: any) => `${segment.speaker}: ${segment.text}`)
                    .join('\n\n');
                } else {
                  console.warn(`⚠️  Transcript data is not an array:`, transcriptData);
                  transcriptText = JSON.stringify(parsedContent, null, 2);
                }
              } else {
                // Downloaded content is JSON but not in expected format
                console.warn(`⚠️  Downloaded JSON not in expected transcript format. Keys:`, Object.keys(parsedContent));
                transcriptText = JSON.stringify(parsedContent, null, 2);
              }
            } catch (parseError) {
              // Downloaded content is plain text
              console.log(`📄 Downloaded content is plain text (not JSON):`, parseError);
              transcriptText = downloadedContent;
            }
          } else if (typeof media.transcript === 'object' && media.transcript.transcript) {
            // Transcript is a structured object - extract text
            console.log(`Processing structured transcript object`);
            const transcriptData = media.transcript.transcript;

            if (Array.isArray(transcriptData)) {
              // Speaker-labeled transcript format
              transcriptText = transcriptData
                .map((segment: any) => `${segment.speaker}: ${segment.text}`)
                .join('\n\n');
            } else {
              // Fallback to string representation
              transcriptText = JSON.stringify(transcriptData, null, 2);
            }
          } else {
            // Fallback - convert object to string
            transcriptText = JSON.stringify(media.transcript, null, 2);
          }

          // Ensure transcriptText is always a string and never [object Object]
          if (typeof transcriptText !== 'string') {
            console.error(`❌ transcriptText is not a string! Type: ${typeof transcriptText}`, transcriptText);
            transcriptText = JSON.stringify(transcriptText, null, 2);
          }

          // Additional safety check for [object Object]
          if (transcriptText === '[object Object]') {
            console.error(`❌ transcriptText is '[object Object]' - this should not happen!`);
            transcriptText = 'Error: Failed to extract transcript text from downloaded content';
          }

          console.log(`💾 Storing transcript text (${transcriptText.length} chars):`, transcriptText.substring(0, 100) + '...');
          transcript.transcriptText = transcriptText;
          transcript.mediaFiles.push({
            type: 'transcript',
            url: transcript.transcriptUrl || 'embedded',
            downloadedAt: new Date(),
          });
          console.log(`Successfully processed transcript (${transcriptText.length} chars)`);
        } catch (error: any) {
          console.error('Error processing transcript:', error);
        }
      }

      // Store audio recording URL
      if (media.recording) {
        console.log(`Audio recording available at: ${media.recording}`);
        transcript.audioUrl = media.recording;
        transcript.mediaFiles.push({
          type: 'audio',
          url: media.recording,
          downloadedAt: new Date(),
        });
      }

      // Store video recording URL (if available)
      if (media.video_recording) {
        console.log(`Video recording available at: ${media.video_recording}`);
        transcript.videoUrl = media.video_recording;
        transcript.mediaFiles.push({
          type: 'video',
          url: media.video_recording,
          downloadedAt: new Date(),
        });
      }

      // Note: Summary and action items download logic removed since they are disabled in the invitation flow

      // Store recording duration if available
      if (media.recording_duration) {
        transcript.duration = parseInt(media.recording_duration, 10);
      }

      // Update status to completed if we have transcript
      if (transcript.transcriptText) {
        transcript.status = 'completed';
        console.log(`Transcript ${transcript._id} completed successfully`);
      } else {
        transcript.status = 'partial';
        console.warn(`Transcript ${transcript._id} is partial - no transcript text available`);
      }

      await transcript.save();

      // Emit SSE update for transcript
      emitTranscriptUpdate({
        notetakerId,
        sessionId: transcript.sessionId,
        status: transcript.status,
        hasTranscript: !!transcript.transcriptText,
        hasSummary: false, // Summary processing disabled
        hasActionItems: false, // Action items processing disabled
        timestamp: new Date().toISOString()
      });

      console.log(`Successfully processed media for notetaker ${notetakerId}`);
    } catch (error: any) {
      console.error('Error processing media:', error);
      transcript.status = 'partial';
      transcript.errorMessage = `Failed to process media: ${error.message}`;
      await transcript.save();
    }
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

