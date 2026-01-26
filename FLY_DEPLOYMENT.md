# 🚀 Deploy F1 Explorer to Fly.io

Complete deployment guide for your F1 Explorer application (React + Node.js + Python) on Fly.io.

---

## Prerequisites

1. **Fly.io Account** - Sign up at [fly.io](https://fly.io/app/sign-up)
2. **Flyctl CLI** - Install the Fly.io command-line tool
3. **MongoDB Atlas** - Your database is already set up ✅
4. **Git** - Your code is already pushed to GitHub ✅

---

## Step 1: Install Flyctl (2 minutes)

### macOS / Linux:
```bash
curl -L https://fly.io/install.sh | sh
```

### After installation:
```bash
# Add to PATH (add this to ~/.zshrc or ~/.bashrc)
export FLYCTL_INSTALL="/Users/srijanshitashma/.fly"
export PATH="$FLYCTL_INSTALL/bin:$PATH"

# Reload shell
source ~/.zshrc

# Verify installation
flyctl version
```

### Login to Fly.io:
```bash
flyctl auth login
```
This will open your browser for authentication.

---

## Step 2: Prepare Environment Variables (3 minutes)

Fly.io stores secrets securely. Set them up:

```bash
cd /Users/srijanshitashma/Desktop/f1

# Set MongoDB Atlas connection string
flyctl secrets set MONGODB_URI="mongodb+srv://srijanshitashma_db_user:kJ2KsmFvAls8l26t@cluster0.gmsrvmd.mongodb.net/f1_explorer?retryWrites=true&w=majority"

# Set API keys
flyctl secrets set YOUTUBE_API_KEY="AIzaSyBEpj-gGku5cqiIMQ1_Vis5q_TAjqwqS7A"
flyctl secrets set GEMIMI_API_KEY="AIzaSyCAs3vf3nryMutBkdHj50g3JxxlailOKD4"
flyctl secrets set NEWS_API_KEY="34408f8daebe432287b43cc398873440"

# Set JWT secret
flyctl secrets set JWT_SECRET="et8knkD4NKSFQA6K7t9NumA1KoM5FVR86gWTpMsqHqg="

# Set frontend URL (will update after first deploy)
flyctl secrets set REACT_APP_API_URL="https://f1-explorer-app.fly.dev"

# Set Auth0 credentials
flyctl secrets set REACT_APP_AUTH0_DOMAIN="your-auth0-domain.auth0.com"
flyctl secrets set REACT_APP_AUTH0_CLIENT_ID="your-auth0-client-id"
flyctl secrets set REACT_APP_AUTH0_REDIRECT_URI="https://f1-explorer-app.fly.dev/callback"

# Frontend URL for CORS
flyctl secrets set FRONTEND_URL="https://f1-explorer-app.fly.dev"
```

---

## Step 3: Update Frontend API URLs (2 minutes)

The frontend is already configured to use `REACT_APP_API_URL` environment variable! ✅

All these files are already updated:
- ✅ callback.js
- ✅ signup.js
- ✅ HighlightDetail.jsx
- ✅ HighlightsPage.jsx
- ✅ DriverCard.js
- ✅ news.js
- ✅ ProfilePage.js

---

## Step 4: Create Fly.io App (1 minute)

```bash
cd /Users/srijanshitashma/Desktop/f1

# Create app (uses existing fly.toml)
flyctl apps create f1-explorer-app

# Or if app already exists:
flyctl apps list
```

---

## Step 5: Deploy to Fly.io (5 minutes)

### First Deployment:

```bash
cd /Users/srijanshitashma/Desktop/f1

# Deploy the application
flyctl deploy

# This will:
# 1. Build your Docker image (includes React, Node.js, Python)
# 2. Push to Fly.io registry
# 3. Launch your application
# 4. Run health checks
```

**Expected output:**
```
==> Building image
==> Pushing image to fly
==> Creating release
==> Release v1 created
==> Monitoring deployment
 1 desired, 1 placed, 1 healthy, 0 unhealthy
--> v1 deployed successfully
```

### Check deployment status:
```bash
flyctl status
```

### View logs:
```bash
flyctl logs
```

---

## Step 6: Configure Custom Domain (Optional)

### Get your Fly.io URL:
Your app is automatically available at: `https://f1-explorer-app.fly.dev`

### Add custom domain (optional):
```bash
# Add your domain
flyctl certs create yourdomain.com

# Get DNS records to configure
flyctl certs show yourdomain.com
```

Then add these DNS records to your domain provider:
```
A     @    <fly-ip-address>
AAAA  @    <fly-ipv6-address>
```

---

## Step 7: Update Auth0 Callback URLs (2 minutes)

1. Go to [Auth0 Dashboard](https://manage.auth0.com)
2. Applications → Your Application → Settings
3. Update these fields:

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

4. Click **Save Changes**

---

## Step 8: Verify Deployment (3 minutes)

### Test Backend API:
```bash
curl https://f1-explorer-app.fly.dev/api/highlights/videos | jq 'length'
# Should return: 25
```

### Test Python API (internal):
```bash
flyctl ssh console
# Inside the container:
curl http://localhost:8000/health
# Should return: {"status":"ok"}
exit
```

### Test Frontend:
Open in browser: `https://f1-explorer-app.fly.dev`

**Test these features:**
- ✅ Sign up / Login with Auth0
- ✅ View F1 News
- ✅ Browse race highlights
- ✅ Click on a race to see event timeline
- ✅ Add drivers to favorites
- ✅ View your profile

---

## Fly.io Commands Reference

### Deployment:
```bash
# Deploy latest changes
flyctl deploy

# Deploy specific Dockerfile
flyctl deploy --dockerfile Dockerfile

# Force rebuild
flyctl deploy --no-cache
```

### Monitoring:
```bash
# View app status
flyctl status

# View real-time logs
flyctl logs

# View logs for specific time
flyctl logs --since 1h

# SSH into container
flyctl ssh console

# Open app in browser
flyctl open
```

### Secrets Management:
```bash
# List all secrets
flyctl secrets list

# Set a secret
flyctl secrets set KEY=value

# Remove a secret
flyctl secrets unset KEY

# Import from .env file
flyctl secrets import < .env
```

### Scaling:
```bash
# Scale VM resources
flyctl scale vm shared-cpu-1x --memory 512

# Scale to more instances
flyctl scale count 2

# Auto-scale (free tier: 0-1)
flyctl scale count 1
```

### Database:
```bash
# Your MongoDB Atlas is already configured ✅
# Connection string is stored as MONGODB_URI secret
```

---

## Architecture on Fly.io

Your application runs as a **single container** with multiple services:

```
┌─────────────────────────────────────┐
│   Fly.io Machine (512MB RAM)       │
├─────────────────────────────────────┤
│  📱 Nginx (Port 3000)               │
│     ↳ Serves React Frontend        │
├─────────────────────────────────────┤
│  🚀 Node.js (Port 5000)             │
│     ↳ Express API Backend          │
├─────────────────────────────────────┤
│  🐍 Python (Port 8000)              │
│     ↳ FastAPI Transcript Service   │
└─────────────────────────────────────┘
          ↓ Connects to
    🗄️ MongoDB Atlas
```

**External Access:** Port 5000 (Backend API)  
**Internal Services:** Ports 3000 (Frontend), 8000 (Python API)  
**Communication:** All services communicate via localhost

---

## Cost Breakdown

### Free Tier (Perfect for Your App):
- **Compute**: 3 shared-cpu-1x VMs with 256MB RAM each = **FREE**
- **Bandwidth**: 100GB outbound/month = **FREE**
- **Storage**: 3GB persistent volumes = **FREE**
- **MongoDB Atlas**: M0 cluster = **FREE**

**Total: $0/month** ✅

Your app uses:
- 1 VM instance (auto-scales to 0 when idle)
- ~512MB RAM
- Minimal bandwidth

### Paid Tier (If Needed):
- **Hobby Plan**: $5/month
  - Always-on instances
  - 512MB RAM per VM
  - Better performance

---

## Troubleshooting

### ❌ Build Failed?

**Check Dockerfile:**
```bash
# Test build locally
docker build -t f1-test .
docker run -p 5000:5000 f1-test
```

**Common issues:**
- Missing dependencies in package.json
- Python requirements.txt errors
- Build timeout (increase with `--build-timeout 600`)

### ❌ Deployment Fails?

**Check logs:**
```bash
flyctl logs
```

**Common issues:**
- Secret not set: `flyctl secrets list`
- MongoDB connection: Verify MONGODB_URI
- Port conflicts: Ensure services use correct ports

### ❌ Services Not Starting?

**SSH into container:**
```bash
flyctl ssh console
# Check processes
ps aux | grep -E 'node|python|nginx'
# Check logs
tail -f /var/log/supervisord.log
```

### ❌ Frontend Shows 404?

**Check nginx:**
```bash
flyctl ssh console
cat /etc/nginx/http.d/default.conf
ls -la /app/frontend/build/
```

### ❌ API Calls Failing?

**Check CORS:**
- Verify `FRONTEND_URL` secret is set
- Ensure Auth0 callback URLs are updated
- Check browser console for CORS errors

### ❌ MongoDB Connection Issues?

```bash
# Verify connection string
flyctl secrets list | grep MONGODB

# Test from container
flyctl ssh console
# Inside container:
curl -X POST https://f1-explorer-app.fly.dev/api/highlights/videos
```

---

## Updating Your App

### Push code changes:
```bash
cd /Users/srijanshitashma/Desktop/f1

# Commit changes
git add .
git commit -m "Update feature X"
git push origin main

# Deploy to Fly.io
flyctl deploy
```

### Rollback if needed:
```bash
# View releases
flyctl releases

# Rollback to previous version
flyctl releases rollback
```

---

## Performance Tips

### 1. **Enable Persistent Storage** (Optional):
```bash
# Create volume for caching
flyctl volumes create f1_data --size 1

# Update fly.toml to mount volume
# Add to fly.toml:
# [mounts]
#   source = "f1_data"
#   destination = "/data"
```

### 2. **Add Health Checks:**
Already configured in fly.toml! ✅
```toml
[[http_service.checks]]
  interval = "15s"
  timeout = "10s"
  method = "GET"
  path = "/api/highlights/videos"
```

### 3. **Enable Auto-scaling:**
```bash
# Scale based on traffic
flyctl autoscale set min=0 max=3
```

### 4. **Use CDN for Static Assets:**
Consider moving static assets to Cloudflare or AWS S3 for better performance.

---

## Environment Variables Reference

| Variable | Purpose | Set? |
|----------|---------|------|
| `MONGODB_URI` | MongoDB Atlas connection | ✅ |
| `YOUTUBE_API_KEY` | YouTube Data API | ✅ |
| `GEMIMI_API_KEY` | Google Gemini AI | ✅ |
| `NEWS_API_KEY` | News API | ✅ |
| `JWT_SECRET` | Auth tokens | ✅ |
| `REACT_APP_API_URL` | Frontend API URL | Set in secrets |
| `REACT_APP_AUTH0_DOMAIN` | Auth0 domain | Set in secrets |
| `REACT_APP_AUTH0_CLIENT_ID` | Auth0 client ID | Set in secrets |
| `REACT_APP_AUTH0_REDIRECT_URI` | Auth0 callback | Set in secrets |
| `FRONTEND_URL` | CORS origin | Set in secrets |
| `PYTHON_API_URL` | Python service URL | Auto (localhost:8000) |
| `NODE_ENV` | Environment | Auto (production) |
| `PORT` | Backend port | Auto (5000) |

---

## Security Checklist

Before going live:

- [x] MongoDB Atlas IP whitelist configured (0.0.0.0/0)
- [x] All API keys stored as Fly.io secrets
- [x] JWT secret is strong and random
- [x] Auth0 callback URLs updated
- [x] CORS configured with specific origins
- [x] HTTPS enforced (Fly.io automatic)
- [ ] Rate limiting enabled (consider adding)
- [ ] Input validation on all routes
- [ ] Security headers configured

---

## Support & Resources

- **Fly.io Docs**: [fly.io/docs](https://fly.io/docs)
- **Fly.io Community**: [community.fly.io](https://community.fly.io)
- **Your App URL**: `https://f1-explorer-app.fly.dev`
- **Status Page**: `flyctl status`
- **Logs**: `flyctl logs`

---

## Quick Deploy Checklist

- [ ] Install flyctl CLI
- [ ] Login: `flyctl auth login`
- [ ] Set all secrets: `flyctl secrets set ...`
- [ ] Deploy: `flyctl deploy`
- [ ] Update Auth0 callback URLs
- [ ] Test frontend: Open browser
- [ ] Test API: `curl https://f1-explorer-app.fly.dev/api/highlights/videos`
- [ ] Verify events: Click on a race in frontend

---

## 🎉 You're Live!

Your F1 Explorer is now deployed on Fly.io!

**URL**: https://f1-explorer-app.fly.dev

**Next Steps:**
1. Share with friends! 🏎️
2. Monitor logs: `flyctl logs`
3. Check performance: `flyctl status`
4. Add custom domain (optional)

Happy racing! 🏁
