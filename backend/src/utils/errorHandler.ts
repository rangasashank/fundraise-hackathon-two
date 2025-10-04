/**
 * Error handling utilities for AI agents and transcript processing
 */

export interface ErrorDetails {
  message: string;
  code?: string;
  context?: any;
  timestamp: Date;
  service: string;
}

export class AIProcessingError extends Error {
  public code?: string;
  public context?: any;
  public service: string;
  public timestamp: Date;

  constructor(message: string, service: string, code?: string, context?: any) {
    super(message);
    this.name = 'AIProcessingError';
    this.service = service;
    this.code = code;
    this.context = context;
    this.timestamp = new Date();
  }
}

/**
 * Enhanced error logging for AI operations
 */
export const logAIError = (error: Error | AIProcessingError, context?: any): void => {
  const timestamp = new Date().toISOString();
  const errorInfo = {
    timestamp,
    message: error.message,
    name: error.name,
    stack: error.stack,
    context
  };

  if (error instanceof AIProcessingError) {
    errorInfo['service'] = error.service;
    errorInfo['code'] = error.code;
    errorInfo['errorContext'] = error.context;
  }

  console.error('🚨 AI Processing Error:', JSON.stringify(errorInfo, null, 2));
};

/**
 * Enhanced success logging for AI operations
 */
export const logAISuccess = (operation: string, details?: any): void => {
  const timestamp = new Date().toISOString();
  console.log(`✅ AI Success [${timestamp}] ${operation}:`, details || '');
};

/**
 * Enhanced info logging for AI operations
 */
export const logAIInfo = (operation: string, details?: any): void => {
  const timestamp = new Date().toISOString();
  console.log(`ℹ️  AI Info [${timestamp}] ${operation}:`, details || '');
};

/**
 * Enhanced warning logging for AI operations
 */
export const logAIWarning = (operation: string, details?: any): void => {
  const timestamp = new Date().toISOString();
  console.warn(`⚠️  AI Warning [${timestamp}] ${operation}:`, details || '');
};

/**
 * Validate OpenAI API response
 */
export const validateOpenAIResponse = (response: any, expectedType: 'summary' | 'actionItems'): boolean => {
  if (!response || !response.choices || !response.choices[0]) {
    throw new AIProcessingError(
      'Invalid OpenAI API response structure',
      'OpenAI',
      'INVALID_RESPONSE',
      { response, expectedType }
    );
  }

  const content = response.choices[0].message?.content;
  if (!content || typeof content !== 'string') {
    throw new AIProcessingError(
      'OpenAI response missing content',
      'OpenAI',
      'MISSING_CONTENT',
      { response, expectedType }
    );
  }

  return true;
};

/**
 * Validate transcript text before processing
 */
export const validateTranscriptText = (text: string): boolean => {
  if (!text || typeof text !== 'string') {
    throw new AIProcessingError(
      'Transcript text is not a valid string',
      'TranscriptValidation',
      'INVALID_TEXT_TYPE',
      { textType: typeof text, textLength: text?.length }
    );
  }

  if (text.trim().length === 0) {
    throw new AIProcessingError(
      'Transcript text is empty',
      'TranscriptValidation',
      'EMPTY_TEXT',
      { originalLength: text.length }
    );
  }

  if (text.length > 100000) { // 100KB limit
    logAIWarning('Large transcript detected', { length: text.length });
  }

  return true;
};

/**
 * Handle OpenAI API errors with specific error codes
 */
export const handleOpenAIError = (error: any, operation: string): AIProcessingError => {
  let message = 'Unknown OpenAI error';
  let code = 'UNKNOWN_ERROR';

  if (error.response) {
    // OpenAI API returned an error response
    const status = error.response.status;
    const data = error.response.data;

    switch (status) {
      case 401:
        message = 'Invalid OpenAI API key';
        code = 'INVALID_API_KEY';
        break;
      case 429:
        message = 'OpenAI API rate limit exceeded';
        code = 'RATE_LIMIT_EXCEEDED';
        break;
      case 500:
        message = 'OpenAI API server error';
        code = 'SERVER_ERROR';
        break;
      case 503:
        message = 'OpenAI API service unavailable';
        code = 'SERVICE_UNAVAILABLE';
        break;
      default:
        message = `OpenAI API error: ${data?.error?.message || 'Unknown error'}`;
        code = 'API_ERROR';
    }
  } else if (error.code) {
    // Network or other errors
    switch (error.code) {
      case 'ENOTFOUND':
        message = 'Cannot connect to OpenAI API (network error)';
        code = 'NETWORK_ERROR';
        break;
      case 'ETIMEDOUT':
        message = 'OpenAI API request timeout';
        code = 'TIMEOUT';
        break;
      default:
        message = `Network error: ${error.message}`;
        code = 'NETWORK_ERROR';
    }
  } else {
    message = error.message || 'Unknown error occurred';
  }

  return new AIProcessingError(
    message,
    'OpenAI',
    code,
    {
      operation,
      originalError: {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        data: error.response?.data
      }
    }
  );
};

/**
 * Retry mechanism for AI operations
 */
export const retryAIOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000,
  operationName: string = 'AI Operation'
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logAIInfo(`${operationName} attempt ${attempt}/${maxRetries}`);
      return await operation();
    } catch (error: any) {
      lastError = error;
      logAIWarning(`${operationName} attempt ${attempt} failed`, { error: error.message });

      if (attempt === maxRetries) {
        break;
      }

      // Don't retry on certain errors
      if (error instanceof AIProcessingError) {
        if (['INVALID_API_KEY', 'INVALID_TEXT_TYPE', 'EMPTY_TEXT'].includes(error.code || '')) {
          throw error; // Don't retry these errors
        }
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }

  throw new AIProcessingError(
    `${operationName} failed after ${maxRetries} attempts: ${lastError.message}`,
    'RetryMechanism',
    'MAX_RETRIES_EXCEEDED',
    { maxRetries, lastError: lastError.message }
  );
};
