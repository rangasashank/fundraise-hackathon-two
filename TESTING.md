# Testing Guide

This guide will help you test the Nylas Notetaker integration.

## Prerequisites

Before testing, ensure:
- ✅ Backend server is running on port 4000
- ✅ Frontend server is running on port 3000
- ✅ MongoDB is running and connected
- ✅ Nylas credentials are configured in backend/.env
- ✅ ngrok (or similar) is exposing your backend for webhooks

## Test Checklist

### 1. Backend API Tests

#### Test Health Endpoint
```bash
curl http://localhost:4000/health
```
Expected: `{"status":"ok","timestamp":"..."}`

#### Test Invite Notetaker
```bash
curl -X POST http://localhost:4000/api/notetaker/invite \
  -H "Content-Type: application/json" \
  -d '{
    "meetingLink": "https://zoom.us/j/123456789",
    "name": "Test Notetaker",
    "enableSummary": true,
    "enableActionItems": true
  }'
```
Expected: `{"success":true,"data":{...}}`

#### Test Get Sessions
```bash
curl http://localhost:4000/api/notetaker/sessions
```
Expected: `{"success":true,"data":[...]}`

#### Test Get Transcripts
```bash
curl http://localhost:4000/api/notetaker/transcripts
```
Expected: `{"success":true,"data":[...]}`

### 2. Frontend Tests

#### Test Homepage
1. Navigate to http://localhost:3000
2. Verify you see "Fundraise Hackathon 2" title
3. Click "Go to Notetaker Dashboard" button
4. Should navigate to /notetaker

#### Test Notetaker Dashboard
1. Navigate to http://localhost:3000/notetaker
2. Verify the invite form is displayed
3. Enter a test Zoom meeting link
4. Check "Enable AI Summary" and "Enable Action Items"
5. Click "Invite Notetaker"
6. Should see success message
7. Session should appear in the table below

#### Test Transcript Viewer
1. From the dashboard, click "View" on a session
2. Should navigate to /notetaker/transcript/[notetakerId]
3. If transcript is processing, should see "Processing..." message
4. If completed, should see transcript text, summary, and action items

### 3. Webhook Tests

#### Test Webhook Endpoint
```bash
curl -X POST http://localhost:4000/api/webhooks/nylas \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test-webhook-123",
    "type": "notetaker.created",
    "data": {
      "object": {
        "id": "test-notetaker-123",
        "state": "scheduled"
      }
    }
  }'
```
Expected: `{"received":true}`

Check MongoDB:
```bash
# Connect to MongoDB
mongosh

# Use database
use fundraise-hackathon

# Check webhook events
db.webhookevents.find().pretty()
```

### 4. End-to-End Test

#### Complete Flow Test
1. **Create a test Zoom meeting**
   - Go to zoom.us and schedule a meeting
   - Copy the meeting link

2. **Invite Notetaker**
   - Open http://localhost:3000/notetaker
   - Paste the Zoom meeting link
   - Enable Summary and Action Items
   - Click "Invite Notetaker"
   - Verify success message

3. **Check Database**
   ```bash
   mongosh
   use fundraise-hackathon
   db.notetakersessions.find().pretty()
   db.transcripts.find().pretty()
   ```

4. **Start the Meeting**
   - Join your Zoom meeting
   - Wait for Notetaker bot to request entry
   - Admit the bot
   - Verify bot is recording

5. **During Meeting**
   - Speak for a few minutes
   - Have a conversation if possible
   - Mention some action items

6. **End Meeting**
   - End the Zoom meeting
   - Wait 5-10 minutes for processing

7. **Check Webhooks**
   - Monitor backend logs for webhook notifications
   - Check MongoDB for webhook events:
   ```bash
   db.webhookevents.find({eventType: "notetaker.media"}).pretty()
   ```

8. **View Transcript**
   - Refresh the dashboard
   - Click "View" on the session
   - Verify transcript text is displayed
   - Check summary and action items

### 5. Error Handling Tests

#### Test Invalid Meeting Link
```bash
curl -X POST http://localhost:4000/api/notetaker/invite \
  -H "Content-Type: application/json" \
  -d '{"meetingLink": "https://invalid-link.com"}'
```
Expected: Error message about invalid link

#### Test Missing Meeting Link
```bash
curl -X POST http://localhost:4000/api/notetaker/invite \
  -H "Content-Type: application/json" \
  -d '{}'
```
Expected: Error message about required field

#### Test Cancel Non-existent Session
```bash
curl -X DELETE http://localhost:4000/api/notetaker/sessions/invalid-id/cancel
```
Expected: 404 error

### 6. MongoDB Data Verification

#### Check Collections
```bash
mongosh
use fundraise-hackathon

# List all collections
show collections

# Count documents
db.notetakersessions.countDocuments()
db.transcripts.countDocuments()
db.webhookevents.countDocuments()

# View recent sessions
db.notetakersessions.find().sort({createdAt: -1}).limit(5).pretty()

# View recent transcripts
db.transcripts.find().sort({createdAt: -1}).limit(5).pretty()

# View recent webhooks
db.webhookevents.find().sort({createdAt: -1}).limit(10).pretty()

# Check for errors
db.transcripts.find({status: "failed"}).pretty()
db.webhookevents.find({processed: false}).pretty()
```

## Common Issues & Solutions

### Issue: Notetaker not joining meeting
**Solution:**
- Verify NYLAS_GRANT_ID is correct
- Check meeting link format
- Ensure meeting hasn't already started (or omit joinTime for immediate join)
- Check backend logs for Nylas API errors

### Issue: Webhooks not received
**Solution:**
- Verify ngrok is running: `ngrok http 4000`
- Check webhook URL in Nylas Dashboard matches ngrok URL
- Test webhook endpoint manually with curl
- Check backend logs for webhook processing errors

### Issue: Transcript not appearing
**Solution:**
- Wait 5-10 minutes after meeting ends
- Check webhook events: `db.webhookevents.find({eventType: "notetaker.media"})`
- Check transcript status: `db.transcripts.find({status: "failed"})`
- Review backend logs for download errors

### Issue: MongoDB connection failed
**Solution:**
- Verify MongoDB is running: `mongosh`
- Check MONGODB_URI in .env
- Ensure database name is correct
- Check MongoDB logs

### Issue: CORS errors in frontend
**Solution:**
- Verify backend CORS is enabled (already configured)
- Check NEXT_PUBLIC_API_URL in frontend/.env.local
- Ensure backend is running on correct port

## Performance Testing

### Load Test (Optional)
```bash
# Install Apache Bench
brew install httpd  # macOS

# Test invite endpoint
ab -n 10 -c 2 -p invite.json -T application/json \
  http://localhost:4000/api/notetaker/invite

# invite.json content:
# {"meetingLink":"https://zoom.us/j/123456789","name":"Load Test"}
```

## Monitoring

### Watch Backend Logs
```bash
cd backend
npm run dev
# Watch for:
# - Nylas API calls
# - Webhook notifications
# - Database operations
# - Errors
```

### Watch MongoDB Operations
```bash
mongosh
use fundraise-hackathon
db.setProfilingLevel(2)  # Log all operations
db.system.profile.find().pretty()
```

## Success Criteria

✅ Backend starts without errors  
✅ Frontend loads successfully  
✅ Can invite notetaker via UI  
✅ Session appears in database  
✅ Notetaker joins Zoom meeting  
✅ Webhooks are received and processed  
✅ Transcript is downloaded and stored  
✅ Transcript appears in UI  
✅ Summary and action items are displayed  
✅ No errors in logs  

## Next Steps

After successful testing:
1. Deploy to production
2. Configure production webhooks
3. Set up monitoring and alerts
4. Add user authentication
5. Implement email notifications
6. Add more error handling
7. Optimize database queries
8. Add caching layer

## Support

If you encounter issues:
1. Check this testing guide
2. Review SETUP.md
3. Check backend logs
4. Inspect MongoDB data
5. Test API endpoints with curl
6. Verify Nylas Dashboard configuration

