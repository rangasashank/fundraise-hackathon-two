import AIAgentsService from './aiAgentsService';
import Transcript from '../models/Transcript';
import Task from '../models/Task';
import { TranscriptProcessingResult } from '../types/aiAgents';
import { logAIError, logAISuccess, logAIInfo, logAIWarning } from '../utils/errorHandler';


// Helper: create Task documents from action items
async function createTasksFromActionItems(transcript: any, actionItems: string[]) {
  try {
    const parse = (item: string) => {
      const match = item.match(/^(.+?)\s*\(([^)]+?)(?:\s*-\s*([^)]+))?\)\s*$/)
      let title = item.trim()
      let assignee: string | undefined
      let dueDate: Date | undefined
      if (match && match[1]) {
        title = match[1].trim()
        assignee = match[2]?.trim()
        const dueStr = match[3]?.trim()
        if (dueStr) {
          try {
            const parsed = new Date(dueStr)
            // Only set dueDate if it's a valid date
            if (!isNaN(parsed.getTime()) && parsed.getFullYear() > 1970) {
              dueDate = parsed
            }
          } catch (e) {
            // Invalid date string, skip it
          }
        }
      }
      return { title, assignee, dueDate }
    }

    const docs = actionItems.map((text, idx) => {
      const { title, assignee, dueDate } = parse(text)
      return {
        title,
        description: `From transcript ${transcript._id}`,
        status: idx % 3 === 0 ? 'in-progress' : 'todo',
        priority: idx === 0 ? 'high' : idx === 1 ? 'medium' : 'low',
        assignee,
        dueDate,
        meetingId: transcript.sessionId,
        transcriptId: transcript._id,
      }
    })

    if (docs.length > 0) {
      await Task.insertMany(docs)
      logAISuccess('Created tasks from action items', {
        transcriptId: String(transcript._id),
        count: docs.length,
      })
    }
  } catch (error) {
    logAIError(error as any, { operation: 'createTasksFromActionItems', transcriptId: String(transcript._id) })
  }
}

/**
 * Transcript Processing Service
 * Handles the integration between transcript data and AI agents
 */
class TranscriptProcessingService {
  private aiAgentsService: AIAgentsService;

  constructor() {
    this.aiAgentsService = new AIAgentsService();
  }

  /**
   * Process transcript with AI agents and update the database
   * This method is called when a transcript becomes available
   */
  async processTranscriptWithAI(transcriptId: string): Promise<TranscriptProcessingResult | null> {
    try {
      logAIInfo('Starting AI processing for transcript', { transcriptId });

      // Find the transcript in the database
      const transcript = await Transcript.findById(transcriptId);
      if (!transcript) {
        logAIError(new Error(`Transcript ${transcriptId} not found`), {
          operation: 'processTranscriptWithAI',
          transcriptId
        });
        return null;
      }

      // Check if transcript text is available
      if (!transcript.transcriptText || transcript.transcriptText.trim().length === 0) {
        logAIWarning('Transcript has no text content - skipping AI processing', {
          transcriptId,
          hasText: !!transcript.transcriptText,
          textLength: transcript.transcriptText?.length
        });
        return null;
      }

      // Check if AI processing has already been completed
      if (transcript.summaryText && transcript.actionItems && transcript.actionItems.length > 0) {
        logAIInfo('Transcript already has AI-generated content - skipping reprocessing', {
          transcriptId,
          hasSummary: !!transcript.summaryText,
          actionItemsCount: transcript.actionItems.length
        });
        return {
          summary: { summary: transcript.summaryText, success: true },
          actionItems: { actionItems: transcript.actionItems, success: true },
          transcriptId,
          processedAt: new Date()
        };
      }

      logAIInfo('Processing transcript with AI agents', {
        transcriptId,
        textLength: transcript.transcriptText.length
      });

      // Process with both AI agents
      const result = await this.aiAgentsService.processTranscript(transcript.transcriptText, transcriptId);

      // Update the transcript with AI-generated content
      let updated = false;

      if (result.summary.success && result.summary.summary) {
        transcript.summaryText = result.summary.summary;
        updated = true;
        logAISuccess('Summary generated for transcript', {
          transcriptId,
          summaryLength: result.summary.summary.length
        });
      } else {
        logAIError(new Error(`Failed to generate summary: ${result.summary.error}`), {
          operation: 'generateSummary',
          transcriptId,
          error: result.summary.error
        });
      }

      if (result.actionItems.success && result.actionItems.actionItems.length > 0) {
        transcript.actionItems = result.actionItems.actionItems;
        updated = true;
        logAISuccess('Action items extracted for transcript', {
          transcriptId,
          actionItemsCount: result.actionItems.actionItems.length
        });
      } else {
        if (result.actionItems.error) {
          logAIWarning('No action items found for transcript', {
            transcriptId,
            error: result.actionItems.error
          });
        } else {
          logAIInfo('No action items found in transcript (normal case)', { transcriptId });
        }
        // Set empty array if no action items found (this is not an error)
        transcript.actionItems = [];
        updated = true;
      }

      // Save the updated transcript
      if (updated) {
        await transcript.save();
        logAISuccess('Updated transcript with AI-generated content', {
          transcriptId,
          hasSummary: !!transcript.summaryText,
          actionItemsCount: transcript.actionItems?.length || 0
        });
        // Create Task documents for extracted action items (once)
        if (result.actionItems.success && result.actionItems.actionItems.length > 0) {
          await createTasksFromActionItems(transcript, result.actionItems.actionItems)
        }
      }

      return result;

    } catch (error: any) {
      logAIError(error, {
        operation: 'processTranscriptWithAI',
        transcriptId
      });

      // Try to update the transcript with error information
      try {
        const transcript = await Transcript.findById(transcriptId);
        if (transcript) {
          transcript.errorMessage = `AI processing failed: ${error.message}`;
          await transcript.save();
          logAIInfo('Saved error message to transcript', { transcriptId });
        }
      } catch (saveError: any) {
        logAIError(saveError, {
          operation: 'saveErrorMessage',
          transcriptId
        });
      }

      return null;
    }

	  }


  /**
   * Create Task documents from action items and link to meeting/transcript
   */

  /**
   * Process transcript with specific AI agent only
   */
  async processWithSpecificAgent(
    transcriptId: string,
    agentType: 'summary' | 'actionItems'
  ): Promise<{ success: boolean; result?: any; error?: string }> {
    try {
      const transcript = await Transcript.findById(transcriptId);
      if (!transcript || !transcript.transcriptText) {
        return { success: false, error: 'Transcript not found or has no text content' };
      }

      if (agentType === 'summary') {
        const result = await this.aiAgentsService.generateSummary(transcript.transcriptText);
        if (result.success) {
          transcript.summaryText = result.summary;
          await transcript.save();
        }
        return { success: result.success, result: result.summary, error: result.error };
      } else {
        const result = await this.aiAgentsService.extractActionItems(transcript.transcriptText);
        if (result.success) {
          transcript.actionItems = result.actionItems;
          await transcript.save();
          if (Array.isArray(result.actionItems) && result.actionItems.length > 0) {
            await createTasksFromActionItems(transcript, result.actionItems)
          }
        }
        return { success: result.success, result: result.actionItems, error: result.error };
      }
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Reprocess transcript with AI agents (force reprocessing)
   */
  async reprocessTranscript(transcriptId: string): Promise<TranscriptProcessingResult | null> {
    try {
      console.log(`🔄 Force reprocessing transcript ${transcriptId} with AI agents`);

      const transcript = await Transcript.findById(transcriptId);
      if (!transcript || !transcript.transcriptText) {
        console.error(`❌ Transcript ${transcriptId} not found or has no text content`);
        return null;
      }

      // Clear existing AI-generated content
      transcript.summaryText = undefined;
      transcript.actionItems = [];
      await transcript.save();

      // Process with AI agents
      return await this.processTranscriptWithAI(transcriptId);
    } catch (error: any) {
      console.error(`❌ Error reprocessing transcript ${transcriptId}:`, error.message);
      return null;
    }
  }
}

export default TranscriptProcessingService;
