# 🚀 Hosting Guide - Chatbot API

This guide explains how to deploy your chatbot API to various hosting platforms.

## 🌐 Hosting-Ready Features

✅ **Environment Variables Support**
- `PORT` - Server port (default: 4000)
- `HOST` - Server host (default: 0.0.0.0 for hosting)
- `NODE_ENV` - Environment (development/production)
- `OPENROUTER_API_KEY` - Your OpenRouter API key
- `ALLOWED_ORIGINS` - CORS allowed origins
- `REFERER_URL` - Referer URL for API calls

✅ **Health Check Endpoints**
- `GET /health` - Health status
- `GET /api/status` - API status

✅ **Production Features**
- Enhanced error handling
- Request logging
- Security headers
- Graceful shutdown
- Input validation
- Rate limiting ready

## 🔧 Quick Setup

1. **Copy environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Configure your environment:**
   ```bash
   # Edit .env file with your values
   PORT=4000
   HOST=0.0.0.0
   NODE_ENV=production
   OPENROUTER_API_KEY=your_key_here
   ALLOWED_ORIGINS=https://yourdomain.com
   REFERER_URL=https://yourdomain.com
   ```

3. **Start in production mode:**
   ```bash
   npm run prod
   ```

## 🌍 Platform-Specific Deployment

### Heroku
```bash
# Install Heroku CLI and login
heroku create your-chatbot-api
heroku config:set OPENROUTER_API_KEY=your_key_here
heroku config:set NODE_ENV=production
heroku config:set ALLOWED_ORIGINS=https://your-frontend.com
git push heroku main
```

### Railway
```bash
# Connect your GitHub repo to Railway
# Set environment variables in Railway dashboard:
# - OPENROUTER_API_KEY
# - NODE_ENV=production
# - ALLOWED_ORIGINS=https://your-frontend.com
```

### Vercel
```bash
# Install Vercel CLI
vercel
# Set environment variables in Vercel dashboard
```

### DigitalOcean App Platform
```bash
# Create app from GitHub repo
# Set environment variables in DO dashboard
# App will auto-deploy on git push
```

### VPS/Dedicated Server
```bash
# Clone repo
git clone your-repo-url
cd chatbot

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your values

# Install PM2 for process management (optional)
npm install -g pm2
pm2 start index.js --name chatbot-api

# Or use built-in daemon
npm run daemon
```

## 🔍 Health Monitoring

### Health Check
```bash
curl https://your-domain.com/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "environment": "production"
}
```

### API Status
```bash
curl https://your-domain.com/api/status
```

Response:
```json
{
  "service": "Chatbot API",
  "version": "1.0.0",
  "status": "running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🛡️ Security Considerations

- ✅ CORS properly configured
- ✅ Security headers added
- ✅ Input validation implemented
- ✅ Error details hidden in production
- ✅ Request logging enabled
- ⚠️ Consider adding rate limiting
- ⚠️ Consider adding authentication for production use

## 📊 Monitoring & Logs

The server provides detailed logging with timestamps:
```
[2024-01-01T00:00:00.000Z] ✅ Chatbot API Server started successfully
[2024-01-01T00:00:00.000Z] 🌐 Environment: production
[2024-01-01T00:00:00.000Z] 🚀 Server running on: 0.0.0.0:4000
[2024-01-01T00:00:00.000Z] POST /chat - 192.168.1.1
```

## 🚀 API Usage

### Chat Endpoint
```bash
curl -X POST https://your-domain.com/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, how are you?"}'
```

Response:
```json
{
  "reply": "Hello! I'm doing well, thank you for asking. How can I help you today?",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "model": "deepseek/deepseek-chat-v3-0324:free"
}
```

## 🔧 Troubleshooting

### Common Issues

1. **Port already in use:**
   - Set different PORT in environment variables

2. **CORS errors:**
   - Add your frontend domain to ALLOWED_ORIGINS

3. **API key errors:**
   - Verify OPENROUTER_API_KEY is set correctly

4. **Health check fails:**
   - Check if server is running: `curl http://localhost:4000/health`

### Environment Variables Check
```bash
# Check if all required env vars are set
node -e "console.log('PORT:', process.env.PORT || 'not set'); console.log('OPENROUTER_API_KEY:', process.env.OPENROUTER_API_KEY ? 'set' : 'not set');"
```

Your chatbot API is now ready for production hosting! 🎉
