const express = require('express');
const cors = require('cors');

// Try to load dotenv, but don't crash if it fails
try {
  require('dotenv').config();
} catch (e) {
  console.warn('Dotenv not loaded');
}

// USE LOCAL COPIES (Inside api/ folder) to avoid pathing issues on Vercel
const authRoutes = require('./routes/auth');
const versesRoutes = require('./routes/verses');
const journalRoutes = require('./routes/journal');
const evaluationsRoutes = require('./routes/evaluations');
const ttsRoutes = require('./routes/tts');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'littleEpicMinds API is alive! 🕉️' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/verses', versesRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/evaluations', evaluationsRoutes);
app.use('/api/tts', ttsRoutes);

// Health check - Simplified to the max
app.get('/api/health', (req, res) => {
  res.send('API_OK');
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err.stack);
  res.status(500).send(err.message || 'Internal Server Error');
});

module.exports = app;
