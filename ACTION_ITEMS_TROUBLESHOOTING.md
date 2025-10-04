# Action Items Troubleshooting Guide

## Problem: Action Items Not Being Generated or Displayed

This guide will help you diagnose and fix issues with action items not appearing in the frontend.

---

## Quick Diagnosis Checklist

Run through this checklist to identify the issue:

- [ ] OpenAI API key is set in backend `.env`
- [ ] Transcript text exists in MongoDB
- [ ] Backend AI processing endpoint is accessible
- [ ] Frontend is calling the correct API endpoint
- [ ] No errors in backend console logs
- [ ] No errors in browser console logs

---

## Step 1: Verify Backend Configuration

### Check Environment Variables

```bash
cd backend
cat .env | grep OPENAI_API_KEY
```

**Expected:** You should see your OpenAI API key
**If missing:** Add `OPENAI_API_KEY=your_key_here` to `backend/.env`

### Test OpenAI Connection

```bash
cd backend
npm run build
node debug-action-items.js
```

This script will:
1. Connect to MongoDB
2. Find the most recent transcript
3. Test AI action items extraction
4. Save results to database
5. Show detailed diagnostics

---

## Step 2: Check MongoDB Data

### Verify Transcript Exists

```bash
# Connect to MongoDB
mongosh

# Switch to database
use fundraise-hackathon

# Find transcripts
db.transcripts.find().pretty()

# Check specific transcript
db.transcripts.findOne({ _id: ObjectId("your_transcript_id") })
```

### What to Look For:

1. **transcriptText field** - Must have content
   ```json
   "transcriptText": "This is the meeting transcript..."
   ```

2. **actionItems field** - Should be an array
   ```json
   "actionItems": [
     "Task 1 (Person - Date)",
     "Task 2 (Person - Date)"
   ]
   ```

3. **status field** - Should be "completed"
   ```json
   "status": "completed"
   ```

---

## Step 3: Test AI Processing Manually

### Option A: Use Debug Script

```bash
cd backend
npm run build
node debug-action-items.js <transcript_id>
```

### Option B: Use API Endpoint

```bash
# Get transcript ID from MongoDB
TRANSCRIPT_ID="your_transcript_id_here"

# Call processing endpoint
curl -X POST http://localhost:4000/api/ai/process-transcript \
  -H "Content-Type: application/json" \
  -d "{\"transcriptId\": \"$TRANSCRIPT_ID\", \"processActionItems\": true}"
```

**Expected Response:**
```json
{
  "success": true,
  "transcriptId": "...",
  "actionItems": {
    "success": true,
    "actionItems": ["Task 1", "Task 2"]
  }
}
```

---

## Step 4: Check Backend Logs

### Enable Detailed Logging

The backend already has detailed logging. Watch for these messages:

```bash
cd backend
npm run dev
```

**Look for:**
- `🤖 Manual AI processing requested for transcript...`
- `📋 Processing action items for transcript...`
- `✅ Action items extracted for transcript... (X items)`
- `❌ Action items extraction failed...`

**Common Error Messages:**

1. **"OPENAI_API_KEY is not defined"**
   - Solution: Add API key to `.env` file

2. **"Transcript has no text content"**
   - Solution: Wait for webhook to deliver transcript text

3. **"Rate limit exceeded"**
   - Solution: Wait a few minutes, OpenAI has rate limits

4. **"Invalid API key"**
   - Solution: Verify your OpenAI API key is correct

---

## Step 5: Verify Frontend Integration

### Check API Calls

Open browser DevTools → Network tab:

1. **Look for:** `POST /api/ai/process-transcript`
2. **Check status:** Should be 200 OK
3. **Check response:** Should contain `actionItems` array

### Check Frontend Console

Open browser DevTools → Console tab:

**Look for errors:**
- `Failed to process transcript`
- `Network error`
- `CORS error`

### Verify Data Flow

1. **Meeting object should have:**
   ```javascript
   {
     actionItems: ["Task 1", "Task 2"],
     transcriptId: "...",
     hasTranscript: true
   }
   ```

2. **Component should display:**
   - "AI-Generated Action Items" section
   - List of action items with task, assignee, due date

---

## Step 6: Common Issues and Solutions

### Issue 1: Empty Action Items Array

**Symptoms:**
- MongoDB shows `actionItems: []`
- Frontend shows "No action items found"

**Possible Causes:**
1. Transcript doesn't contain actionable items
2. AI model didn't identify any action items
3. Transcript text is too short or unclear

**Solutions:**
1. Check transcript content - does it mention tasks or commitments?
2. Try reprocessing: Click "Reprocess With AI" in frontend
3. Test with a different transcript that clearly has action items

### Issue 2: Action Items Not Saved to Database

**Symptoms:**
- AI processing succeeds in logs
- But MongoDB still shows empty array

**Possible Causes:**
1. Database save operation failed
2. Mongoose validation error
3. Connection issue

**Solutions:**
1. Check backend logs for save errors
2. Verify MongoDB connection is stable
3. Run debug script to test save operation

### Issue 3: Action Items Not Displaying in Frontend

**Symptoms:**
- MongoDB has action items
- But frontend doesn't show them

**Possible Causes:**
1. Frontend not fetching latest data
2. Data transformation issue
3. Component not rendering correctly

**Solutions:**
1. Click "Refresh" button in frontend
2. Check browser console for errors
3. Verify `meeting.actionItems` is populated in component
4. Check if condition `(meeting.actionItems && meeting.actionItems.length > 0)` is true

### Issue 4: Automatic Processing Not Triggered

**Symptoms:**
- Transcript received from webhook
- But AI processing never runs

**Possible Causes:**
1. Webhook handler not calling AI processing
2. Async processing failed silently
3. OpenAI API error

**Solutions:**
1. Check webhook logs for AI processing trigger
2. Look for error messages in backend console
3. Manually trigger processing via API endpoint

---

## Step 7: Manual Processing Workflow

If automatic processing isn't working, use manual processing:

### Backend API Call

```bash
# Get transcript ID from MongoDB
TRANSCRIPT_ID="your_id_here"

# Process transcript
curl -X POST http://localhost:4000/api/ai/process-transcript \
  -H "Content-Type: application/json" \
  -d "{
    \"transcriptId\": \"$TRANSCRIPT_ID\",
    \"processSummary\": true,
    \"processActionItems\": true
  }"
```

### Frontend UI

1. Open meeting details dialog
2. Scroll to "AI-Generated Action Items" section
3. Click "Generate Action Items with AI" button
4. Wait for processing to complete
5. Action items should appear

---

## Step 8: Verify End-to-End Flow

### Complete Test Scenario

1. **Invite Notetaker**
   ```bash
   curl -X POST http://localhost:4000/api/notetaker/invite \
     -H "Content-Type: application/json" \
     -d '{"meetingLink": "https://zoom.us/j/123456789", "name": "Test Bot"}'
   ```

2. **Wait for Meeting to Complete**
   - Nylas will send webhook with transcript

3. **Check Transcript in MongoDB**
   ```javascript
   db.transcripts.findOne().sort({createdAt: -1})
   ```

4. **Verify AI Processing Ran**
   - Check backend logs for AI processing messages

5. **Check Frontend**
   - Open meeting details
   - Verify action items are displayed

---

## Debugging Commands Reference

```bash
# Build backend
cd backend && npm run build

# Run debug script
node debug-action-items.js [transcript_id]

# Check MongoDB
mongosh
use fundraise-hackathon
db.transcripts.find({}, {actionItems: 1, transcriptText: 1, status: 1}).pretty()

# Test API endpoint
curl -X POST http://localhost:4000/api/ai/process-transcript \
  -H "Content-Type: application/json" \
  -d '{"transcriptId": "YOUR_ID", "processActionItems": true}'

# Check processing status
curl http://localhost:4000/api/ai/status/YOUR_TRANSCRIPT_ID

# View backend logs
cd backend && npm run dev

# View frontend logs
# Open browser DevTools → Console
```

---

## Expected Data Format

### MongoDB Transcript Document

```json
{
  "_id": "ObjectId(...)",
  "notetakerId": "nylas_id",
  "sessionId": "ObjectId(...)",
  "transcriptText": "Full meeting transcript...",
  "summaryText": "Meeting summary...",
  "actionItems": [
    "Complete API documentation (Sarah - Friday)",
    "Schedule client demo (Team - Next week)",
    "Review design mockups (Mike - Tuesday)"
  ],
  "status": "completed",
  "createdAt": "2025-01-04T...",
  "updatedAt": "2025-01-04T..."
}
```

### Frontend Meeting Object

```typescript
{
  id: "...",
  title: "Meeting Title",
  actionItems: [
    "Complete API documentation (Sarah - Friday)",
    "Schedule client demo (Team - Next week)"
  ],
  transcriptId: "...",
  hasTranscript: true,
  summaryText: "Meeting summary..."
}
```

---

## Still Having Issues?

If you've tried all the above steps and action items still aren't working:

1. **Check OpenAI API Status**: https://status.openai.com/
2. **Verify API Key Permissions**: Ensure your key has access to chat completions
3. **Check Rate Limits**: You may have exceeded OpenAI rate limits
4. **Review Full Logs**: Check both backend and frontend logs for any errors
5. **Test with Sample Data**: Use the test endpoint to verify AI processing works

### Test Endpoint

```bash
curl -X POST http://localhost:4000/api/ai/test \
  -H "Content-Type: application/json" \
  -d '{
    "text": "In our meeting, Sarah agreed to complete the API documentation by Friday. Mike will review the design mockups by Tuesday. The team will schedule a client demo for next week.",
    "testActionItems": true
  }'
```

This should return action items if the AI processing is working correctly.

---

## Contact & Support

If you're still stuck, gather this information:
- Backend logs (last 50 lines)
- Frontend console errors
- MongoDB transcript document
- OpenAI API response (if any)
- Steps you've already tried

This will help diagnose the issue more quickly.

