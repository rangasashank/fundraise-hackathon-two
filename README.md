# Fundraise Hackathon 2

## 🎯 Features Provided

- **Standalone Notetaker Integration** - Invite Nylas bot to any Zoom meeting without calendar integration
- **Automatic Transcription** - Get full meeting transcripts automatically with speaker labels
- **AI-Powered Summary** - Automatic meeting summaries using OpenAI GPT models
- **AI-Powered Action Items** - Automatic extraction of action items and tasks from meetings
- **Audio Recording** - Download meeting recordings
- **Real-time Webhooks** - Receive notifications when transcripts are ready
- **MongoDB Storage** - All data persisted in your database
- **Live Dashboard** - Real-time updates via Server-Sent Events (SSE)

## 🚀 Quick Start Guide

### Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB Atlas Account** (free tier works)
- **Nylas API Account** (free developer account)
- **OpenAI API Account** (for AI-powered features)
- **VS Code** (recommended for port forwarding)

### Step 1: Clone and Install

```bash
git clone <your-repo-url>
cd fundraise-hackathon-two

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 2: Set Up MongoDB Database

1. **Create MongoDB Atlas Account:**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Sign up for a free account
   - Create a new cluster (free M0 tier)

2. **Get Connection String:**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)
   - Replace `<password>` with your actual password
   - Add database name at the end: `/fundraise-hackathon`
   - example: `mongodb+srv://username:password@cluster.mongodb.net/fundraise-hackathon`

3. **Configure Network Access:**
   - Go to "Network Access" in Atlas
   - Click "Add IP Address"
   - Choose "Allow access from anywhere" (0.0.0.0/0) for development

### Step 3: Get Nylas API Credentials

1. **Create Nylas Account:**
   - Go to [Nylas Developer Portal](https://developer.nylas.com/)
   - Sign up for a free developer account
   - Create a new application

2. **Get API Key:**
   - In your Nylas dashboard, go to "API Keys"
   - Copy your API Key (starts with `nylas_`)

### Step 4: Set Up VS Code Port Forwarding

1. **Start Port Forwarding:**
   - Open VS Code in your project directory
   - Beside the Terminal in the bottom panel, click the "Ports" icon (or press `Ctrl+Shift+P` and type "Ports")
   - Choose "4000" as the port
   - Set visibility to "Public"
   - Copy the generated HTTPS URL (e.g., `https://abc123-4000.usw2.devtunnels.ms`)

### Step 5: Configure Environment Files

#### Backend Environment (.env)

Create `backend/.env` file:

```env
# Server Configuration
PORT=4000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fundraise-hackathon

# Nylas Configuration
NYLAS_API_KEY=nylas_your_api_key_here
NYLAS_API_URI=https://api.us.nylas.com
NYLAS_WEBHOOK_SECRET=

# OpenAI Configuration (for AI-powered summary and action items)
OPENAI_API_KEY=your_openai_api_key_here

# Webhook Auto-Registration
WEBHOOK_BASE_URL=https://your-tunnel-url.devtunnels.ms
WEBHOOK_NOTIFICATION_EMAIL=your-email@example.com

# Development Settings (Mandatory)
SKIP_WEBHOOK_VERIFICATION=false
```

**Important:** Replace the following values:
- `MONGODB_URI`: Your MongoDB Atlas connection string
- `NYLAS_API_KEY`: Your Nylas API key
- `OPENAI_API_KEY`: Your OpenAI API key (get from https://platform.openai.com/api-keys)
- `NYLAS_WEBHOOK_SECRET`: leave it blank
- `WEBHOOK_BASE_URL`: Your VS Code tunnel URL (without `/api/webhooks/nylas`)
 - SKIP_WEBHOOK_VERIFICATION=false

#### Frontend Environment (.env.local)

Create `frontend/.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### Step 6: Start the Application

1. **Start Backend Server:**
   ```bash
   cd backend
   npm run server
   ```

   You should see:
   ```
   Server is running on port 4000
   MongoDB Connected: your-cluster-name
   ✅ Webhook created successfully
   ```

2. **Start Frontend (in a new terminal):**
   ```bash
   cd frontend
   npm run dev
   ```

   You should see:
   ```
   ready - started server on 0.0.0.0:3000
   ```

3. **Open Application:**
   - Go to `http://localhost:3000`
   - You should see the Notetaker Dashboard

### Step 7: Test the Integration

1. **Invite Notetaker to a Meeting:**
   - Click "Go to Notetaker Dashboard"
   - Enter a Zoom meeting URL
   - Click "Invite Notetaker"
   - The Nylas bot will join your meeting

2. **Check Real-time Updates:**
   - Watch the dashboard for real-time session updates
   - Session states will change: `connecting` → `connected` → `attending`

3. **Get Transcripts:**
   - After the meeting ends, transcripts will be automatically downloaded
   - Click "View Transcript" to see the results

## 🏗️ Project Structure

```
fundraise-hackathon-two/
├── backend/                 # Express.js API server
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── index.ts        # Server entry point
│   ├── .env               # Backend environment variables
│   └── package.json
├── frontend/               # Next.js React app
│   ├── pages/             # React pages
│   ├── lib/               # API client
│   ├── .env.local         # Frontend environment variables
│   └── package.json
└── README.md
```

## 🔧 API Endpoints

### Notetaker Management
- `POST /api/notetaker/invite` - Invite notetaker to meeting
- `GET /api/notetaker/sessions` - Get all sessions
- `GET /api/notetaker/sessions/:id` - Get specific session
- `DELETE /api/notetaker/sessions/:id/cancel` - Cancel notetaker

### Transcripts
- `GET /api/notetaker/transcripts` - Get all transcripts
- `GET /api/notetaker/transcripts/:id` - Get specific transcript
- `GET /api/notetaker/transcripts/notetaker/:id` - Get transcript by notetaker ID

### Real-time Updates
- `GET /api/sse/sessions` - Server-Sent Events for live updates

### Webhooks
- `GET /api/webhooks/nylas` - Webhook challenge verification
- `POST /api/webhooks/nylas` - Webhook event handler

## 🐛 Troubleshooting

### Common Issues

**1. "Webhook registration failed"**
- Check that `WEBHOOK_BASE_URL` is a valid HTTPS URL
- Ensure VS Code port forwarding is active and PUBLIC
- Verify Nylas API key is correct

**2. "MongoDB connection failed"**
- Check MongoDB Atlas connection string
- Ensure network access is configured (allow 0.0.0.0/0)
- Verify username/password in connection string

**3. "Notetaker not joining meeting"**
- Ensure meeting URL is valid Zoom link
- Check that meeting is active when inviting notetaker
- Verify Nylas API key has notetaker permissions

**4. "No transcripts appearing"**
- Transcripts are generated after meeting ends
- Check webhook logs in backend console
- Ensure meeting had audio content to transcribe
- Wait a minute or two for nylas to join meeting and start talking only when you see recording active in the logs webhook notification



### Checking Logs

**Backend logs show:**
- Webhook events received
- Transcript processing status
- Database operations
- API calls to Nylas

**Frontend logs show:**
- API requests
- Real-time updates
- UI state changes

## 📚 Additional Resources

- [Nylas Notetaker API Documentation](https://developer.nylas.com/docs/v3/notetaker/)
- [MongoDB Atlas Setup Guide](https://docs.atlas.mongodb.com/getting-started/)

## 🤝 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review backend console logs for errors
3. Ensure all environment variables are set correctly
4. Verify VS Code port forwarding is active


---

**🎉 You're all set!** Your Nylas Notetaker integration should now be running and ready to transcribe meetings automatically.