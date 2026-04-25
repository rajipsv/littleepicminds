const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const versesRoutes = require('./routes/verses');
const journalRoutes = require('./routes/journal');
const evaluationsRoutes = require('./routes/evaluations');
const ttsRoutes = require('./routes/tts');

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

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'littleEpicMinds API is running 🕉️' });
});

const PORT = process.env.PORT || 5000;

// Export the app for Vercel Serverless Functions
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🕉️ littleEpicMinds API running on port ${PORT}`);
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err.stack);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

module.exports = app;
