# 🚀 Quick Start Deployment Guide - Fly.io

Your code is now ready for deployment on Fly.io! Follow these steps:

## Why Fly.io?

✅ **All services in ONE container** - Cost-effective!  
✅ **Free tier with 3 VMs** - Perfect for your app  
✅ **Global CDN** - Fast worldwide  
✅ **Simple deployment** - Just `flyctl deploy`  
✅ **Automatic SSL** - HTTPS out of the box  

---

## Step 1: Install Flyctl (2 minutes)

### Install:
```bash
curl -L https://fly.io/install.sh | sh
```

### Add to PATH:
```bash
# Add to ~/.zshrc
export FLYCTL_INSTALL="/Users/srijanshitashma/.fly"
export PATH="$FLYCTL_INSTALL/bin:$PATH"

# Reload shell
source ~/.zshrc

# Verify
flyctl version
```

### Login:
```bash
flyctl auth login
```
Browser will open for authentication.

---

## Step 2: Set Environment Variables (3 minutes)

```bash
cd /Users/srijanshitashma/Desktop/f1

# MongoDB (Already migrated! ✅)
flyctl secrets set MONGODB_URI="mongodb+srv://srijanshitashma_db_user:kJ2KsmFvAls8l26t@cluster0.gmsrvmd.mongodb.net/f1_explorer?retryWrites=true&w=majority"

# API Keys
flyctl secrets set YOUTUBE_API_KEY="AIzaSyBEpj-gGku5cqiIMQ1_Vis5q_TAjqwqS7A"
flyctl secrets set GEMIMI_API_KEY="AIzaSyCAs3vf3nryMutBkdHj50g3JxxlailOKD4"
flyctl secrets set NEWS_API_KEY="34408f8daebe432287b43cc398873440"

# JWT Secret
flyctl secrets set JWT_SECRET="et8knkD4NKSFQA6K7t9NumA1KoM5FVR86gWTpMsqHqg="

# Frontend URL (update after first deploy)
flyctl secrets set REACT_APP_API_URL="https://f1-explorer-app.fly.dev"
flyctl secrets set FRONTEND_URL="https://f1-explorer-app.fly.dev"

# Auth0 (get from Auth0 dashboard)
flyctl secrets set REACT_APP_AUTH0_DOMAIN="your-auth0-domain.auth0.com"
flyctl secrets set REACT_APP_AUTH0_CLIENT_ID="your-auth0-client-id"
flyctl secrets set REACT_APP_AUTH0_REDIRECT_URI="https://f1-explorer-app.fly.dev/callback"
```

---

## Step 3: Deploy! (5 minutes)

```bash
cd /Users/srijanshitashma/Desktop/f1

# Create app (if not exists)
flyctl apps create f1-explorer-app

# Deploy
flyctl deploy

# Monitor deployment
flyctl logs
```

**Expected output:**
```
==> Building image
==> Pushing image to fly
==> Creating release
--> v1 deployed successfully
```

---

## Step 4: Update Auth0 (2 minutes)

1. Go to [Auth0 Dashboard](https://manage.auth0.com)
2. Applications → Your App → Settings
3. Update:

**Allowed Callback URLs:**
```
http://localhost:3000/callback, https://f1-explorer-app.fly.dev/callback
```

**Allowed Logout URLs:**
```
http://localhost:3000, https://f1-explorer-app.fly.dev
```

**Allowed Web Origins:**
```
http://localhost:3000, https://f1-explorer-app.fly.dev
```

4. **Save Changes**

---

## Step 5: Test Your App! 🎉

### Open in browser:
```bash
flyctl open
```
Or visit: `https://f1-explorer-app.fly.dev`

### Test Backend API:
```bash
curl https://f1-explorer-app.fly.dev/api/highlights/videos | jq 'length'
# Should return: 25
```

### Test Features:
- ✅ Sign up / Login with Auth0
- ✅ View F1 News
- ✅ Browse race highlights
- ✅ Click on a race to see event timeline
- ✅ Add drivers to favorites
- ✅ View your profile

---

## Useful Commands

```bash
# View status
flyctl status

# View logs
flyctl logs

# SSH into container
flyctl ssh console

# List secrets
flyctl secrets list

# Scale resources
flyctl scale vm shared-cpu-1x --memory 512

# Restart app
flyctl apps restart f1-explorer-app
```

---

## Troubleshooting

### ⚠️ Build Failed?
```bash
# Check logs
flyctl logs

# Test locally
docker build -t f1-test .
```

### ⚠️ MongoDB Connection Failed?
```bash
# Verify secret
flyctl secrets list | grep MONGODB

# Check Atlas IP whitelist (should be 0.0.0.0/0)
```

### ⚠️ Services Not Starting?
```bash
# SSH into container
flyctl ssh console

# Check processes
ps aux | grep -E 'node|python|nginx'

# Check logs
tail -f /var/log/supervisord.log
```

### ⚠️ Auth0 Login Not Working?
- Verify callback URLs in Auth0 dashboard
- Check secrets: `flyctl secrets list`
- Clear browser cache

---

## Cost: FREE! 💰

Your entire application runs on free tier:
- ✅ Fly.io: 3 shared VMs (256MB each)
- ✅ MongoDB Atlas: M0 cluster (512MB)
- ✅ Total: **$0/month**

⚠️ App sleeps after inactivity (wakes in ~30 seconds)

Upgrade to production: **~$14/month** (always-on)

---

## Next Steps

1. ✅ Deploy to Fly.io
2. ✅ Update Auth0 settings
3. ✅ Test your live app
4. 📱 Share with friends: `https://f1-explorer-app.fly.dev`
5. 📊 Monitor: `flyctl logs`

---

## Need More Help?

See **[FLY_DEPLOYMENT.md](FLY_DEPLOYMENT.md)** for comprehensive guide with:
- Detailed troubleshooting
- Architecture diagrams
- Performance tips
- Security checklist
- Scaling options

---

## 🏁 You're Live!

**Your F1 Explorer:** https://f1-explorer-app.fly.dev

Happy racing! 🏎️💨


### 1.1 Create Account & Cluster
1. Go to [mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
2. Sign up (use Google/GitHub for faster signup)
3. Create a **FREE M0 cluster**:
   - Provider: AWS
   - Region: Choose closest to Oregon (where your Render services will be)
   - Cluster Name: `f1-cluster`

### 1.2 Database Access
1. Click **Database Access** in left sidebar
2. Click **Add New Database User**
3. Create username and **STRONG** password (save this!)
4. Select: **Read and write to any database**
5. Click **Add User**

### 1.3 Network Access
1. Click **Network Access** in left sidebar
2. Click **Add IP Address**
3. Click **Allow Access from Anywhere** (0.0.0.0/0)
   - This is needed for Render services
4. Click **Confirm**

### 1.4 Get Connection String
1. Go to **Database** → Click **Connect** on your cluster
2. Choose **Connect your application**
3. Driver: Node.js, Version: 5.5 or later
4. Copy the connection string:
   ```
   mongodb+srv://username:<password>@f1-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your actual password
6. Add database name at the end:
   ```
   mongodb+srv://username:yourpassword@f1-cluster.xxxxx.mongodb.net/f1_explorer?retryWrites=true&w=majority
   ```
7. **Save this connection string** - you'll need it in Step 2!

---

## Step 2: Deploy on Render (10 minutes)

### 2.1 Sign Up & Connect GitHub
1. Go to [render.com](https://render.com)
2. Click **Get Started** → Sign up with GitHub
3. Authorize Render to access your GitHub repositories

### 2.2 Deploy Using Blueprint (Easiest Method!)

1. Click **New +** → **Blueprint**
2. Connect repository: **SrijanShi/F1-Explorer**
3. Render will detect your `render.yaml` file
4. Click **Apply**

### 2.3 Configure Environment Variables

Render will ask for these variables. Fill them carefully:

#### For **f1-backend** service:

| Variable | Value | Where to get it |
|----------|-------|-----------------|
| `MONGODB_URI` | Your MongoDB Atlas connection string | From Step 1.4 above |
| `YOUTUBE_API_KEY` | Your YouTube API key | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) |
| `GEMIMI_API_KEY` | Your Gemini API key | [Google AI Studio](https://makersuite.google.com/app/apikey) |
| `NEWS_API_KEY` | Your News API key | [newsapi.org](https://newsapi.org/register) |
| `JWT_SECRET` | Auto-generated by Render | Leave as is |
| `PYTHON_API_URL` | Leave blank for now | We'll update after deployment |
| `FRONTEND_URL` | Leave blank for now | We'll update after deployment |

#### For **f1-python-api** service:
No additional variables needed! ✅

#### For **f1-frontend** service:

| Variable | Value | Where to get it |
|----------|-------|-----------------|
| `REACT_APP_API_URL` | Leave blank for now | We'll update after deployment |
| `REACT_APP_AUTH0_DOMAIN` | Your Auth0 domain | Auth0 Dashboard → Applications |
| `REACT_APP_AUTH0_CLIENT_ID` | Your Auth0 client ID | Auth0 Dashboard → Applications |
| `REACT_APP_AUTH0_REDIRECT_URI` | Leave blank for now | We'll update after deployment |

### 2.4 Start Deployment
1. Click **Apply** to start deployment
2. Wait 5-10 minutes for all services to deploy
3. You'll see 3 services:
   - ✅ f1-backend
   - ✅ f1-python-api  
   - ✅ f1-frontend

---

## Step 3: Update Service URLs (IMPORTANT!)

Once all services are deployed, you need to connect them:

### 3.1 Copy Your Service URLs

From Render dashboard, copy these URLs:
- Backend: `https://f1-backend.onrender.com`
- Python API: `https://f1-python-api.onrender.com`
- Frontend: `https://f1-frontend.onrender.com`

### 3.2 Update Backend Environment Variables

1. Go to **f1-backend** service in Render
2. Click **Environment** tab
3. Update these variables:
   - `PYTHON_API_URL` = `https://f1-python-api.onrender.com`
   - `FRONTEND_URL` = `https://f1-frontend.onrender.com`
4. Click **Save Changes**
5. Service will automatically redeploy

### 3.3 Update Frontend Environment Variables

1. Go to **f1-frontend** service in Render
2. Click **Environment** tab
3. Update these variables:
   - `REACT_APP_API_URL` = `https://f1-backend.onrender.com`
   - `REACT_APP_AUTH0_REDIRECT_URI` = `https://f1-frontend.onrender.com/callback`
4. Click **Save Changes**
5. Service will automatically rebuild

---

## Step 4: Configure Auth0 (3 minutes)

### 4.1 Update Auth0 Settings

1. Go to [Auth0 Dashboard](https://manage.auth0.com)
2. Applications → Your Application → Settings
3. Update these fields:

**Allowed Callback URLs:**
```
http://localhost:3000/callback, https://f1-frontend.onrender.com/callback
```

**Allowed Logout URLs:**
```
http://localhost:3000, https://f1-frontend.onrender.com
```

**Allowed Web Origins:**
```
http://localhost:3000, https://f1-frontend.onrender.com
```

4. Scroll down and click **Save Changes**

---

## Step 5: Test Your Deployment! 🎉

### 5.1 Visit Your Live App
Open: `https://f1-frontend.onrender.com`

### 5.2 Test These Features:
- ✅ Sign up / Login with Auth0
- ✅ View F1 News
- ✅ Browse race highlights
- ✅ Click on a race to see event timeline
- ✅ Add drivers to favorites
- ✅ View your profile

### 5.3 Check Backend API
Open: `https://f1-backend.onrender.com/api/highlights/videos`

Should see JSON array of F1 videos!

---

## Troubleshooting

### ⚠️ Services Not Communicating?
- Check that `PYTHON_API_URL` and `REACT_APP_API_URL` are correct
- Verify no typos in URLs (should have `.onrender.com`)
- Wait 2-3 minutes after updating env vars for redeployment

### ⚠️ MongoDB Connection Failed?
- Check connection string format in `MONGODB_URI`
- Verify password doesn't have special characters (or URL-encode them)
- Confirm IP whitelist includes `0.0.0.0/0` in MongoDB Atlas

### ⚠️ Auth0 Login Not Working?
- Verify callback URLs in Auth0 dashboard
- Check `REACT_APP_AUTH0_DOMAIN` and `REACT_APP_AUTH0_CLIENT_ID`
- Clear browser cache and try again

### ⚠️ Services Sleep After 15 Minutes (Free Tier)
- **Normal behavior** on free tier
- First request after sleep takes ~30 seconds
- Upgrade to $7/month per service for always-on

### ⚠️ Build Failed?
- Check Render logs for specific error
- Common issues:
  - Missing dependencies in package.json
  - Python version mismatch (ensure Python 3.11+)
  - Environment variables not set

---

## Cost Summary

### Free Tier (Current Setup):
- Render Free: 3 services = **$0/month**
  - ⚠️ Services sleep after 15 min inactivity
  - 750 hours/month per service
- MongoDB Atlas M0: **$0/month**
  - 512 MB storage
- **Total: $0/month** ✅

### Production Tier (Recommended):
- Render Starter: 2 web services = **$14/month**
  - Backend: $7/month
  - Python API: $7/month
  - Frontend (static): Free
- MongoDB Atlas M2: **$9/month**
  - 2-5 GB storage
- **Total: ~$23/month**

---

## Next Steps After Deployment

1. **Set Up Monitoring**
   - Use [UptimeRobot](https://uptimerobot.com) for uptime monitoring
   - Add [Sentry](https://sentry.io) for error tracking

2. **Custom Domain** (Optional)
   - Buy domain on Namecheap/GoDaddy
   - Point to Render in DNS settings
   - Render provides free SSL

3. **Improve Performance**
   - Enable caching for API responses
   - Add rate limiting to prevent abuse
   - Consider CDN for static assets

4. **Data Management**
   - Schedule regular backups in MongoDB Atlas
   - Set up database monitoring alerts

---

## Important Notes

⚠️ **On Free Tier:**
- Services sleep after 15 min of inactivity
- First request after sleep: ~30 seconds to wake up
- Fine for portfolio/demo, not for production

💰 **To Upgrade:**
- Go to each service in Render
- Click "Upgrade" → Select "Starter" plan ($7/month)
- No code changes needed!

🔒 **Security:**
- Never commit `.env` file to Git
- Rotate API keys regularly
- Use strong JWT secret
- Enable 2FA on all services

---

## Support & Resources

- **Render Docs:** [render.com/docs](https://render.com/docs)
- **MongoDB Atlas Docs:** [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)
- **Your Repo:** [github.com/SrijanShi/F1-Explorer](https://github.com/SrijanShi/F1-Explorer)
- **Detailed Guide:** See [DEPLOYMENT.md](DEPLOYMENT.md) for comprehensive docs

---

## You're All Set! 🏎️💨

Your F1 Explorer is now live on the internet!

Share your live URL: `https://f1-frontend.onrender.com`

Happy racing! 🏁
