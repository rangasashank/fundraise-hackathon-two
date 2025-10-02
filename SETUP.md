# Nylas Notetaker Integration - Setup Guide

This guide will help you set up the Nylas Notetaker integration for Zoom meetings.

## Prerequisites

- Node.js 22.16.0 (see `.nvmrc`)
- MongoDB instance (local or cloud)
- Nylas account with API access

## Step 1: Nylas Account Setup

### 1.1 Create Nylas Account

1. Sign up at https://dashboard.nylas.com/register
2. Create a new application in the Nylas Dashboard
3. Note your **API Key** from the application settings

**Note:** With standalone notetakers, you only need an API key - no grant ID or OAuth required!

### 1.2 Configure Webhooks

1. In Nylas Dashboard, go to Webhooks
2. Add your webhook URL: `https://your-domain.com/api/webhooks/nylas`
   - For development, use ngrok: `https://your-ngrok-url.ngrok.io/api/webhooks/nylas`
3. Subscribe to these events:
   - `notetaker.created`
   - `notetaker.updated`
   - `notetaker.meeting_state`
   - `notetaker.media`
   - `notetaker.deleted`
4. Note your **Webhook Secret** for signature verification

## Step 2: Backend Setup

### 2.1 Install Dependencies

```bash
cd backend
npm install
```

### 2.2 Configure Environment Variables

```bash
cp .env.example .env
```

Edit `backend/.env` with your credentials:

```env
PORT=4000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/fundraise-hackathon

# Nylas Configuration
NYLAS_API_KEY=your_nylas_api_key_here
NYLAS_API_URI=https://api.us.nylas.com
NYLAS_WEBHOOK_SECRET=your_webhook_secret_here
```

### 2.3 Start MongoDB

Make sure MongoDB is running:

```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI in .env with your Atlas connection string
```

### 2.4 Start Backend Server

```bash
npm run dev
```

The server will start on http://localhost:4000

## Step 3: Frontend Setup

### 3.1 Install Dependencies

```bash
cd frontend
npm install
```

### 3.2 Configure Environment Variables

```bash
cp .env.local.example .env.local
```

Edit `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### 3.3 Start Frontend Server

```bash
npm run dev
```

The frontend will start on http://localhost:3000

## Step 4: Expose Webhook Endpoint (Development)

For local development, you need to expose your backend to the internet so Nylas can send webhooks.

### Using ngrok:

```bash
# Install ngrok if you haven't
brew install ngrok  # macOS
# or download from https://ngrok.com/download

# Expose port 4000
ngrok http 4000
```

Copy the ngrok URL (e.g., `https://abc123.ngrok.io`) and:

1. Update your Nylas webhook URL to: `https://abc123.ngrok.io/api/webhooks/nylas`
2. Keep ngrok running while testing

## Step 5: Test the Integration

### 5.1 Access the Application

1. Open http://localhost:3000 in your browser
2. Click "Go to Notetaker Dashboard"

### 5.2 Invite Notetaker to a Meeting

1. Create a test Zoom meeting or use an existing meeting link
2. In the dashboard, enter the Zoom meeting link
3. Optionally enable AI Summary and Action Items
4. Click "Invite Notetaker"

### 5.3 Join the Meeting

1. Start your Zoom meeting
2. The Nylas Notetaker bot will request to join
3. Admit the bot to the meeting
4. The bot will start recording and transcribing

### 5.4 View Transcript

1. After the meeting ends, wait a few minutes for processing
2. Nylas will send webhook notifications as media files become available
3. Click "View" on the session in the dashboard
4. You'll see the transcript, summary, and action items

## API Endpoints

### Notetaker Endpoints

- `POST /api/notetaker/invite` - Invite notetaker to a meeting
- `GET /api/notetaker/sessions` - Get all sessions
- `GET /api/notetaker/sessions/:id` - Get specific session
- `DELETE /api/notetaker/sessions/:id/cancel` - Cancel scheduled notetaker
- `POST /api/notetaker/sessions/:id/leave` - Remove notetaker from meeting

### Transcript Endpoints

- `GET /api/notetaker/transcripts` - Get all transcripts
- `GET /api/notetaker/transcripts/:id` - Get specific transcript
- `GET /api/notetaker/transcripts/notetaker/:notetakerId` - Get transcript by notetaker ID

### Webhook Endpoint

- `POST /api/webhooks/nylas` - Receive Nylas webhook notifications

## Troubleshooting

### Notetaker Not Joining

- Check that your Nylas Grant ID is valid
- Verify the meeting link is correct
- Make sure the meeting hasn't already started (or use immediate join)
- Check backend logs for errors

### Webhooks Not Received

- Verify ngrok is running and URL is correct in Nylas Dashboard
- Check webhook signature verification (can disable in development)
- Look for webhook events in MongoDB `webhookevents` collection

### Transcript Not Appearing

- Wait a few minutes after meeting ends for processing
- Check webhook events to see if `notetaker.media` was received
- Look for errors in the `transcripts` collection
- Check backend logs for download errors

### MongoDB Connection Issues

- Verify MongoDB is running
- Check MONGODB_URI in .env
- Ensure database name is correct

## Production Deployment

### Backend

1. Deploy to a hosting service (Heroku, Railway, AWS, etc.)
2. Set environment variables in hosting platform
3. Use production MongoDB instance (MongoDB Atlas recommended)
4. Update NYLAS_WEBHOOK_SECRET with a secure value

### Frontend

1. Deploy to Vercel, Netlify, or similar
2. Set NEXT_PUBLIC_API_URL to your production backend URL
3. Update CORS settings in backend if needed

### Webhooks

1. Update Nylas webhook URL to production backend URL
2. Ensure webhook endpoint is publicly accessible
3. Enable webhook signature verification in production

## Support

For issues or questions:

- Nylas Documentation: https://developer.nylas.com/docs/v3/notetaker/
- Nylas Support: https://support.nylas.com/
- GitHub Issues: [Your repo URL]

## License

[Your License]
