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

// Themes endpoint
const data = require('./data');
app.get('/api/themes/:scripture/:chapter', (req, res) => {
  try {
    const { scripture, chapter } = req.params;
    const { level } = req.query; // seeds, seekers
    
    if (!data.themes || !data.themes[scripture] || !data.themes[scripture][chapter]) {
      return res.status(404).json({ error: 'Themes not found for this chapter' });
    }
    
    let chapterData = data.themes[scripture][chapter];
    let themesToReturn = [];

    // Check if it's level-based structure { seeds: [], seekers: [] }
    if (!Array.isArray(chapterData)) {
      themesToReturn = chapterData[level] || chapterData['seekers'] || chapterData['seeds'] || [];
    } else {
      // Fallback for old array structure
      themesToReturn = chapterData;
    }
    
    // Inject actual shloka data
    const themesWithShlokas = themesToReturn.map(theme => {
      const populatedShlokas = (theme.shlokas || []).map(shlokaId => {
        const shlokaObj = data.shlokas[shlokaId];
        return shlokaObj ? { ...shlokaObj, id: shlokaId } : { error: 'Shloka data missing', id: shlokaId };
      });
      return { ...theme, shlokaData: populatedShlokas };
    });
    
    res.json(themesWithShlokas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`👉 http://localhost:${PORT}`);
});
