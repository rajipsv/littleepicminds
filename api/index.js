const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Fix paths to point to the backend directory
const authRoutes = require('../backend/routes/auth');
const versesRoutes = require('../backend/routes/verses');
const journalRoutes = require('../backend/routes/journal');
const evaluationsRoutes = require('../backend/routes/evaluations');
const ttsRoutes = require('../backend/routes/tts');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Root route for Vercel testing
app.get('/', (req, res) => {
  res.json({ message: 'littleEpicMinds API is alive! 🕉️' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/verses', versesRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/evaluations', evaluationsRoutes);
app.use('/api/tts', ttsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'littleEpicMinds API is running 🕉️' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err.stack);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

module.exports = app;
