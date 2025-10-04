import OpenAI from 'openai';
import dotenv from 'dotenv';
import {
  SummaryResponse,
  ActionItemsResponse,
  AIAgentConfig,
  TranscriptProcessingResult
} from '../types/aiAgents';
import {
  logAIError,
  logAISuccess,
  logAIInfo,
  logAIWarning,
  validateOpenAIResponse,
  validateTranscriptText,
  handleOpenAIError,
  retryAIOperation,
  AIProcessingError
} from '../utils/errorHandler';

dotenv.config();

/**
 * AI Agents Service
 * Contains two specialized agents for processing meeting transcripts:
 * 1. Summary Agent - Generates concise meeting summaries
 * 2. Action Items Agent - Extracts actionable items from meetings
 */
class AIAgentsService {
  private openai: OpenAI;
  private config: AIAgentConfig;

  constructor(config: AIAgentConfig = {}) {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not defined in environment variables');
    }

    this.openai = new OpenAI({
      apiKey: apiKey,
    });

    // Default configuration
    this.config = {
      model: config.model || 'gpt-4o-mini',
      maxTokens: config.maxTokens || 1000,
      temperature: config.temperature || 0.3,
    };
  }

  /**
   * Agent 1: Summary Agent
   * Generates a concise summary of the meeting transcript
   */
  async generateSummary(transcriptText: string): Promise<SummaryResponse> {
    const operation = async (): Promise<SummaryResponse> => {
      try {
        logAIInfo('Summary Agent: Starting transcript processing', {
          textLength: transcriptText?.length
        });

        // Validate input
        validateTranscriptText(transcriptText);

        logAIInfo('Summary Agent: Transcript validation passed');


      const systemPrompt = `You are a professional meeting summarization agent. Your task is to create concise, well-structured summaries of meeting transcripts.

INSTRUCTIONS:
- Create a clear, professional summary that captures the key points discussed
- Focus on main topics, decisions made, and important discussions
- Use bullet points or numbered lists for better readability
- Keep the summary concise but comprehensive (aim for 200-400 words)
- Maintain a professional tone
- If speaker names are mentioned, include them when relevant to key points
- Organize information logically (e.g., topics discussed, decisions made, next steps)

FORMAT:
Structure your summary with clear sections like:
## Key Topics Discussed
## Decisions Made  
## Important Points
## Next Steps (if mentioned)

Do not include filler words, off-topic conversations, or technical meeting details (like "can you hear me", etc.).`;

      const userPrompt = `Please summarize the following meeting transcript:

${transcriptText}`;

        logAIInfo('Summary Agent: Sending request to OpenAI', {
          model: this.config.model,
          maxTokens: this.config.maxTokens,
          temperature: this.config.temperature
        });

        const completion = await this.openai.chat.completions.create({
          model: this.config.model!,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
        });

        // Validate OpenAI response
        validateOpenAIResponse(completion, 'summary');

        const summary = completion.choices[0]?.message?.content?.trim();

        if (!summary) {
          throw new AIProcessingError(
            'Empty summary content from OpenAI',
            'SummaryAgent',
            'EMPTY_CONTENT'
          );
        }

        logAISuccess('Summary Agent: Successfully generated summary', {
          summaryLength: summary.length,
          tokensUsed: completion.usage?.total_tokens
        });

        return {
          summary,
          success: true
        };

      } catch (error: any) {
        const aiError = error instanceof AIProcessingError ? error : handleOpenAIError(error, 'generateSummary');
        logAIError(aiError, { operation: 'generateSummary', textLength: transcriptText?.length });

        return {
          summary: '',
          success: false,
          error: aiError.message
        };
      }
    };

    // Use retry mechanism for summary generation
    try {
      return await retryAIOperation(operation, 3, 1000, 'Summary Generation');
    } catch (error: any) {
      logAIError(error, { operation: 'generateSummary', textLength: transcriptText?.length });
      return {
        summary: '',
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Agent 2: Action Items Agent
   * Extracts actionable items from the meeting transcript
   */
  async extractActionItems(transcriptText: string): Promise<ActionItemsResponse> {
    const operation = async (): Promise<ActionItemsResponse> => {
      try {
        logAIInfo('Action Items Agent: Starting transcript processing', {
          textLength: transcriptText?.length
        });

        // Validate input
        validateTranscriptText(transcriptText);

        logAIInfo('Action Items Agent: Transcript validation passed');

      const systemPrompt = `You are an expert action items extraction agent. Extract specific, actionable tasks from meeting transcripts.

WHAT TO EXTRACT:
- Specific tasks someone committed to do
- Follow-up actions mentioned
- Deadlines and commitments
- Assignments given to people
- Next steps that were agreed upon

WHAT TO IGNORE:
- General discussions
- Ideas or suggestions without commitment
- Past actions already completed
- Informational statements

OUTPUT RULES:
1. Return ONLY action items, one per line
2. Start each line with a dash (-)
3. Include WHO will do WHAT and WHEN (if mentioned)
4. Be specific and clear
5. No extra text, headers, or explanations

EXAMPLES:
- Sarah will complete the API documentation by Friday
- Team will schedule client demo for next week
- Mike will review the design mockups by Tuesday
- Follow up with legal team about contract terms

If you find NO actionable items, return exactly: "No action items found"`;

      const userPrompt = `Please extract all action items from the following meeting transcript:

${transcriptText}`;

        logAIInfo('Action Items Agent: Sending request to OpenAI', {
          model: this.config.model,
          maxTokens: this.config.maxTokens,
          temperature: this.config.temperature
        });

        const completion = await this.openai.chat.completions.create({
          model: this.config.model!,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
        });

        // Validate OpenAI response
        validateOpenAIResponse(completion, 'actionItems');

        const response = completion.choices[0]?.message?.content?.trim();

        logAIInfo('Action Items Agent: Raw response from OpenAI', {
          responseLength: response?.length || 0,
          responsePreview: response?.substring(0, 200) || 'No response',
          tokensUsed: completion.usage?.total_tokens
        });

        if (!response) {
          throw new AIProcessingError(
            'Empty action items content from OpenAI',
            'ActionItemsAgent',
            'EMPTY_CONTENT'
          );
        }

        // Parse the response to extract action items
        // The AI should return items in a list format, so we'll parse them
        let actionItems: string[] = [];

        try {
          // Check for "No action items found" response
          if (response.toLowerCase().includes('no action items found') ||
              response.toLowerCase().includes('no clear action items') ||
              response.toLowerCase().includes('no action items identified')) {
            actionItems = [];
          } else if (response.startsWith('[') && response.endsWith(']')) {
            // Try to parse as JSON array
            actionItems = JSON.parse(response);
          } else {
            // Parse as text with bullet points or numbered lists
            actionItems = response
              .split('\n')
              .map(line => line.trim())
              .filter(line => line.length > 0)
              .filter(line => !line.toLowerCase().includes('no action items'))
              .filter(line => !line.toLowerCase().includes('action items:'))
              .filter(line => !line.toLowerCase().includes('here are the'))
              .map(line => {
                // Remove bullet points, numbers, or dashes at the beginning
                let cleaned = line.replace(/^[-•*\d+\.\)\s]+/, '').trim();
                // Remove quotes if present
                cleaned = cleaned.replace(/^["']|["']$/g, '');
                return cleaned;
              })
              .filter(line => line.length > 5); // Filter out very short lines
          }

          // Additional validation - ensure we have meaningful action items
          actionItems = actionItems.filter(item => {
            const lowerItem = item.toLowerCase();
            return !lowerItem.includes('no action') &&
                   !lowerItem.includes('none identified') &&
                   item.length > 10; // Ensure substantial content
          });

        } catch (parseError: any) {
          // If parsing fails, try a simpler approach
          logAIWarning('Action Items Agent: Failed to parse response, trying fallback parsing', {
            parseError: parseError?.message || 'Unknown parse error',
            responseLength: response.length,
            rawResponse: response.substring(0, 500)
          });

          // Fallback: split by common separators and clean up
          actionItems = response
            .split(/[\n\r]+/)
            .map(line => line.trim())
            .filter(line => line.length > 10)
            .map(line => line.replace(/^[-•*\d+\.\)\s]+/, '').trim())
            .filter(line => line.length > 5);

          // If still no items, log the issue but don't fail completely
          if (actionItems.length === 0) {
            logAIWarning('Action Items Agent: No action items could be parsed from response', {
              rawResponse: response
            });
          }
        }

        // Final validation and cleanup
        actionItems = actionItems
          .filter(item => item && typeof item === 'string')
          .map(item => item.trim())
          .filter(item => item.length > 5)
          .slice(0, 20); // Limit to max 20 action items

        logAIInfo('Action Items Agent: Parsed action items', {
          actionItemsCount: actionItems.length,
          actionItems: actionItems,
          rawResponseLength: response.length
        });

        if (actionItems.length === 0) {
          logAIWarning('Action Items Agent: No valid action items extracted', {
            rawResponse: response.substring(0, 200),
            responseLength: response.length
          });
        }

        logAISuccess('Action Items Agent: Successfully extracted action items', {
          actionItemsCount: actionItems.length,
          tokensUsed: completion.usage?.total_tokens
        });

        return {
          actionItems,
          success: true
        };

      } catch (error: any) {
        const aiError = error instanceof AIProcessingError ? error : handleOpenAIError(error, 'extractActionItems');
        logAIError(aiError, { operation: 'extractActionItems', textLength: transcriptText?.length });

        return {
          actionItems: [],
          success: false,
          error: aiError.message
        };
      }
    };

    // Use retry mechanism for action items extraction
    try {
      return await retryAIOperation(operation, 3, 1000, 'Action Items Extraction');
    } catch (error: any) {
      logAIError(error, { operation: 'extractActionItems', textLength: transcriptText?.length });
      return {
        actionItems: [],
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Process transcript with both agents
   * Convenience method to run both summary and action items extraction
   */
  async processTranscript(transcriptText: string, transcriptId?: string): Promise<TranscriptProcessingResult> {
    const startTime = Date.now();

    logAIInfo('AI Agents: Starting parallel processing with both agents', {
      transcriptId,
      textLength: transcriptText?.length
    });

    try {
      // Validate input once for both agents
      validateTranscriptText(transcriptText);

      // Run both agents in parallel for efficiency
      const [summaryResult, actionItemsResult] = await Promise.all([
        this.generateSummary(transcriptText),
        this.extractActionItems(transcriptText)
      ]);

      const processingTime = Date.now() - startTime;

      logAISuccess('AI Agents: Completed processing with both agents', {
        transcriptId,
        processingTimeMs: processingTime,
        summarySuccess: summaryResult.success,
        actionItemsSuccess: actionItemsResult.success,
        actionItemsCount: actionItemsResult.actionItems?.length || 0
      });

      return {
        summary: summaryResult,
        actionItems: actionItemsResult,
        transcriptId,
        processedAt: new Date()
      };

    } catch (error: any) {
      const processingTime = Date.now() - startTime;
      logAIError(error, {
        operation: 'processTranscript',
        transcriptId,
        processingTimeMs: processingTime,
        textLength: transcriptText?.length
      });

      // Return failed results for both agents
      return {
        summary: {
          summary: '',
          success: false,
          error: error.message
        },
        actionItems: {
          actionItems: [],
          success: false,
          error: error.message
        },
        transcriptId,
        processedAt: new Date()
      };
    }
  }
}

export default AIAgentsService;
