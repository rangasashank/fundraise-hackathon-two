# Deployment Checklist

Use this checklist to ensure everything is properly configured before deploying to production.

## Pre-Deployment Checklist

### 1. Nylas Configuration
- [ ] Nylas account created
- [ ] Application created in Nylas Dashboard
- [ ] API Key obtained
- [ ] Zoom account authenticated with Nylas
- [ ] Grant ID obtained
- [ ] Webhook URL configured in Nylas Dashboard
- [ ] Webhook secret generated and saved
- [ ] Webhook events subscribed:
  - [ ] notetaker.created
  - [ ] notetaker.updated
  - [ ] notetaker.meeting_state
  - [ ] notetaker.media
  - [ ] notetaker.deleted

### 2. Backend Configuration
- [ ] MongoDB instance provisioned (Atlas recommended for production)
- [ ] MongoDB connection string obtained
- [ ] Environment variables configured:
  - [ ] PORT
  - [ ] NODE_ENV=production
  - [ ] MONGODB_URI
  - [ ] NYLAS_API_KEY
  - [ ] NYLAS_GRANT_ID
  - [ ] NYLAS_API_URI
  - [ ] NYLAS_WEBHOOK_SECRET
- [ ] Dependencies installed: `npm install`
- [ ] TypeScript compiled: `npm run build`
- [ ] Production build tested: `npm start`

### 3. Frontend Configuration
- [ ] Environment variables configured:
  - [ ] NEXT_PUBLIC_API_URL (production backend URL)
- [ ] Dependencies installed: `npm install`
- [ ] Production build created: `npm run build`
- [ ] Build tested locally: `npm start`

### 4. Database Setup
- [ ] MongoDB indexes created (automatic on first run)
- [ ] Database backup strategy configured
- [ ] Connection pooling configured
- [ ] Database monitoring enabled

### 5. Security
- [ ] Webhook signature verification enabled
- [ ] CORS configured for production domain
- [ ] Environment variables secured (not in code)
- [ ] API rate limiting considered
- [ ] HTTPS enabled for all endpoints
- [ ] MongoDB authentication enabled
- [ ] Sensitive data encrypted at rest

### 6. Monitoring & Logging
- [ ] Error logging configured (Sentry, LogRocket, etc.)
- [ ] Performance monitoring enabled
- [ ] Database monitoring enabled
- [ ] Webhook delivery monitoring
- [ ] Alert system configured for failures

## Deployment Steps

### Option A: Deploy to Railway (Backend)

1. **Create Railway Account**
   - Sign up at https://railway.app

2. **Create New Project**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login
   railway login
   
   # Initialize project
   cd backend
   railway init
   ```

3. **Add MongoDB**
   - Add MongoDB plugin in Railway dashboard
   - Copy connection string to environment variables

4. **Configure Environment Variables**
   - Add all variables from .env to Railway
   - Use Railway dashboard or CLI

5. **Deploy**
   ```bash
   railway up
   ```

6. **Get Deployment URL**
   - Copy the generated URL (e.g., https://your-app.railway.app)
   - Update Nylas webhook URL

### Option B: Deploy to Heroku (Backend)

1. **Create Heroku Account**
   - Sign up at https://heroku.com

2. **Install Heroku CLI**
   ```bash
   brew install heroku/brew/heroku  # macOS
   ```

3. **Create App**
   ```bash
   cd backend
   heroku create your-app-name
   ```

4. **Add MongoDB**
   ```bash
   heroku addons:create mongolab:sandbox
   ```

5. **Set Environment Variables**
   ```bash
   heroku config:set NYLAS_API_KEY=your_key
   heroku config:set NYLAS_GRANT_ID=your_grant_id
   heroku config:set NYLAS_API_URI=https://api.us.nylas.com
   heroku config:set NYLAS_WEBHOOK_SECRET=your_secret
   heroku config:set NODE_ENV=production
   ```

6. **Deploy**
   ```bash
   git push heroku main
   ```

### Option C: Deploy to Vercel (Frontend)

1. **Create Vercel Account**
   - Sign up at https://vercel.com

2. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

3. **Deploy**
   ```bash
   cd frontend
   vercel
   ```

4. **Configure Environment Variables**
   - Add NEXT_PUBLIC_API_URL in Vercel dashboard
   - Point to your production backend URL

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## Post-Deployment Checklist

### 1. Verify Backend
- [ ] Health endpoint accessible: `curl https://your-backend.com/health`
- [ ] API endpoints responding correctly
- [ ] MongoDB connection working
- [ ] Logs showing no errors

### 2. Verify Frontend
- [ ] Homepage loads correctly
- [ ] Dashboard accessible
- [ ] Can submit invite form
- [ ] API calls reaching backend
- [ ] No console errors

### 3. Verify Webhooks
- [ ] Webhook URL updated in Nylas Dashboard
- [ ] Test webhook delivery
- [ ] Webhook events being processed
- [ ] Webhook events stored in database

### 4. End-to-End Test
- [ ] Create test Zoom meeting
- [ ] Invite notetaker via production UI
- [ ] Notetaker joins meeting successfully
- [ ] Meeting recorded
- [ ] Webhooks received
- [ ] Transcript downloaded and stored
- [ ] Transcript visible in UI

### 5. Performance
- [ ] Page load times acceptable
- [ ] API response times < 500ms
- [ ] Database queries optimized
- [ ] No memory leaks
- [ ] Proper caching configured

### 6. Monitoring
- [ ] Error tracking working
- [ ] Logs being collected
- [ ] Alerts configured
- [ ] Uptime monitoring enabled
- [ ] Database metrics tracked

## Production Environment Variables

### Backend
```env
# Server
PORT=4000
NODE_ENV=production

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname

# Nylas
NYLAS_API_KEY=nyk_v0_xxxxxxxxxxxxx
NYLAS_GRANT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
NYLAS_API_URI=https://api.us.nylas.com
NYLAS_WEBHOOK_SECRET=your_secure_webhook_secret_here
```

### Frontend
```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
```

## Rollback Plan

If deployment fails:

1. **Backend Rollback**
   ```bash
   # Railway
   railway rollback
   
   # Heroku
   heroku rollback
   ```

2. **Frontend Rollback**
   ```bash
   # Vercel
   vercel rollback
   ```

3. **Database Rollback**
   - Restore from backup
   - Revert schema changes if any

## Maintenance

### Regular Tasks
- [ ] Monitor error logs daily
- [ ] Check webhook delivery success rate
- [ ] Review database performance weekly
- [ ] Update dependencies monthly
- [ ] Backup database daily
- [ ] Review and rotate API keys quarterly

### Scaling Considerations
- [ ] Database connection pooling
- [ ] API rate limiting
- [ ] Caching layer (Redis)
- [ ] Load balancing
- [ ] CDN for frontend assets
- [ ] Background job processing

## Support & Documentation

- [ ] Production URLs documented
- [ ] Environment variables documented
- [ ] Deployment process documented
- [ ] Rollback procedure documented
- [ ] Support contacts listed
- [ ] Incident response plan created

## Final Verification

Before going live:
- [ ] All checklist items completed
- [ ] End-to-end test passed
- [ ] Performance acceptable
- [ ] Security review completed
- [ ] Monitoring configured
- [ ] Team trained on system
- [ ] Documentation updated
- [ ] Backup and recovery tested

---

## Production URLs Template

Fill in after deployment:

- **Frontend**: https://___________________
- **Backend**: https://___________________
- **MongoDB**: mongodb+srv://___________________
- **Nylas Dashboard**: https://dashboard.nylas.com
- **Monitoring**: https://___________________
- **Logs**: https://___________________

## Emergency Contacts

- **Nylas Support**: https://support.nylas.com
- **MongoDB Support**: https://support.mongodb.com
- **Hosting Support**: ___________________
- **Team Lead**: ___________________
- **DevOps**: ___________________

---

**Deployment Status**: [ ] Not Started | [ ] In Progress | [ ] Completed

**Deployed By**: ___________________

**Deployment Date**: ___________________

**Production Go-Live Date**: ___________________

