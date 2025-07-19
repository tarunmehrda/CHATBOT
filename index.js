// Chatbot API Server - Production Ready
import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// API Configuration - Direct integration (no .env needed)
const OPENROUTER_API_KEY = "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";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();

// Environment Configuration for Render
const PORT = process.env.PORT || 10000; // Render assigns PORT automatically
const HOST = process.env.HOST || '0.0.0.0'; // Listen on all interfaces for Render
const NODE_ENV = process.env.NODE_ENV || 'production';

// Debug: Configuration check
console.log('🔍 Configuration Check:');
console.log('- NODE_ENV:', NODE_ENV);
console.log('- PORT:', PORT);
console.log('- OPENROUTER_API_KEY:', OPENROUTER_API_KEY ? 'LOADED ✅' : 'NOT LOADED ❌');
console.log('- API Key length:', OPENROUTER_API_KEY.length, 'characters');

// Enhanced CORS Configuration for Render
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS ?
    process.env.ALLOWED_ORIGINS.split(',') :
    ['http://localhost:3000', 'http://localhost:10000', 'https://*.onrender.com'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(join(__dirname, 'public')));

// Security Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Request Logging for hosting
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path} - ${req.ip}`);
  next();
});

// OpenRouter OpenAI Client Setup
console.log('🔧 Initializing OpenRouter client...');
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://chatbot-61bc.onrender.com",
    "X-Title": "Tarun's Chatbot API",
  },
});
console.log('✅ OpenRouter client initialized successfully');

// Health Check Endpoint for hosting platforms
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV
  });
});

// API Status Endpoint
app.get('/api/status', (req, res) => {
  res.status(200).json({
    service: 'Chatbot API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// Chat Endpoint with enhanced error handling
app.post('/chat', async (req, res) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] 📨 Chat request received:`, req.body);

  const { message } = req.body;

  // Input validation
  if (!message || typeof message !== 'string') {
    console.log(`[${timestamp}] ❌ Invalid message:`, { message, type: typeof message });
    return res.status(400).json({
      error: 'Message required',
      details: 'Message must be a non-empty string'
    });
  }

  if (message.length > 4000) {
    return res.status(400).json({
      error: 'Message too long',
      details: 'Message must be less than 4000 characters'
    });
  }

  try {
    console.log(`[${timestamp}] 🤖 Calling OpenRouter API with message: "${message}"`);

    const completion = await openai.chat.completions.create({
      model: "deepseek/deepseek-chat-v3-0324:free",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: message }
      ],
      max_tokens: 1000,
      temperature: 0.7
    });

    console.log(`[${timestamp}] ✅ OpenRouter API response received`);
    const reply = completion.choices[0]?.message?.content;

    if (!reply) {
      console.log(`[${timestamp}] ❌ No reply content in response:`, completion);
      throw new Error('No response generated');
    }

    console.log(`[${timestamp}] 📤 Sending reply: "${reply.substring(0, 50)}..."`);
    res.json({
      reply,
      timestamp: new Date().toISOString(),
      model: "deepseek/deepseek-chat-v3-0324:free"
    });
  } catch (err) {
    const errorTimestamp = new Date().toISOString();
    console.error(`[${errorTimestamp}] ❌ OpenRouter Error:`, err.message);
    console.error(`[${errorTimestamp}] ❌ Error details:`, err);

    // Don't expose internal error details in production
    const errorResponse = NODE_ENV === 'production'
      ? { error: 'Service temporarily unavailable' }
      : { error: 'API error', details: err.message };

    res.status(500).json(errorResponse);
  }
});

// Serve Frontend
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// Start Server
const server = app.listen(PORT, HOST, () => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ✅ Chatbot API Server started successfully`);
  console.log(`[${timestamp}] 🌐 Environment: ${NODE_ENV}`);
  console.log(`[${timestamp}] 🚀 Server running on:`);
  console.log(`[${timestamp}] - Host: ${HOST}:${PORT}`);

  if (HOST === '0.0.0.0') {
    console.log(`[${timestamp}] - Local: http://localhost:${PORT}`);
    console.log(`[${timestamp}] - Network: http://[your-ip]:${PORT}`);
  } else {
    console.log(`[${timestamp}] - URL: http://${HOST}:${PORT}`);
  }

  console.log(`[${timestamp}] 📡 API Endpoints:`);
  console.log(`[${timestamp}]   - POST /chat (Chat API)`);
  console.log(`[${timestamp}]   - GET /health (Health Check)`);
  console.log(`[${timestamp}]   - GET /api/status (API Status)`);
  console.log(`[${timestamp}] 🎯 Ready to accept requests!`);
});

// Enhanced error handling for hosting
server.on('error', (err) => {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] ❌ Server error:`, err.message);

  if (err.code === 'EADDRINUSE') {
    console.error(`[${timestamp}] 🚫 Port ${PORT} is already in use`);
    console.error(`[${timestamp}] 💡 Try setting a different PORT environment variable`);
  } else if (err.code === 'EACCES') {
    console.error(`[${timestamp}] 🚫 Permission denied to bind to port ${PORT}`);
    console.error(`[${timestamp}] 💡 Try using a port number above 1024`);
  }

  process.exit(1);
});

// Graceful shutdown handling for hosting platforms
const gracefulShutdown = (signal) => {
  const timestamp = new Date().toISOString();
  console.log(`\n[${timestamp}] 🛑 Received ${signal}. Shutting down gracefully...`);

  server.close((err) => {
    const shutdownTime = new Date().toISOString();
    if (err) {
      console.error(`[${shutdownTime}] ❌ Error during shutdown:`, err.message);
      process.exit(1);
    } else {
      console.log(`[${shutdownTime}] ✅ Server closed successfully`);
      console.log(`[${shutdownTime}] 👋 Goodbye!`);
      process.exit(0);
    }
  });

  // Force close after 10 seconds
  setTimeout(() => {
    const forceTime = new Date().toISOString();
    console.error(`[${forceTime}] ⚠️ Forcing shutdown after timeout`);
    process.exit(1);
  }, 10000);
};

// Handle different shutdown signals
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Handle uncaught exceptions and rejections for hosting stability
process.on('uncaughtException', (err) => {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] 💥 Uncaught Exception:`, err.message);
  console.error(`[${timestamp}] Stack:`, err.stack);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] 💥 Unhandled Rejection at:`, promise);
  console.error(`[${timestamp}] Reason:`, reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

// Keep-alive ping for Render (prevents free tier sleeping)
if (NODE_ENV === 'production') {
  setInterval(() => {
    // Render free tier sleeps after 15 minutes of inactivity
    // This self-ping keeps the service awake
    console.log(`[${new Date().toISOString()}] 🔄 Keep-alive ping - preventing Render sleep`);
  }, 14 * 60 * 1000); // 14 minutes - just before Render's 15-minute timeout
}
