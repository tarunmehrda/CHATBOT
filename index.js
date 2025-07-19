// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

// OpenRouter OpenAI Client Setup
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": process.env.REFERER_URL || "http://localhost:3000",
    "X-Title": "Tarun's Chatbot",
  },
});

// Chat Endpoint
app.post('/chat', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message required' });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "deepseek/deepseek-chat-v3-0324:free",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: message }
      ]
    });

    res.json({ reply: completion.choices[0].message.content });
  } catch (err) {
    console.error("OpenRouter Error:", err);
    res.status(500).json({ error: 'API error', details: err.message });
  }
});

// Serve Frontend
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

// Start Server
const server = app.listen(4000, '192.168.124.246', () => {
  console.log(`✅ Server running on:`);
  console.log(`- Local: http://192.168.124.246:4000`);
  console.log(`- Android Emulator: http://10.0.2.2:4000`);
});

// Add error handling
server.on('error', (err) => {
  console.error('❌ Server error:', err);
});

// Keep process alive
setInterval(() => {
  // This keeps the process running
}, 1000);

// Keep the process alive
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
