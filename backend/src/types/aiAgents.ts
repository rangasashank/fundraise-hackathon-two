/**
 * Types and interfaces for AI Agents Service
 */

// Response interfaces for individual agents
export interface SummaryResponse {
  summary: string;
  success: boolean;
  error?: string;
}

export interface ActionItemsResponse {
  actionItems: string[];
  success: boolean;
  error?: string;
}

// Combined response interface for processing both agents
export interface TranscriptProcessingResult {
  summary: SummaryResponse;
  actionItems: ActionItemsResponse;
  transcriptId?: string;
  processedAt: Date;
}

// Configuration interface for AI agents
export interface AIAgentConfig {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  timeout?: number;
}

// Processing status for tracking AI operations
export interface ProcessingStatus {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
}

// Interface for transcript processing request
export interface ProcessTranscriptRequest {
  transcriptId: string;
  transcriptText: string;
  forceReprocess?: boolean;
}

// Interface for manual processing endpoint
export interface ManualProcessingRequest {
  transcriptId: string;
  processSummary?: boolean;
  processActionItems?: boolean;
}

// Response interface for manual processing endpoint
export interface ManualProcessingResponse {
  success: boolean;
  transcriptId: string;
  summary?: SummaryResponse;
  actionItems?: ActionItemsResponse;
  error?: string;
}

// Enum for AI agent types
export enum AIAgentType {
  SUMMARY = 'summary',
  ACTION_ITEMS = 'action_items'
}

// Interface for individual agent processing
export interface AgentProcessingRequest {
  agentType: AIAgentType;
  transcriptText: string;
  config?: Partial<AIAgentConfig>;
}

// Interface for agent processing response
export interface AgentProcessingResponse {
  agentType: AIAgentType;
  success: boolean;
  result: string | string[];
  error?: string;
  processingTime?: number;
}
