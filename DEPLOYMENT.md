# F1 Explorer Deployment Guide

## Deployment Architecture

Your F1 Explorer application consists of:
1. **React Frontend** - Static site (port 3000 locally)
2. **Node.js Backend** - Express API (port 5000 locally)
3. **Python FastAPI Service** - Transcript fetching (port 8000 locally)
4. **MongoDB Database** - Data storage (MongoDB Atlas)

## Recommended: Fly.io (Best for Your Project)

**Why Fly.io?**
- ✅ Free tier with 3 VMs and 3GB storage
- ✅ Runs all services in a single container (cost-effective)
- ✅ Automatic SSL certificates
- ✅ Global CDN and edge computing
- ✅ Simple deployment with `flyctl deploy`
- ✅ Auto-scaling and auto-sleep on free tier
- ✅ Built-in health checks and monitoring

---

## Quick Start: Deploy to Fly.io

### See [FLY_DEPLOYMENT.md](FLY_DEPLOYMENT.md) for complete step-by-step guide!

**Quick steps:**
1. Install flyctl: `curl -L https://fly.io/install.sh | sh`
2. Login: `flyctl auth login`
3. Set secrets: `flyctl secrets set MONGODB_URI="..."`
4. Deploy: `flyctl deploy`
5. Done! 🎉

**Total time: ~15 minutes**

---

---

## MongoDB Atlas Setup (Already Complete! ✅)

Your MongoDB Atlas is already configured and migrated!

**Current Setup:**
- Cluster: cluster0.gmsrvmd.mongodb.net
- Database: f1_explorer
- Collections: f1videos (25), f1videodetails (25), users (8), savedarticles (3)
- Connection String: Already in backend/.env

---

## Alternative Deployment Options

### Option 2: Railway

Similar to Fly.io, excellent for multi-service apps:
- Visit [railway.app](https://railway.app)
- Better for monorepos
- $5 credit/month free tier
- Easier environment variable management

**Deployment Steps:**
1. Create new project from GitHub repo
2. Railway auto-detects and suggests services
3. Add MongoDB Atlas connection string
4. Deploy with one click

### Option 3: Docker Compose + VPS

For more control, deploy to any VPS:

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=${MONGODB_URI}
      - YOUTUBE_API_KEY=${YOUTUBE_API_KEY}
    restart: always
```

Deploy to DigitalOcean, Linode, or AWS EC2.

### Phase 3: Deploy on Render

#### Option A: Blueprint Deployment (Recommended - Uses render.yaml)

1. **Go to Render Dashboard**
   - Visit [render.com](https://render.com)
   - Sign up/login with GitHub

2. **New Blueprint Instance**
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
---

## Cost Breakdown

### Free Tier (Development/Portfolio)
- **Fly.io Free**: 
  - 3 shared VMs (256MB each)
  - 3GB persistent volumes
  - 100GB bandwidth/month
  - Auto-sleep after inactivity
  - Total: $0/month

- **MongoDB Atlas Free**: 
  - 512 MB storage
  - Shared RAM
  - Total: $0/month

**Total: $0/month** ✅

### Production Tier (Recommended for Real Users)
- **Fly.io Hobby**: 
  - Shared CPU, 512MB RAM
  - Always-on instance
  - Total: $5/month

- **MongoDB Atlas Shared**: 
  - 2-5 GB storage
  - Total: $9/month

**Total: ~$14/month**

---

## Troubleshooting

### Issue: Services Can't Communicate

**Solution:** All services run in same container on Fly.io, communicate via localhost ✅

### Issue: Frontend Shows 404 for API Calls

**Solution:** Check CORS configuration in `backend/index.js`:
```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://f1-explorer-app.fly.dev'
  ]
}));
```

### Issue: MongoDB Connection Fails

**Solution:** 
1. Verify IP whitelist includes 0.0.0.0/0
2. Check connection string format
3. Verify secret is set: `flyctl secrets list`

### Issue: Build Fails

**Solution:**
1. Check Dockerfile syntax
2. Test locally: `docker build -t f1-test .`
3. View build logs: `flyctl logs`

---
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

---

## Security Checklist

Before going live:

- [x] All API keys in environment variables (never commit to Git)
- [x] MongoDB Atlas network access configured
- [x] Auth0 callback URLs updated for production domain
- [x] CORS configured with specific origins
- [x] JWT_SECRET is strong random string
- [ ] Rate limiting enabled on backend endpoints
- [ ] Input validation on all API routes
- [x] HTTPS enforced (Fly.io provides this automatically)

---

## Monitoring & Maintenance

1. **Fly.io Dashboard**
   - Monitor VM health: `flyctl status`
   - Check logs: `flyctl logs`
   - Track deployments: `flyctl releases`

2. **MongoDB Atlas**
   - Monitor database size
   - Set up alerts for connection issues
   - Regular backups (Atlas handles this)

3. **Error Tracking**
   - Consider adding Sentry.io for error monitoring
   - Set up log aggregation

4. **Performance**
   - Monitor API response times
   - Track Gemini AI API quota usage
   - Set up uptime monitoring (UptimeRobot)

---

## Next Steps

1. ✅ Created comprehensive Dockerfile
2. ✅ Updated fly.toml configuration
3. ✅ MongoDB Atlas migrated and connected
4. ✅ Frontend using environment variables
5. 🔄 Deploy to Fly.io (see [FLY_DEPLOYMENT.md](FLY_DEPLOYMENT.md))
6. 🔄 Update Auth0 settings
7. 🔄 Test complete workflow in production

---

## Support

If you encounter issues:
- Fly.io docs: [fly.io/docs](https://fly.io/docs)
- MongoDB Atlas docs: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)
- Fly.io community: [community.fly.io](https://community.fly.io)

Good luck with your deployment! 🏎️


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
