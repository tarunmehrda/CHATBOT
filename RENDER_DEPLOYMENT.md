# 🚀 Deploy Chatbot API to Render.com

Complete step-by-step guide to deploy your chatbot API to Render.com (no Docker required).

## 📋 Prerequisites

1. **GitHub Repository** - Your code must be in a GitHub repo
2. **Render Account** - Sign up free at [render.com](https://render.com)
3. **OpenRouter API Key** - Get from [openrouter.ai](https://openrouter.ai)

## 🎯 Step-by-Step Deployment

### Step 1: Prepare Your Code

Make sure your code is pushed to GitHub:
```bash
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

### Step 2: Create Web Service on Render

1. **Go to Render Dashboard**
   - Visit [dashboard.render.com](https://dashboard.render.com)
   - Click "New +" → "Web Service"

2. **Connect GitHub Repository**
   - Select "Build and deploy from a Git repository"
   - Connect your GitHub account if not already connected
   - Choose your chatbot repository

3. **Configure Service Settings**
   ```
   Name: chatbot-api (or your preferred name)
   Environment: Node
   Region: Choose closest to your users (e.g., Oregon, Frankfurt)
   Branch: main
   Root Directory: (leave blank)
   Build Command: npm install
   Start Command: npm start
   ```

### Step 3: Set Environment Variables

In the "Environment" section, add these variables:

**Required:**
```
OPENROUTER_API_KEY = your_actual_openrouter_api_key_here
```

**Optional (Render sets these automatically):**
```
NODE_ENV = production
PORT = (Render sets this automatically)
```

**For custom domains (optional):**
```
ALLOWED_ORIGINS = https://your-app-name.onrender.com,https://yourdomain.com
REFERER_URL = https://your-app-name.onrender.com
```

### Step 4: Deploy

1. Click "Create Web Service"
2. Render will automatically:
   - Clone your repository
   - Run `npm install`
   - Start your application with `npm start`
   - Assign a URL like `https://your-app-name.onrender.com`

## 🌐 Your Live API

Once deployed, your API endpoints will be:

```
Base URL: https://your-app-name.onrender.com

Endpoints:
✅ GET  /health          - Health check
✅ GET  /api/status      - API status  
✅ POST /chat           - Chat with AI
✅ GET  /               - Web interface (if you have public folder)
```

## 🧪 Test Your Deployment

### Health Check
```bash
curl https://your-app-name.onrender.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "environment": "production"
}
```

### Chat API Test
```bash
curl -X POST https://your-app-name.onrender.com/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello! How are you today?"}'
```

Expected response:
```json
{
  "reply": "Hello! I'm doing well, thank you for asking. How can I help you today?",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "model": "deepseek/deepseek-chat-v3-0324:free"
}
```

## 🔍 Monitor Your App

### View Logs
1. Go to your Render Dashboard
2. Select your service
3. Click "Logs" tab
4. See real-time application logs

### Check Metrics
- Click "Metrics" tab for CPU/Memory usage
- Monitor response times and error rates
- Set up alerts if needed

## 🛠️ Troubleshooting

### Common Issues

**1. Build Failed**
```
Error: Build command failed
Solution: 
- Check package.json has correct dependencies
- Ensure Node.js version compatibility (18+ recommended)
- Check build logs for specific errors
```

**2. Environment Variable Not Set**
```
Error: OpenRouter API key missing
Solution: 
- Go to Environment tab in Render dashboard
- Add OPENROUTER_API_KEY with your actual key
- Redeploy the service
```

**3. Service Won't Start**
```
Error: Application failed to start
Solution:
- Check start command is "npm start"
- Verify package.json has correct start script
- Check logs for specific error messages
```

**4. CORS Errors**
```
Error: CORS policy blocked
Solution:
- Add your frontend domain to ALLOWED_ORIGINS
- Format: https://yourdomain.com,https://www.yourdomain.com
- Redeploy after adding environment variable
```

**5. Free Tier Sleeping**
```
Issue: App sleeps after 15 minutes on free tier
Solution:
- Your app has built-in keep-alive (pings every 14 minutes)
- Upgrade to Starter plan ($7/month) for 24/7 uptime
- Or use external monitoring service to ping your app
```

## 🔄 Auto-Deploy Updates

Render automatically redeploys when you push to GitHub:

```bash
# Make your changes
git add .
git commit -m "Update chatbot features"
git push origin main
# Render automatically deploys the changes!
```

## 💰 Render Pricing

### Free Tier
- ✅ 750 hours/month runtime
- ✅ Auto-deploy from Git
- ✅ SSL certificates included
- ⚠️ Sleeps after 15 min inactivity
- ⚠️ Slower cold starts

### Starter Plan ($7/month)
- ✅ Always-on (no sleeping)
- ✅ Faster performance
- ✅ More CPU/Memory
- ✅ Custom domains

## 🎉 Success!

Your chatbot API is now live on Render! 

**Your API URL:** `https://your-app-name.onrender.com`

### Next Steps:
1. ✅ Test all endpoints
2. ✅ Update your frontend to use the new API URL
3. ✅ Set up monitoring/alerts
4. ✅ Consider upgrading to paid plan for production use
5. ✅ Add custom domain if needed

## 📞 Need Help?

- **Render Docs:** [render.com/docs](https://render.com/docs)
- **Render Community:** [community.render.com](https://community.render.com)
- **OpenRouter Docs:** [openrouter.ai/docs](https://openrouter.ai/docs)

Your chatbot is now hosted and ready to serve users worldwide! 🌍🤖
