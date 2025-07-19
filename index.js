// server.js - Production-ready Chatbot API for Render
import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();

// Environment variables (configure these in Render dashboard)
const PORT = process.env.PORT || 10000;
const HOST = process.env.HOST || '0.0.0.0';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "your-fallback-key";

// Enhanced CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS ? 
    process.env.ALLOWED_ORIGINS.split(',') : 
    '*', // Allow all in development
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(join(__dirname, 'public')));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Initialize OpenAI client
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": process.env.SITE_URL || "https://your-app.onrender.com",
    "X-Title": "Chatbot API"
  },
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Chat endpoint
app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid input',
        message: 'Message must be a non-empty string' 
      });
    }

    const completion = await openai.chat.completions.create({
      model: "deepseek/deepseek-chat-v3-0324:free",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: message }
      ],
      max_tokens: 1000,
      temperature: 0.7
    });

    const reply = completion.choices[0]?.message?.content;
    
    if (!reply) {
      throw new Error('No response generated');
    }

    res.json({
      reply,
      model: "deepseek/deepseek-chat-v3-0324:free"
    });

  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ 
      error: 'Chat processing failed',
      details: process.env.NODE_ENV === 'production' ? undefined : err.message
    });
  }
});

// Serve frontend if you have one
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const server = app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
const shutdown = () => {
  console.log('Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('Force shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);