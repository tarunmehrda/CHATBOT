// index.js - Complete Chatbot Solution
import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';

const app = express();
const PORT = process.env.PORT || 10000;

// Configuration - IMPORTANT: Set these in Render environment variables
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_REFERRER = process.env.SITE_URL || "https://your-app.onrender.com";

if (!OPENROUTER_API_KEY) {
  console.error("ERROR: Missing OpenRouter API key");
  process.exit(1);
}

// Initialize OpenAI client with OpenRouter configuration
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": OPENROUTER_REFERRER,
    "X-Title": "Tarun's Chatbot"
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    service: 'Tarun\'s Chatbot API'
  });
});

// Chat endpoint with robust error handling
app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;

    // Input validation
    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Invalid input',
        message: 'Please provide a valid message'
      });
    }

    // Process chat request
    const completion = await openai.chat.completions.create({
      model: "deepseek/deepseek-chat-v3-0324:free",
      messages: [
        { 
          role: "system", 
          content: "You are Tarun's helpful AI assistant. Respond in a friendly and helpful manner."
        },
        { role: "user", content: message }
      ],
      max_tokens: 1000,
      temperature: 0.7
    });

    const reply = completion.choices[0]?.message?.content;
    
    if (!reply) {
      throw new Error('Empty response from AI');
    }

    // Successful response
    res.json({
      success: true,
      reply: reply
    });

  } catch (error) {
    console.error('Chat error:', error);
    
    // Handle different error types
    let errorMessage = 'An error occurred';
    let statusCode = 500;
    
    if (error.response) {
      // API response error
      statusCode = error.response.status;
      errorMessage = error.response.data?.error?.message || error.message;
    } else if (error.request) {
      // No response received
      errorMessage = 'No response from AI service';
    } else {
      // Setup error
      errorMessage = error.message;
    }

    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      message: 'Sorry, we encountered an issue processing your request'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`OpenRouter configured for: ${OPENROUTER_REFERRER}`);
});