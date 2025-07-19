import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import OpenAI from 'openai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
});

app.get('/', (req, res) => {
  res.send('🟢 OpenRouter Chatbot API is running!');
});

app.post('/chat', async (req, res) => {
  const { message } = req.body;

  if (!message) return res.status(400).json({ error: 'Message is required.' });

  try {
    const response = await openai.chat.completions.create({
      model: 'openchat/openchat-7b:free',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: message },
      ],
    });

    const reply = response.choices[0]?.message?.content;
    res.json({ reply });
  } catch (err) {
    console.error('❌ Error from OpenRouter:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to get a response from OpenRouter.' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});
