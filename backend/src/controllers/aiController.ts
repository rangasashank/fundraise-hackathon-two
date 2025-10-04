import { Request, Response } from 'express';
import Transcript from '../models/Transcript';
import TranscriptProcessingService from '../services/transcriptProcessingService';
import AIAgentsService from '../services/aiAgentsService';
import { ManualProcessingRequest, ManualProcessingResponse } from '../types/aiAgents';

/**
 * AI Controller
 * Handles API endpoints for AI-powered transcript processing
 */

/**
 * Process transcript with AI agents manually
 * POST /api/ai/process-transcript
 */
export const processTranscript = async (req: Request, res: Response): Promise<void> => {
  try {
    const { transcriptId, processSummary = true, processActionItems = true }: ManualProcessingRequest = req.body;

    // Validate request
    if (!transcriptId) {
      res.status(400).json({
        success: false,
        error: 'Transcript ID is required'
      });
      return;
    }

    // Find the transcript
    const transcript = await Transcript.findById(transcriptId);
    if (!transcript) {
      res.status(404).json({
        success: false,
        error: 'Transcript not found'
      });
      return;
    }

    // Check if transcript has text content
    if (!transcript.transcriptText || transcript.transcriptText.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: 'Transcript has no text content to process'
      });
      return;
    }

    console.log(`🤖 Manual AI processing requested for transcript ${transcriptId}`);

    const transcriptProcessingService = new TranscriptProcessingService();
    const aiAgentsService = new AIAgentsService();

    let summaryResult = null;
    let actionItemsResult = null;

    // Process summary if requested
    if (processSummary) {
      console.log(`📝 Processing summary for transcript ${transcriptId}`);
      summaryResult = await aiAgentsService.generateSummary(transcript.transcriptText);
      
      if (summaryResult.success) {
        transcript.summaryText = summaryResult.summary;
        console.log(`✅ Summary generated for transcript ${transcriptId}`);
      } else {
        console.error(`❌ Summary generation failed for transcript ${transcriptId}:`, summaryResult.error);
      }
    }

    // Process action items if requested
    if (processActionItems) {
      console.log(`📋 Processing action items for transcript ${transcriptId}`);
      actionItemsResult = await aiAgentsService.extractActionItems(transcript.transcriptText);
      
      if (actionItemsResult.success) {
        transcript.actionItems = actionItemsResult.actionItems;
        console.log(`✅ Action items extracted for transcript ${transcriptId} (${actionItemsResult.actionItems.length} items)`);
      } else {
        console.error(`❌ Action items extraction failed for transcript ${transcriptId}:`, actionItemsResult.error);
      }
    }

    // Save the updated transcript
    await transcript.save();

    const response: ManualProcessingResponse = {
      success: true,
      transcriptId,
      summary: summaryResult || undefined,
      actionItems: actionItemsResult || undefined
    };

    res.json(response);

  } catch (error: any) {
    console.error('Error in manual AI processing:', error.message);
    res.status(500).json({
      success: false,
      transcriptId: req.body.transcriptId,
      error: `Failed to process transcript: ${error.message}`
    });
  }
};

/**
 * Reprocess transcript with AI agents (force reprocessing)
 * POST /api/ai/reprocess-transcript
 */
export const reprocessTranscript = async (req: Request, res: Response): Promise<void> => {
  try {
    const { transcriptId } = req.body;

    if (!transcriptId) {
      res.status(400).json({
        success: false,
        error: 'Transcript ID is required'
      });
      return;
    }

    console.log(`🔄 Force reprocessing transcript ${transcriptId}`);

    const transcriptProcessingService = new TranscriptProcessingService();
    const result = await transcriptProcessingService.reprocessTranscript(transcriptId);

    if (result) {
      res.json({
        success: true,
        transcriptId,
        summary: result.summary,
        actionItems: result.actionItems,
        processedAt: result.processedAt
      });
    } else {
      res.status(400).json({
        success: false,
        transcriptId,
        error: 'Failed to reprocess transcript'
      });
    }

  } catch (error: any) {
    console.error('Error in transcript reprocessing:', error.message);
    res.status(500).json({
      success: false,
      transcriptId: req.body.transcriptId,
      error: `Failed to reprocess transcript: ${error.message}`
    });
  }
};

/**
 * Get AI processing status for a transcript
 * GET /api/ai/status/:transcriptId
 */
export const getProcessingStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { transcriptId } = req.params;

    const transcript = await Transcript.findById(transcriptId);
    if (!transcript) {
      res.status(404).json({
        success: false,
        error: 'Transcript not found'
      });
      return;
    }

    const status = {
      transcriptId,
      hasTranscriptText: !!transcript.transcriptText,
      hasSummary: !!transcript.summaryText,
      hasActionItems: !!(transcript.actionItems && transcript.actionItems.length > 0),
      status: transcript.status,
      errorMessage: transcript.errorMessage,
      createdAt: transcript.createdAt,
      updatedAt: transcript.updatedAt
    };

    res.json({
      success: true,
      ...status
    });

  } catch (error: any) {
    console.error('Error getting processing status:', error.message);
    res.status(500).json({
      success: false,
      error: `Failed to get processing status: ${error.message}`
    });
  }
};

/**
 * Test AI agents with sample text
 * POST /api/ai/test
 */
export const testAIAgents = async (req: Request, res: Response): Promise<void> => {
  try {
    const { text, testSummary = true, testActionItems = true } = req.body;

    if (!text || text.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: 'Text content is required for testing'
      });
      return;
    }

    console.log(`🧪 Testing AI agents with sample text (${text.length} chars)`);

    const aiAgentsService = new AIAgentsService();
    const results: any = {};

    if (testSummary) {
      console.log('🤖 Testing Summary Agent...');
      results.summary = await aiAgentsService.generateSummary(text);
    }

    if (testActionItems) {
      console.log('🤖 Testing Action Items Agent...');
      results.actionItems = await aiAgentsService.extractActionItems(text);
    }

    res.json({
      success: true,
      results,
      testText: text.substring(0, 200) + (text.length > 200 ? '...' : '')
    });

  } catch (error: any) {
    console.error('Error testing AI agents:', error.message);
    res.status(500).json({
      success: false,
      error: `Failed to test AI agents: ${error.message}`
    });
  }
};
