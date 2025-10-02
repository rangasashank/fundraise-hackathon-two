import { Request, Response } from 'express';
import nylasService from '../services/nylasService';
import NotetakerSession from '../models/NotetakerSession';
import Transcript from '../models/Transcript';

/**
 * Invite notetaker to a meeting
 */
export const inviteNotetaker = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      meetingLink,
      joinTime,
      name,
      enableSummary,
      enableActionItems,
      summaryInstructions,
      actionItemsInstructions,
    } = req.body;

    // Validate meeting link
    if (!meetingLink) {
      res.status(400).json({ error: 'Meeting link is required' });
      return;
    }

    // Validate meeting link format (basic check)
    const validProviders = ['zoom.us', 'meet.google.com', 'teams.microsoft.com'];
    const isValidLink = validProviders.some(provider => meetingLink.includes(provider));
    
    if (!isValidLink) {
      res.status(400).json({ 
        error: 'Invalid meeting link. Must be a Zoom, Google Meet, or Microsoft Teams link.' 
      });
      return;
    }

    // Invite notetaker via Nylas
    const notetaker = await nylasService.inviteNotetaker({
      meetingLink,
      joinTime,
      name,
      enableSummary,
      enableActionItems,
      summaryInstructions,
      actionItemsInstructions,
    });

    // Save session to database
    const session = await NotetakerSession.create({
      notetakerId: notetaker.id,
      meetingLink: notetaker.meeting_link,
      meetingProvider: notetaker.meeting_provider,
      name: notetaker.name,
      joinTime: notetaker.join_time,
      state: notetaker.state,
      meetingSettings: {
        audioRecording: notetaker.meeting_settings.audio_recording,
        videoRecording: notetaker.meeting_settings.video_recording,
        transcription: notetaker.meeting_settings.transcription,
        summary: notetaker.meeting_settings.summary,
        actionItems: notetaker.meeting_settings.action_items,
        summaryInstructions: notetaker.meeting_settings.summary_settings?.custom_instructions,
        actionItemsInstructions: notetaker.meeting_settings.action_items_settings?.custom_instructions,
      },
    });

    // Create initial transcript record
    await Transcript.create({
      notetakerId: notetaker.id,
      sessionId: session._id,
      status: 'processing',
    });

    res.status(201).json({
      success: true,
      data: {
        session,
        notetaker,
      },
    });
  } catch (error: any) {
    console.error('Error in inviteNotetaker:', error);
    res.status(error.message.includes('authentication') ? 401 : 500).json({
      error: error.message || 'Failed to invite notetaker',
    });
  }
};

/**
 * Get all notetaker sessions
 */
export const getSessions = async (req: Request, res: Response): Promise<void> => {
  try {
    const sessions = await NotetakerSession.find()
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      success: true,
      data: sessions,
    });
  } catch (error: any) {
    console.error('Error in getSessions:', error);
    res.status(500).json({
      error: 'Failed to fetch sessions',
    });
  }
};

/**
 * Get specific session by ID
 */
export const getSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const session = await NotetakerSession.findById(id);

    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    res.json({
      success: true,
      data: session,
    });
  } catch (error: any) {
    console.error('Error in getSession:', error);
    res.status(500).json({
      error: 'Failed to fetch session',
    });
  }
};

/**
 * Cancel a scheduled notetaker
 */
export const cancelNotetaker = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const session = await NotetakerSession.findById(id);

    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    // Cancel via Nylas
    await nylasService.cancelNotetaker(session.notetakerId);

    // Update session state
    session.state = 'cancelled';
    await session.save();

    res.json({
      success: true,
      message: 'Notetaker cancelled successfully',
      data: session,
    });
  } catch (error: any) {
    console.error('Error in cancelNotetaker:', error);
    res.status(500).json({
      error: error.message || 'Failed to cancel notetaker',
    });
  }
};

/**
 * Remove notetaker from active meeting
 */
export const removeNotetaker = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const session = await NotetakerSession.findById(id);

    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    // Remove via Nylas
    await nylasService.removeNotetaker(session.notetakerId);

    // Update session state
    session.state = 'disconnected';
    session.meetingState = 'api_request';
    await session.save();

    res.json({
      success: true,
      message: 'Notetaker removed from meeting',
      data: session,
    });
  } catch (error: any) {
    console.error('Error in removeNotetaker:', error);
    res.status(500).json({
      error: error.message || 'Failed to remove notetaker',
    });
  }
};

/**
 * Get all transcripts
 */
export const getTranscripts = async (req: Request, res: Response): Promise<void> => {
  try {
    const transcripts = await Transcript.find()
      .populate('sessionId')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      success: true,
      data: transcripts,
    });
  } catch (error: any) {
    console.error('Error in getTranscripts:', error);
    res.status(500).json({
      error: 'Failed to fetch transcripts',
    });
  }
};

/**
 * Get specific transcript by ID
 */
export const getTranscript = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const transcript = await Transcript.findById(id).populate('sessionId');

    if (!transcript) {
      res.status(404).json({ error: 'Transcript not found' });
      return;
    }

    res.json({
      success: true,
      data: transcript,
    });
  } catch (error: any) {
    console.error('Error in getTranscript:', error);
    res.status(500).json({
      error: 'Failed to fetch transcript',
    });
  }
};

/**
 * Get transcript by notetaker ID
 */
export const getTranscriptByNotetakerId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { notetakerId } = req.params;

    const transcript = await Transcript.findOne({ notetakerId }).populate('sessionId');

    if (!transcript) {
      res.status(404).json({ error: 'Transcript not found' });
      return;
    }

    res.json({
      success: true,
      data: transcript,
    });
  } catch (error: any) {
    console.error('Error in getTranscriptByNotetakerId:', error);
    res.status(500).json({
      error: 'Failed to fetch transcript',
    });
  }
};

