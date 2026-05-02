const express = require('express');
const axios = require('axios');
const router = express.Router();

// Configuration for local Ollama/Qwen model
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434/api/chat';
const MODEL_NAME = process.env.LLM_MODEL || 'qwen2.5:1.5b'; // Smaller model is faster for local dev

router.post('/guru', async (req, res) => {
  try {
    const { message, scripture, history } = req.body;
    
    // System prompt to maintain persona
    const systemPrompt = scripture === 'hanuman' 
      ? "You are Lord Hanuman, a wise and powerful devotee. Answer children's questions about the Hanuman Chalisa and devotion with kindness, strength, and simplicity. Keep answers short (2-3 sentences)."
      : "You are Sri Krishna, a wise and playful teacher. Answer children's questions about the Bhagavad Gita and life with wisdom, love, and simplicity. Keep answers short (2-3 sentences).";

    const response = await axios.post(OLLAMA_URL, {
      model: MODEL_NAME,
      messages: [
        { role: 'system', content: systemPrompt },
        ...(history || []),
        { role: 'user', content: message }
      ],
      stream: false
    });

    res.json({ 
      reply: response.data.message.content,
      model: MODEL_NAME 
    });
  } catch (err) {
    console.error('LLM Error:', err.message);
    res.status(503).json({ 
      error: 'AI Guru is meditating (Local LLM not reachable).',
      details: 'Ensure Ollama is running locally with the Qwen model.'
    });
  }
});

// GET /api/chat/wisdom - Mock for now or fetch from DB if implemented
router.get('/wisdom', (req, res) => {
  res.json([]);
});

// POST /api/chat/missed - Log questions the AI couldn't answer
router.post('/missed', (req, res) => {
  const { question } = req.body;
  console.log(`[MISSED QUESTION]: ${question}`);
  res.json({ status: 'logged' });
});

module.exports = router;
