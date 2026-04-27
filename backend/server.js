require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  res.on('finish', () => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} ${res.statusCode}`);
  });
  next();
});

// Import Routes
const authRoutes = require('./routes/auth');
const verseRoutes = require('./routes/verses');
const ttsRoutes = require('./routes/tts');
const journalRoutes = require('./routes/journal');
const evaluationRoutes = require('./routes/evaluations');

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/verses', verseRoutes);
app.use('/api/tts', ttsRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/evaluations', evaluationRoutes);

// Health check
app.get('/api/test', (req, res) => {
  res.json({ status: 'ok', message: 'Dharma Gyan Backend is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`👉 http://localhost:${PORT}`);
});
