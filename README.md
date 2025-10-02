# Fundraise Hackathon 2 - Nylas Notetaker Integration

A full-stack application that integrates Nylas Notetaker API to automatically join Zoom meetings, record conversations, and generate AI-powered transcripts, summaries, and action items.

## 🎯 Features

- **Standalone Notetaker Integration** - Invite Nylas bot to any Zoom meeting without calendar integration
- **Automatic Transcription** - Get full meeting transcripts automatically
- **AI-Powered Summaries** - Generate concise meeting summaries
- **Action Items Extraction** - Automatically extract action items from conversations
- **Audio & Video Recording** - Download meeting recordings
- **Real-time Webhooks** - Receive notifications when transcripts are ready
- **MongoDB Storage** - All data persisted in your database

## 🏗️ Architecture

### Backend (Express + TypeScript + MongoDB)

- **Nylas Service Layer** - Handles all Nylas API interactions using the Nylas SDK
- **Express API** - RESTful endpoints for frontend
- **Webhook Handler** - Processes Nylas webhook notifications
- **MongoDB Models** - Stores sessions, transcripts, and webhook events

### Frontend (Next.js 13 + TypeScript)

- **Notetaker Dashboard** - Invite and manage notetakers
- **Transcript Viewer** - View transcripts, summaries, and action items
- **API Client** - Type-safe API integration

## 🚀 Quick Start

See [SETUP.md](./SETUP.md) for detailed setup instructions.

### Prerequisites

- Node.js 22.16.0
- MongoDB
- Nylas account with Zoom authentication

### Installation

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd fundraise-hackathon-two
```

2. **Setup Backend**

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your Nylas credentials
npm run dev
```

3. **Setup Frontend**

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

4. **Access the application**

- Frontend: http://localhost:3000
- Backend: http://localhost:4000

## 📁 Project Structure

```
fundraise-hackathon-two/
├── backend/
│   ├── src/
│   │   ├── models/              # MongoDB schemas
│   │   │   ├── NotetakerSession.ts
│   │   │   ├── Transcript.ts
│   │   │   └── WebhookEvent.ts
│   │   ├── services/            # Business logic
│   │   │   └── nylasService.ts
│   │   ├── controllers/         # Request handlers
│   │   │   ├── notetakerController.ts
│   │   │   └── webhookController.ts
│   │   ├── routes/              # API routes
│   │   │   ├── notetaker.ts
│   │   │   └── webhook.ts
│   │   ├── config/
│   │   │   └── database.ts
│   │   └── index.ts             # Server entry point
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── pages/
│   │   ├── notetaker/
│   │   │   ├── index.tsx        # Dashboard
│   │   │   └── transcript/
│   │   │       └── [notetakerId].tsx  # Transcript viewer
│   │   ├── _app.tsx
│   │   └── index.tsx            # Homepage
│   ├── lib/
│   │   └── notetakerApi.ts      # API client
│   ├── .env.local.example
│   └── package.json
├── SETUP.md                      # Detailed setup guide
└── README.md
```

## 🔌 API Endpoints

### Notetaker Management

- `POST /api/notetaker/invite` - Invite notetaker to a meeting
- `GET /api/notetaker/sessions` - List all sessions
- `GET /api/notetaker/sessions/:id` - Get session details
- `DELETE /api/notetaker/sessions/:id/cancel` - Cancel scheduled notetaker
- `POST /api/notetaker/sessions/:id/leave` - Remove from active meeting

### Transcripts

- `GET /api/notetaker/transcripts` - List all transcripts
- `GET /api/notetaker/transcripts/:id` - Get transcript details
- `GET /api/notetaker/transcripts/notetaker/:notetakerId` - Get by notetaker ID

### Webhooks

- `POST /api/webhooks/nylas` - Receive Nylas notifications

## 🔐 Environment Variables

### Backend (.env)

```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/fundraise-hackathon
NYLAS_API_KEY=your_api_key
NYLAS_API_URI=https://api.us.nylas.com
NYLAS_WEBHOOK_SECRET=your_webhook_secret
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## 📊 Data Flow

1. **User invites notetaker** → Frontend calls backend API
2. **Backend calls Nylas API** → Creates notetaker, saves to MongoDB
3. **Notetaker joins meeting** → Nylas sends webhook notification
4. **Meeting ends** → Nylas processes recording
5. **Media ready** → Nylas sends webhook with download URLs
6. **Backend downloads files** → Stores transcript text in MongoDB
7. **User views transcript** → Frontend fetches from backend API

## 🛠️ Tech Stack

- **Backend**: Express.js, TypeScript, Mongoose, Nylas SDK
- **Frontend**: Next.js 13, React 18, TypeScript
- **Database**: MongoDB
- **APIs**: Nylas Notetaker API v3
- **Deployment**: Ready for Vercel (frontend) + Railway/Heroku (backend)

## 📝 Usage Example

```typescript
// Invite notetaker to a meeting
const response = await notetakerApi.inviteNotetaker({
	meetingLink: "https://zoom.us/j/123456789",
	name: "My Notetaker",
	enableSummary: true,
	enableActionItems: true,
})

// Get transcript after meeting
const transcript = await notetakerApi.getTranscriptByNotetakerId(
	response.data.notetaker.id
)

console.log(transcript.data.transcriptText)
console.log(transcript.data.summaryText)
console.log(transcript.data.actionItems)
```

## 🐛 Troubleshooting

See [SETUP.md](./SETUP.md#troubleshooting) for common issues and solutions.

## 📚 Documentation

- [Nylas Notetaker API Docs](https://developer.nylas.com/docs/v3/notetaker/)
- [Nylas Node.js SDK](https://github.com/nylas/nylas-nodejs)
- [Setup Guide](./SETUP.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Built with [Nylas API](https://www.nylas.com/)
- Powered by [Next.js](https://nextjs.org/) and [Express](https://expressjs.com/)
