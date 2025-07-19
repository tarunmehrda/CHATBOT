import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import OpenAI from 'openai';

// Load .env file only in development
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const app = express();
const PORT = process.env.PORT || 6000;

// Debug: Check environment and API key
console.log('🌍 Environment:', process.env.NODE_ENV || 'development');
console.log('🔑 API Key loaded:', process.env.OPENROUTER_API_KEY ? 'Yes' : 'No');
if (process.env.OPENROUTER_API_KEY) {
  console.log('🔑 API Key starts with:', process.env.OPENROUTER_API_KEY.substring(0, 10) + '...');
  console.log('🔑 API Key length:', process.env.OPENROUTER_API_KEY.length);
} else {
  console.log('❌ OPENROUTER_API_KEY environment variable is not set!');
}

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:6000", // Optional. Site URL for rankings on openrouter.ai.
    "X-Title": "Fiturai Chatbot", // Optional. Site title for rankings on openrouter.ai.
  },
});

app.get('/', (req, res) => {
  res.send('🟢 OpenRouter Chatbot API is running!');
});

app.post('/chat', async (req, res) => {
  const { message } = req.body;

  if (!message) return res.status(400).json({ error: 'Message is required.' });

  try {
    console.log('🚀 Making request to OpenRouter...');
    const response = await openai.chat.completions.create({
      model: "deepseek/deepseek-chat-v3-0324:free",
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: message },
      ],
    });

    const reply = response.choices[0]?.message?.content;
    console.log('✅ Got response from OpenRouter');
    res.json({ reply });
  } catch (err) {
    console.error('❌ Full error object:', err);
    console.error('❌ Error response:', err.response?.data);
    console.error('❌ Error status:', err.response?.status);
    console.error('❌ Error message:', err.message);
    res.status(500).json({ error: 'Failed to get a response from OpenRouter.' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});
