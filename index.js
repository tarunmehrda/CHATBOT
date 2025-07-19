// Tarun's Chatbot API - Complete Solution with .env
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables from .env file
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();

// Configuration
const PORT = process.env.PORT || 10000;
const HOST = '0.0.0.0';
const NODE_ENV = process.env.NODE_ENV || 'production';

// Load API Key from environment variables
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// Startup validation and debugging
console.log('🚀 Starting Tarun\'s Chatbot API...');
console.log('- Environment:', NODE_ENV);
console.log('- Port:', PORT);
console.log('- .env file loaded:', dotenv ? '✅' : '❌');
console.log('- API Key from env:', process.env.OPENROUTER_API_KEY ? '✅ Found' : '❌ Missing');
console.log('- API Key Status:', OPENROUTER_API_KEY ? '✅ Loaded' : '❌ Missing');

if (OPENROUTER_API_KEY) {
  console.log('- API Key Length:', OPENROUTER_API_KEY.length, 'characters');
  console.log('- API Key Preview:', OPENROUTER_API_KEY.substring(0, 20) + '...');
} else {
  console.error("❌ FATAL: OPENROUTER_API_KEY not found in environment variables!");
  console.error("💡 Make sure your .env file contains: OPENROUTER_API_KEY=your_key_here");
  process.exit(1);
}

// Initialize OpenAI client with OpenRouter
console.log('🔧 Initializing OpenRouter client...');
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://chatbot-61bc.onrender.com",
    "X-Title": "Tarun's Chatbot API"
  }
});
console.log('✅ OpenRouter client initialized');

// CORS Configuration
const corsOptions = {
  origin: ['https://chatbot-61bc.onrender.com', 'http://localhost:3000', 'http://localhost:10000'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(join(__dirname, 'public')));

// Request logging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'Tarun\'s Chatbot API',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Status endpoint
app.get('/api/status', (req, res) => {
  res.status(200).json({
    service: 'Chatbot API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// Main chat endpoint
app.post('/chat', async (req, res) => {
  const timestamp = new Date().toISOString();

  try {
    console.log(`[${timestamp}] 📨 Chat request received:`, req.body);
    const { message } = req.body;

    // Input validation
    if (!message || typeof message !== 'string' || message.trim() === '') {
      console.log(`[${timestamp}] ❌ Invalid message input`);
      return res.status(400).json({
        error: 'Message required',
        details: 'Please provide a valid message'
      });
    }

    if (message.length > 4000) {
      return res.status(400).json({
        error: 'Message too long',
        details: 'Message must be less than 4000 characters'
      });
    }

    console.log(`[${timestamp}] 🤖 Calling OpenRouter API with: "${message}"`);

    // Call OpenRouter API
    const completion = await openai.chat.completions.create({
      model: "deepseek/deepseek-chat-v3-0324:free",
      messages: [
        {
          role: "system",
          content: "You are a helpful AI assistant. Respond in a friendly and helpful manner."
        },
        { role: "user", content: message }
      ],
      max_tokens: 1000,
      temperature: 0.7
    });

    console.log(`[${timestamp}] ✅ OpenRouter API response received`);
    const reply = completion.choices[0]?.message?.content;

    if (!reply) {
      console.log(`[${timestamp}] ❌ Empty response from API`);
      throw new Error('No response generated');
    }

    console.log(`[${timestamp}] 📤 Sending reply: "${reply.substring(0, 50)}..."`);

    // Send successful response
    res.json({
      reply: reply,
      timestamp: new Date().toISOString(),
      model: "deepseek/deepseek-chat-v3-0324:free"
    });

  } catch (error) {
    const errorTime = new Date().toISOString();
    console.error(`[${errorTime}] ❌ Chat error:`, error.message);
    console.error(`[${errorTime}] ❌ Full error:`, error);

    // Send error response
    res.status(500).json({
      error: NODE_ENV === 'production' ? 'Service temporarily unavailable' : error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// Start server
const server = app.listen(PORT, HOST, () => {
  const startTime = new Date().toISOString();
  console.log(`[${startTime}] ✅ Chatbot API Server started successfully!`);
  console.log(`[${startTime}] 🌐 Environment: ${NODE_ENV}`);
  console.log(`[${startTime}] 🚀 Server running on: ${HOST}:${PORT}`);
  console.log(`[${startTime}] 📡 API Endpoints:`);
  console.log(`[${startTime}]   - POST /chat (Chat API)`);
  console.log(`[${startTime}]   - GET /health (Health Check)`);
  console.log(`[${startTime}]   - GET /api/status (API Status)`);
  console.log(`[${startTime}] 🎯 Ready to accept requests!`);
});

// Error handling
server.on('error', (err) => {
  console.error('❌ Server error:', err.message);
  if (err.code === 'EADDRINUSE') {
    console.error(`🚫 Port ${PORT} is already in use`);
  }
  process.exit(1);
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
  server.close((err) => {
    if (err) {
      console.error('❌ Error during shutdown:', err.message);
      process.exit(1);
    } else {
      console.log('✅ Server closed successfully');
      process.exit(0);
    }
  });
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Keep-alive for Render free tier
if (NODE_ENV === 'production') {
  setInterval(() => {
    console.log(`[${new Date().toISOString()}] 🔄 Keep-alive ping`);
  }, 14 * 60 * 1000); // 14 minutes
}