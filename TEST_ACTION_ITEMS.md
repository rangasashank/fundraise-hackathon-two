# Quick Test: Action Items Generation

## Test 1: Verify OpenAI API Key

```bash
cd backend
node -e "require('dotenv').config(); console.log('OpenAI Key:', process.env.OPENAI_API_KEY ? 'SET ✅' : 'NOT SET ❌')"
```

## Test 2: Check MongoDB Transcripts

```bash
mongosh fundraise-hackathon --eval "db.transcripts.find({}, {_id:1, transcriptText:1, actionItems:1, status:1}).limit(5).pretty()"
```

## Test 3: Run Debug Script

```bash
cd backend
npm run build
node debug-action-items.js
```

## Test 4: Manual API Call

Get a transcript ID from MongoDB, then:

```bash
# Replace with your actual transcript ID
TRANSCRIPT_ID="your_transcript_id_here"

curl -X POST http://localhost:4000/api/ai/process-transcript \
  -H "Content-Type: application/json" \
  -d "{\"transcriptId\": \"$TRANSCRIPT_ID\", \"processActionItems\": true}" | jq
```

## Test 5: Test with Sample Text

```bash
curl -X POST http://localhost:4000/api/ai/test \
  -H "Content-Type: application/json" \
  -d '{
    "text": "In our meeting today, Sarah committed to finishing the API documentation by Friday. Mike will review the design mockups and provide feedback by Tuesday. The team agreed to schedule a client demo for next week. John will follow up with the legal team about the contract terms.",
    "testActionItems": true,
    "testSummary": false
  }' | jq
```

**Expected Output:**
```json
{
  "success": true,
  "results": {
    "actionItems": {
      "success": true,
      "actionItems": [
        "Sarah will finish the API documentation by Friday",
        "Mike will review the design mockups and provide feedback by Tuesday",
        "Team will schedule a client demo for next week",
        "John will follow up with the legal team about the contract terms"
      ]
    }
  }
}
```

## Test 6: Check Frontend API Call

1. Open browser DevTools (F12)
2. Go to Network tab
3. Open a meeting with transcript
4. Click "Generate Action Items with AI"
5. Look for POST request to `/api/ai/process-transcript`
6. Check the response

## Test 7: Verify Data in Frontend

Open browser console and run:

```javascript
// Get the meeting object from React DevTools or component state
// This assumes you have a meeting object in scope
console.log('Meeting Action Items:', meeting.actionItems);
console.log('Has Action Items:', meeting.actionItems && meeting.actionItems.length > 0);
```

## Common Issues & Quick Fixes

### Issue: "OPENAI_API_KEY is not defined"
**Fix:**
```bash
cd backend
echo "OPENAI_API_KEY=your_key_here" >> .env
```

### Issue: Empty actionItems array in MongoDB
**Fix:**
```bash
# Run the debug script to process a transcript
cd backend
npm run build
node debug-action-items.js <transcript_id>
```

### Issue: Frontend not showing action items
**Fix:**
1. Click "Refresh" button in meetings page
2. Check browser console for errors
3. Verify API call succeeded in Network tab

### Issue: "Transcript has no text content"
**Fix:**
Wait for the Nylas webhook to deliver the transcript text, or manually add transcript text to MongoDB for testing:

```javascript
// In mongosh
db.transcripts.updateOne(
  { _id: ObjectId("your_id") },
  { $set: { 
    transcriptText: "Sample meeting transcript with action items. Sarah will complete the report by Friday. Mike will review the code by Tuesday.",
    status: "completed"
  }}
)
```

## Success Criteria

✅ All tests should pass:
- OpenAI API key is set
- MongoDB has transcripts with text
- Debug script extracts action items successfully
- API endpoint returns action items
- Frontend displays action items

## Next Steps After Testing

If all tests pass but action items still don't appear:

1. Check the data transformation in `frontend/lib/dataTransformers.ts`
2. Verify the Meeting interface includes `actionItems?: string[]`
3. Check the component condition: `(meeting.actionItems && meeting.actionItems.length > 0)`
4. Ensure the parseActionItems function in `meeting-details-content.tsx` is working correctly

## Useful MongoDB Queries

```javascript
// Find transcripts with action items
db.transcripts.find({ "actionItems.0": { $exists: true } })

// Find transcripts without action items
db.transcripts.find({ $or: [
  { actionItems: { $exists: false } },
  { actionItems: { $size: 0 } }
]})

// Count transcripts by status
db.transcripts.aggregate([
  { $group: { _id: "$status", count: { $sum: 1 } } }
])

// Get latest transcript with details
db.transcripts.findOne(
  {},
  { transcriptText: 1, actionItems: 1, summaryText: 1, status: 1 }
).sort({ createdAt: -1 })
```

