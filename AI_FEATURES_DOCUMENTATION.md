# AI-Powered Meeting Transcript Processing

This document describes the AI-powered features implemented for automatic meeting transcript processing using OpenAI's GPT models.

## 🤖 Overview

The system includes two specialized AI agents that automatically process meeting transcripts:

1. **Summary Agent** - Generates concise, professional meeting summaries
2. **Action Items Agent** - Extracts actionable tasks and commitments from meetings

## 🏗️ Architecture

### Core Components

- **`AIAgentsService`** - Main service containing both AI agents
- **`TranscriptProcessingService`** - Handles integration with database and transcript workflow
- **`aiController`** - REST API endpoints for manual processing
- **Enhanced Error Handling** - Comprehensive logging and retry mechanisms

### Data Flow

1. **Automatic Processing**: When a transcript becomes available via webhook, AI processing is triggered automatically
2. **Manual Processing**: API endpoints allow manual processing of existing transcripts
3. **Database Storage**: Results are stored in the MongoDB Transcript model (`summaryText` and `actionItems` fields)

## 🚀 Features

### Automatic Processing
- Triggered automatically when transcript text becomes available
- Runs both agents in parallel for efficiency
- Non-blocking webhook processing (AI runs asynchronously)
- Real-time SSE updates when processing completes

### Manual Processing
- REST API endpoints for on-demand processing
- Ability to process specific agents (summary only, action items only, or both)
- Force reprocessing of existing transcripts
- Test endpoints for development

### Error Handling & Reliability
- Comprehensive error logging with structured data
- Automatic retry mechanism (3 attempts with exponential backoff)
- Input validation and sanitization
- Graceful handling of OpenAI API errors (rate limits, timeouts, etc.)
- Detailed error messages stored in database

## 📡 API Endpoints

### Process Transcript
```http
POST /api/ai/process-transcript
Content-Type: application/json

{
  "transcriptId": "transcript_id_here",
  "processSummary": true,
  "processActionItems": true
}
```

### Reprocess Transcript (Force)
```http
POST /api/ai/reprocess-transcript
Content-Type: application/json

{
  "transcriptId": "transcript_id_here"
}
```

### Get Processing Status
```http
GET /api/ai/status/:transcriptId
```

### Test AI Agents
```http
POST /api/ai/test
Content-Type: application/json

{
  "text": "Sample meeting transcript text...",
  "testSummary": true,
  "testActionItems": true
}
```

## ⚙️ Configuration

### Environment Variables

Add to your `.env` file:
```env
# OpenAI Configuration (for AI-powered summary and action items)
OPENAI_API_KEY=your_openai_api_key_here
```

### AI Agent Configuration

Default settings (can be customized):
- **Model**: `gpt-4o-mini` (cost-effective, fast)
- **Max Tokens**: 1000
- **Temperature**: 0.3 (focused, consistent responses)

## 🎯 AI Agent Prompts

### Summary Agent
- Creates professional, structured summaries
- Focuses on key topics, decisions, and important discussions
- Uses markdown formatting with clear sections
- Filters out filler words and technical meeting details

### Action Items Agent
- Extracts specific, actionable tasks
- Includes responsible parties when mentioned
- Captures deadlines and timeframes
- Formats items for clarity and accountability

## 📊 Database Schema

The existing `Transcript` model includes these AI-related fields:

```typescript
interface ITranscript {
  // ... existing fields
  summaryText?: string;        // AI-generated summary
  actionItems?: string[];      // AI-extracted action items
  errorMessage?: string;       // Error details if processing fails
  // ... other fields
}
```

## 🔧 Usage Examples

### Automatic Processing
When a meeting transcript becomes available, the system automatically:
1. Validates the transcript text
2. Processes with both AI agents in parallel
3. Stores results in the database
4. Emits real-time updates via SSE

### Manual Processing
```javascript
// Process a specific transcript
const response = await fetch('/api/ai/process-transcript', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    transcriptId: 'transcript_id',
    processSummary: true,
    processActionItems: true
  })
});

const result = await response.json();
console.log('Summary:', result.summary);
console.log('Action Items:', result.actionItems);
```

### Testing AI Agents
```javascript
// Test with sample text
const response = await fetch('/api/ai/test', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: "John said he will send the proposal by Friday. Sarah agreed to review the budget next week.",
    testSummary: true,
    testActionItems: true
  })
});
```

## 🛠️ Development & Testing

### Running Tests
```bash
# Test AI agents with sample text
curl -X POST http://localhost:4000/api/ai/test \
  -H "Content-Type: application/json" \
  -d '{"text": "Sample meeting text...", "testSummary": true, "testActionItems": true}'
```

### Monitoring
- Check backend console for detailed AI processing logs
- Monitor OpenAI API usage in your OpenAI dashboard
- Review error messages in the database for failed processing

## 🚨 Error Handling

The system handles various error scenarios:

- **Invalid API Key**: Clear error message, no retries
- **Rate Limits**: Automatic retry with exponential backoff
- **Network Issues**: Retry mechanism with timeout handling
- **Empty Transcripts**: Graceful skipping with warning logs
- **Malformed Responses**: Fallback parsing and error logging

## 💰 Cost Considerations

- Uses `gpt-4o-mini` for cost efficiency
- Typical cost per transcript: $0.01-0.05 (depending on length)
- Parallel processing reduces total processing time
- Retry mechanism prevents unnecessary duplicate costs

## 🔒 Security

- API key stored securely in environment variables
- Input validation prevents injection attacks
- Error messages don't expose sensitive information
- Structured logging for audit trails

## 📈 Performance

- **Parallel Processing**: Both agents run simultaneously
- **Async Operations**: Non-blocking webhook processing
- **Retry Logic**: Handles temporary failures gracefully
- **Efficient Prompts**: Optimized for speed and accuracy

## 🎯 Next Steps

Potential enhancements:
1. **Custom Prompts**: Allow users to customize AI agent prompts
2. **Multiple Models**: Support for different OpenAI models
3. **Batch Processing**: Process multiple transcripts simultaneously
4. **Analytics**: Track AI processing metrics and costs
5. **Integration**: Connect action items with task management systems
