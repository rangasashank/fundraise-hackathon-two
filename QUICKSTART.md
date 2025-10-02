# Quick Start Guide - 5 Minutes to Running

Get the Nylas Notetaker integration running in 5 minutes!

## Prerequisites Check

Before starting, make sure you have:

- [ ] Node.js 22.16.0 installed (`node --version`)
- [ ] MongoDB running (`mongosh` to test)
- [ ] Nylas account created (or ready to create one)

## Step 1: Get Nylas Credentials (2 minutes)

### Get Your Nylas API Key

1. Go to https://dashboard.nylas.com (or sign up if you don't have an account)
2. Create a new application (if you haven't already)
3. Copy your **API Key** from the application settings

**That's it!** With standalone notetakers, you only need an API key - no OAuth or grant setup required!

## Step 2: Backend Setup (1 minute)

```bash
# Navigate to backend
cd backend

# Install dependencies (if not already done)
npm install

# Create environment file
cp .env.example .env

# Edit .env with your credentials
# Required: NYLAS_API_KEY, NYLAS_GRANT_ID, MONGODB_URI
nano .env  # or use your preferred editor
```

**Minimal .env configuration:**

```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/fundraise-hackathon
NYLAS_API_KEY=your_api_key_here
NYLAS_API_URI=https://api.us.nylas.com
```

```bash
# Start the backend
npm run dev
```

✅ Backend should be running on http://localhost:4000

## Step 3: Frontend Setup (1 minute)

Open a new terminal:

```bash
# Navigate to frontend
cd frontend

# Install dependencies (if not already done)
npm install

# Create environment file
cp .env.local.example .env.local

# Start the frontend
npm run dev
```

✅ Frontend should be running on http://localhost:3000

## Step 4: Test It! (1 minute)

1. **Open browser**: http://localhost:3000
2. **Click**: "Go to Notetaker Dashboard"
3. **Enter a Zoom link**: `https://zoom.us/j/your-meeting-id`
4. **Click**: "Invite Notetaker"
5. **See success**: Session appears in the table!

## Step 5: Setup Webhooks (Optional - for production)

For development, you can skip this initially. For full functionality:

```bash
# Install ngrok
brew install ngrok  # macOS
# or download from https://ngrok.com

# Expose backend
ngrok http 4000

# Copy the ngrok URL (e.g., https://abc123.ngrok.io)
# Add to Nylas Dashboard webhooks: https://abc123.ngrok.io/api/webhooks/nylas
```

## Verify Everything Works

### Check Backend

```bash
curl http://localhost:4000/health
# Should return: {"status":"ok","timestamp":"..."}
```

### Check Frontend

- Visit http://localhost:3000
- Should see homepage with features list

### Check Database

```bash
mongosh
use fundraise-hackathon
show collections
# Should see: notetakersessions, transcripts, webhookevents
```

## Common Quick Fixes

### "Cannot connect to MongoDB"

```bash
# Start MongoDB
brew services start mongodb-community  # macOS
# or
mongod  # Linux
```

### "Nylas authentication failed"

- Double-check NYLAS_API_KEY in backend/.env
- Make sure you copied the correct API key from Nylas Dashboard
- Verify the API key hasn't expired or been revoked

### "Port already in use"

```bash
# Kill process on port 4000
lsof -ti:4000 | xargs kill -9

# Or change port in backend/.env
PORT=4001
```

### Frontend can't connect to backend

- Check NEXT_PUBLIC_API_URL in frontend/.env.local
- Verify backend is running on correct port
- Check browser console for CORS errors

## What's Next?

Now that everything is running:

1. **Test with a real meeting**:

   - Create a Zoom meeting
   - Invite the notetaker
   - Join the meeting and admit the bot
   - End meeting and wait for transcript

2. **Explore the code**:

   - Backend: `backend/src/`
   - Frontend: `frontend/pages/notetaker/`
   - Models: `backend/src/models/`

3. **Read the docs**:
   - [SETUP.md](./SETUP.md) - Detailed setup
   - [TESTING.md](./TESTING.md) - Testing guide
   - [README.md](./README.md) - Full documentation

## Development Workflow

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev

# Terminal 3: MongoDB (if needed)
mongod

# Terminal 4: ngrok (for webhooks)
ngrok http 4000
```

## Quick Commands Reference

```bash
# Backend
cd backend
npm run dev          # Start dev server
npm run build        # Build for production
npm start            # Run production build

# Frontend
cd frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm start            # Run production build

# Database
mongosh                                    # Connect to MongoDB
use fundraise-hackathon                    # Switch to database
db.notetakersessions.find().pretty()      # View sessions
db.transcripts.find().pretty()            # View transcripts
db.webhookevents.find().pretty()          # View webhooks
```

## Troubleshooting in 30 Seconds

1. **Backend not starting?**

   - Check MongoDB is running
   - Verify .env file exists and has correct values
   - Check port 4000 is available

2. **Frontend not loading?**

   - Check backend is running
   - Verify .env.local has correct API URL
   - Clear browser cache

3. **Notetaker not working?**
   - Verify Nylas credentials are correct
   - Check meeting link format
   - Review backend logs for errors

## Success Checklist

- [ ] Backend running on port 4000
- [ ] Frontend running on port 3000
- [ ] MongoDB connected
- [ ] Can access dashboard at http://localhost:3000/notetaker
- [ ] Can invite notetaker (session appears in table)
- [ ] No errors in terminal logs

## Need Help?

1. Check [SETUP.md](./SETUP.md) for detailed instructions
2. Review [TESTING.md](./TESTING.md) for testing steps
3. Check backend logs for error messages
4. Verify MongoDB data: `db.notetakersessions.find()`
5. Test API directly with curl

---

**You're all set!** 🚀

The application is now running and ready to use. Try inviting a notetaker to a test Zoom meeting!
