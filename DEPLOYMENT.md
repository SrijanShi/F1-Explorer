# F1 Explorer Deployment Guide

## Deployment Architecture

Your F1 Explorer application consists of:
1. **React Frontend** - Static site (port 3000 locally)
2. **Node.js Backend** - Express API (port 5000 locally)
3. **Python FastAPI Service** - Transcript fetching (port 8000 locally)
4. **MongoDB Database** - Data storage

## Recommended: Render (Best for Your Project)

**Why Render?**
- ✅ Free tier available for all services
- ✅ Native support for Node.js, Python, and static sites
- ✅ Easy GitHub integration with auto-deploys
- ✅ Built-in environment variable management
- ✅ Free SSL certificates
- ✅ Simple blueprint deployment with `render.yaml`

---

## Step-by-Step Deployment on Render

### Phase 1: Set Up MongoDB Atlas

1. **Create MongoDB Atlas Account**
   - Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
   - Sign up for free tier

2. **Create a Cluster**
   - Click "Build a Database"
   - Select "M0 Free" tier
   - Choose a region closest to your Render services (US East recommended)
   - Name: `f1-cluster`

3. **Configure Database Access**
   - Go to "Database Access" → "Add New Database User"
   - Create username/password (save these securely!)
   - Grant "Read and write to any database" privileges

4. **Configure Network Access**
   - Go to "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - This is needed for Render services

5. **Get Connection String**
   - Go to "Database" → Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string, it looks like:
     ```
     mongodb+srv://username:<password>@f1-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your actual password
   - Add database name: `mongodb+srv://username:password@f1-cluster.xxxxx.mongodb.net/f1_explorer?retryWrites=true&w=majority`

### Phase 2: Prepare Your Code

1. **Update Frontend API URLs**
   
   Edit these files to use environment variable instead of localhost:
   
   - `f1-explorer/src/components/Authentication/ProfilePage.js`
   - `f1-explorer/src/components/News/news.js`
   - `f1-explorer/src/components/Highlights/HighlightsPage.jsx`
   
   Replace `http://localhost:5000` with:
   ```javascript
   const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
   // Then use: `${API_URL}/api/...`
   ```

2. **Verify Backend Environment Variables**
   
   Ensure `backend/src/controllers/gettingTranscript.js` uses:
   ```javascript
   const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://127.0.0.1:8000';
   ```

3. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Prepare for Render deployment"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

### Phase 3: Deploy on Render

#### Option A: Blueprint Deployment (Recommended - Uses render.yaml)

1. **Go to Render Dashboard**
   - Visit [render.com](https://render.com)
   - Sign up/login with GitHub

2. **New Blueprint Instance**
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Render will detect `render.yaml` automatically

3. **Configure Environment Variables**
   
   Render will prompt for these variables:
   
   **For f1-backend:**
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `YOUTUBE_API_KEY`: Your YouTube Data API v3 key
   - `GEMIMI_API_KEY`: Your Google Gemini API key
   - `NEWS_API_KEY`: Your News API key
   - `JWT_SECRET`: Generate a secure random string (e.g., `openssl rand -base64 32`)
   - `PORT`: `5000`
   - `PYTHON_API_URL`: Will be `https://f1-python-api.onrender.com` (update after Python service deploys)
   
   **For f1-python-api:**
   - `PORT`: `8000`
   
   **For f1-frontend:**
   - `REACT_APP_API_URL`: Will be `https://f1-backend.onrender.com` (update after backend deploys)
   - `REACT_APP_AUTH0_DOMAIN`: Your Auth0 domain
   - `REACT_APP_AUTH0_CLIENT_ID`: Your Auth0 client ID

4. **Deploy**
   - Click "Apply"
   - Render will deploy all three services simultaneously
   - Wait 5-10 minutes for initial deployment

5. **Update Service URLs**
   
   After first deployment, you need to update the URLs:
   
   a. Copy your service URLs:
      - Backend: `https://f1-backend.onrender.com`
      - Python API: `https://f1-python-api.onrender.com`
      - Frontend: `https://f1-explorer.onrender.com`
   
   b. Update environment variables:
      - In backend service settings, set `PYTHON_API_URL` to Python service URL
      - In frontend service settings, set `REACT_APP_API_URL` to backend URL
   
   c. Trigger manual redeploys for services with updated env vars

#### Option B: Manual Service Creation

If you prefer more control:

1. **Deploy Python Service First**
   - New + → Web Service
   - Connect GitHub repo
   - Settings:
     - Name: `f1-python-api`
     - Environment: `Python 3`
     - Build Command: `cd backend/src/python && pip install -r requirements.txt`
     - Start Command: `cd backend/src/python && uvicorn highlightExtractor:app --host 0.0.0.0 --port $PORT`
   - Deploy and copy the URL

2. **Deploy Backend Service**
   - New + → Web Service
   - Settings:
     - Name: `f1-backend`
     - Environment: `Node`
     - Build Command: `cd backend && npm install`
     - Start Command: `cd backend && node index.js`
   - Add all backend environment variables (including `PYTHON_API_URL` from step 1)
   - Deploy and copy the URL

3. **Deploy Frontend**
   - New + → Static Site
   - Settings:
     - Name: `f1-frontend`
     - Build Command: `cd f1-explorer && npm install && npm run build`
     - Publish Directory: `f1-explorer/build`
   - Add `REACT_APP_API_URL` (from step 2)
   - Deploy

### Phase 4: Configure Auth0 for Production

1. Go to Auth0 Dashboard → Applications → Your App
2. Update these settings:
   - **Allowed Callback URLs**: Add `https://your-frontend-url.onrender.com/callback`
   - **Allowed Logout URLs**: Add `https://your-frontend-url.onrender.com`
   - **Allowed Web Origins**: Add `https://your-frontend-url.onrender.com`

### Phase 5: Test Your Deployment

1. Visit your frontend URL: `https://f1-frontend.onrender.com`
2. Test authentication flow (Auth0 login/signup)
3. Test fetching videos: Check backend logs for video ID fetching
4. Test transcript fetching: Check Python service logs
5. Test event generation: Should create events for new races

---

## Alternative Deployment Options

### Option 2: Railway

Similar to Render, excellent for multi-service apps:
- Visit [railway.app](https://railway.app)
- Better for monorepos
- More generous free tier ($5 credit/month)
- Easier environment variable management
- Slightly better performance

**Deployment Steps:**
1. Create new project from GitHub repo
2. Add three services: Node backend, Python API, and Frontend
3. Railway auto-detects and builds each service
4. Add MongoDB plugin (Railway provides managed MongoDB)

### Option 3: Vercel (Frontend) + Render/Railway (Backend)

Split deployment:
- **Vercel**: Host React frontend (excellent for static sites)
- **Render/Railway**: Host Node.js + Python backends

**Pros:** Best frontend performance with Vercel's CDN
**Cons:** Managing multiple platforms

### Option 4: Self-Hosted VPS (DigitalOcean, Linode, AWS EC2)

**Pros:**
- Full control
- Better for production apps with traffic
- Cost-effective at scale

**Cons:**
- Requires DevOps knowledge
- Need to manage SSL, nginx, PM2, etc.

**Quick VPS Setup:**
```bash
# Install dependencies
sudo apt update
sudo apt install nodejs npm python3-pip mongodb nginx

# Clone repo
git clone <your-repo>

# Setup Python service
cd backend/src/python
pip3 install -r requirements.txt
uvicorn highlightExtractor:app --host 127.0.0.1 --port 8000 &

# Setup Node backend
cd ../..
npm install
node index.js &

# Build and serve frontend
cd f1-explorer
npm install
npm run build
# Configure nginx to serve build folder
```

---

## Cost Breakdown

### Free Tier (Good for Development/Portfolio)
- **Render Free**: 
  - 750 hours/month per service
  - Services sleep after 15 min inactivity
  - Startup time: ~30 seconds
  - Total: $0/month

- **MongoDB Atlas Free**: 
  - 512 MB storage
  - Shared RAM
  - Total: $0/month

**Total: $0/month** ✅

### Production Tier (Recommended for Real Users)
- **Render Starter**: 
  - Backend: $7/month
  - Python API: $7/month
  - Frontend (static): Free
  - Total: $14/month

- **MongoDB Atlas Shared**: 
  - 2-5 GB storage
  - Shared cluster
  - Total: $9/month

**Total: ~$23/month**

---

## Troubleshooting

### Issue: Services Can't Communicate

**Solution:** Update PYTHON_API_URL to use internal network:
```javascript
// In Render, services in same account can use internal URLs
const PYTHON_API_URL = process.env.PYTHON_API_URL_INTERNAL || process.env.PYTHON_API_URL;
```

### Issue: Frontend Shows 404 for API Calls

**Solution:** Check CORS configuration in `backend/index.js`:
```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-frontend.onrender.com'
  ]
}));
```

### Issue: MongoDB Connection Fails

**Solution:** 
1. Verify IP whitelist includes 0.0.0.0/0
2. Check connection string format
3. Ensure password doesn't have special characters (use URL encoding if needed)

### Issue: Services Sleep on Free Tier

**Solution:**
1. Use [cron-job.org](https://cron-job.org) to ping services every 10 minutes
2. Upgrade to paid tier ($7/month per service)
3. Use UptimeRobot for monitoring and keep-alive pings

### Issue: Transcripts Fail (YouTube Rate Limit)

**Solution:**
- YouTube has strict rate limits
- Add delays between transcript fetches in production
- Consider caching transcripts once fetched
- Use YouTube Transcript API alternatives if available

---

## Security Checklist

Before going live:

- [ ] All API keys in environment variables (never commit to Git)
- [ ] MongoDB Atlas network access configured
- [ ] Auth0 callback URLs updated for production domain
- [ ] CORS configured with specific origins (not `*`)
- [ ] JWT_SECRET is strong random string
- [ ] Rate limiting enabled on backend endpoints
- [ ] Input validation on all API routes
- [ ] HTTPS enforced (Render provides this automatically)

---

## Monitoring & Maintenance

1. **Render Dashboard**
   - Monitor service health
   - Check logs for errors
   - Track deploy history

2. **MongoDB Atlas**
   - Monitor database size
   - Set up alerts for connection issues
   - Regular backups (Atlas handles this)

3. **Error Tracking**
   - Consider adding Sentry.io for error monitoring
   - Set up log aggregation (Papertrail, LogDNA)

4. **Performance**
   - Monitor API response times
   - Track Gemini AI API quota usage
   - Set up uptime monitoring (UptimeRobot)

---

## Next Steps

1. ✅ Created `render.yaml` for blueprint deployment
2. ✅ Created `.env.example` as reference
3. ✅ Created `requirements.txt` for Python service
4. 🔄 Update frontend code to use environment variables
5. 🔄 Push code to GitHub
6. 🔄 Deploy on Render following this guide
7. 🔄 Update Auth0 settings
8. 🔄 Test complete workflow in production

---

## Support

If you encounter issues:
- Render docs: [render.com/docs](https://render.com/docs)
- MongoDB Atlas docs: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)
- Join Render community: [community.render.com](https://community.render.com)

Good luck with your deployment! 🏎️
