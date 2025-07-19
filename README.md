# 🤖 Chatbot API Server - Production Ready

A robust, hosting-ready chatbot API server powered by OpenRouter and Express.js. Designed for easy deployment to any hosting platform.

## ✨ Features

- 🚀 **Production Ready** - Optimized for hosting platforms
- 🛡️ **Security** - CORS, security headers, input validation
- 📊 **Monitoring** - Health checks, request logging, error handling
- 🔄 **Auto-Restart** - Built-in keep-alive mechanisms
- 🌐 **Hosting Friendly** - Environment variables, graceful shutdown
- 📦 **Docker Support** - Containerized deployment ready

## 🚀 Quick Start

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your OpenRouter API key
   ```

3. **Start the server:**
   ```bash
   # Development mode (with auto-reload)
   npm run dev

   # Production mode
   npm run prod

   # Simple start
   npm start
   ```

### 🌐 Production Hosting

See [HOSTING.md](./HOSTING.md) for detailed deployment instructions for:
- Heroku
- Railway
- Vercel
- DigitalOcean
- VPS/Dedicated servers
- Docker deployment

### 🐳 Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build manually
docker build -t chatbot-api .
docker run -p 4000:4000 --env-file .env chatbot-api
```

### Option 2: Using Startup Scripts
- **Batch File:** Double-click `start-server.bat` (gives you options)
- **PowerShell:** Right-click `start-server.ps1` and select "Run with PowerShell"

## Auto-Start on System Boot

### Method 1: Windows Task Scheduler (Recommended)

1. Open Task Scheduler (search for it in Start menu)
2. Click "Create Basic Task"
3. Name: "Chatbot Server"
4. Trigger: "When the computer starts"
5. Action: "Start a program"
6. Program: `C:\Users\tarun\fiturai\chatbot\keep-alive.bat`

## Testing Your Setup

1. **Start the server:** Run `npm start` or `.\keep-alive.bat`
2. **Open your browser:** Go to `http://localhost:3000`
3. **Test the chat:** Type a message and press Send
4. **API endpoint:** `http://localhost:3000/chat` (POST request)
7. Click Finish

### Method 2: Windows Startup Folder

1. Press `Win + R`, type `shell:startup`, press Enter
2. Copy `keep-alive.bat` to this folder
3. The server will start with auto-restart when you log in

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run keep-alive` | Start server with auto-restart capability (PowerShell) |
| `keep-alive.bat` | Start server with auto-restart capability (Batch) |
| `npm start` | Start server normally (no auto-restart) |
| `npm run dev` | Start in development mode with nodemon |

## Troubleshooting

### Server not starting?
1. Check if port 3000 is available: `netstat -an | findstr :3000`
2. Check if Node.js is installed: `node --version`
3. Check the console output for error messages

### Permission issues?
Run Command Prompt or PowerShell as Administrator when setting up startup scripts.

## Configuration

- **Port:** Set in `.env` file (default: 3000)
- **Auto-restart:** Built into `keep-alive.bat` and `keep-alive.ps1`
- **Logs:** Console output shows all activity

## Benefits of Keep-Alive Scripts

✅ Automatic restart on crash  
✅ No external dependencies  
✅ Simple setup  
✅ Built-in logging  
✅ Lightweight solution  

Your server will now stay running even after laptop restarts!
