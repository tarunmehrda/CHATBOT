import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load .env file only in development
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const app = express();
const PORT = process.env.PORT || 10000; // Render uses port 10000 by default

// Enhanced error handling for missing API key
if (!process.env.GEMINI_API_KEY) {
  console.error('❌ FATAL ERROR: GEMINI_API_KEY environment variable is not set!');
  console.error('Please set the GEMINI_API_KEY environment variable in your Render dashboard.');
  process.exit(1);
}

// Debug: Check environment and API key
console.log('🌍 Environment:', process.env.NODE_ENV || 'development');
console.log('🔑 Gemini API Key loaded: Yes');
console.log('🔑 API Key starts with:', process.env.GEMINI_API_KEY.substring(0, 10) + '...');
console.log('🔑 API Key length:', process.env.GEMINI_API_KEY.length);

// CORS configuration for production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? ['https://your-frontend-domain.com', 'https://chatbot-n4jf.onrender.com']
    : true,
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Initialize Google Gemini AI with error handling
let genAI, model;
try {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  console.log('✅ Gemini AI initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize Gemini AI:', error.message);
  process.exit(1);
}

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: '🟢 Gemini Chatbot API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Health check for Render
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Chat endpoint with enhanced error handling
app.post('/chat', async (req, res) => {
  const { message } = req.body;

  // Input validation
  if (!message || typeof message !== 'string') {
    return res.status(400).json({
      error: 'Message is required and must be a string.',
      received: typeof message
    });
  }

  if (message.trim().length === 0) {
    return res.status(400).json({ error: 'Message cannot be empty.' });
  }

  if (message.length > 4000) {
    return res.status(400).json({ error: 'Message too long. Maximum 4000 characters allowed.' });
  }

  try {
    console.log(`🚀 Making request to Gemini... (${new Date().toISOString()})`);

    // Create the prompt with system instruction
    const prompt = `You are a helpful assistant. Please respond to the following message in a helpful and friendly manner.

User: ${message.trim()}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const reply = response.text();

    if (!reply || reply.trim().length === 0) {
      throw new Error('Empty response from Gemini');
    }

    console.log(`✅ Got response from Gemini (${new Date().toISOString()})`);
    res.json({
      reply: reply.trim(),
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error(`❌ Error at ${new Date().toISOString()}:`, err);

    // Handle specific Gemini API errors
    if (err.message?.includes('API_KEY_INVALID')) {
      return res.status(401).json({ error: 'Invalid API key configuration.' });
    }

    if (err.message?.includes('QUOTA_EXCEEDED')) {
      return res.status(429).json({ error: 'API quota exceeded. Please try again later.' });
    }

    if (err.message?.includes('SAFETY')) {
      return res.status(400).json({ error: 'Content blocked by safety filters.' });
    }

    // Generic error response
    res.status(500).json({
      error: 'Failed to get a response from Gemini. Please try again.',
      timestamp: new Date().toISOString()
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    availableEndpoints: ['GET /', 'GET /health', 'POST /chat'],
    timestamp: new Date().toISOString()
  });
});

// Start server with error handling
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server listening on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📅 Started at: ${new Date().toISOString()}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});
