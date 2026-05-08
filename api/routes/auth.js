const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'littleEpicMinds_dev_secret_2026';

// Helper: determine learning level from age
function getLevelFromAge(age) {
  if (!age) return 'seeds';
  if (age <= 7) return 'seeds';
  if (age <= 10) return 'seekers';
  return 'warriors';
}

// Admin Middleware
const adminAuth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied: Admins only' });
    }
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, name, age, grade, role, mobile } = req.body;
    if (!username || !email || !password) {
      console.error('Registration failed: Missing required fields', { username, email });
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }
    console.log('Registering user:', { username, email, age, grade, mobile });
    const finalAge = (age && !isNaN(parseInt(age))) ? parseInt(age) : null;
    const level = getLevelFromAge(finalAge);

    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is missing in Vercel settings!');
    }

    // Check if user exists
    const userExists = await db.query('SELECT * FROM users WHERE username = $1 OR email = $2', [username, email]);
    if (userExists.rows.length > 0) {
      console.warn('Registration failed: User exists', username);
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    console.log('Inserting into DB with level:', level, 'age:', finalAge);
    const newUser = await db.query(
      'INSERT INTO users (username, email, password_hash, name, age, grade, level, role, is_premium, mobile) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, false, $9) RETURNING id, username, email, name, role, is_premium, level, age, grade, mobile',
      [username, email, passwordHash, name || username, finalAge, grade || null, level, role || 'student', mobile || null]
    );

    const user = newUser.rows[0];
    if (!user) {
      throw new Error('User creation failed: No data returned from database');
    }
    
    console.log('User created successfully:', user.id);
    const payload = { user: { id: user.id, role: user.role, is_premium: user.is_premium, level: user.level } };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

    return res.status(201).json({ 
      token, 
      user: { 
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        is_premium: user.is_premium,
        level: user.level,
        age: user.age,
        grade: user.grade,
        mobile: user.mobile,
        completed: [] 
      } 
    });
  } catch (error) {
    console.error('Registration error detail:', error);
    res.status(500).send(error.message || 'Server error');
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const loginId = username || email;

    // Hardcoded admin fallback
    if ((loginId === 'gen.rajeswari@gmail.com' || loginId === 'admin') && password === 'admin123') {
      const adminUser = {
        id: 0, username: 'admin', email: 'gen.rajeswari@gmail.com',
        name: 'Hub Admin', role: 'admin', is_premium: true,
        level: 'warriors', age: 30, grade: 'N/A', completed: []
      };
      const payload = { user: { id: 0, role: 'admin', is_premium: true, level: 'warriors' } };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
      return res.json({ token, user: adminUser });
    }

    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is missing in Vercel settings!');
    }

    // Find user by username or email
    const userResult = await db.query(
      'SELECT * FROM users WHERE username = $1 OR email = $1',
      [loginId]
    );
    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const user = userResult.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Fetch completed progress
    const progressResult = await db.query(
      'SELECT chapter_number as chapter, verse_id as shloka, question, response FROM journal_entries WHERE user_id = $1',
      [user.id]
    );

    const payload = { user: { id: user.id, role: user.role, is_premium: user.is_premium, level: user.level } };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        age: user.age,
        grade: user.grade,
        level: user.level,
        role: user.role,
        is_premium: user.is_premium,
        mobile: user.mobile,
        completed: progressResult.rows
      }
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/auth/profile — Update profile
router.put('/profile', async (req, res) => {
  try {
    const { username, name, age, grade } = req.body;
    const level = getLevelFromAge(age);

    if (!process.env.DATABASE_URL) {
      return res.json({ id: 1, username, name, role: 'student', is_premium: false, age, grade, level });
    }

    const updatedUser = await db.query(
      'UPDATE users SET name = $1, age = $2, grade = $3, level = $4 WHERE username = $5 RETURNING id, username, email, name, role, is_premium, age, grade, level',
      [name, age, grade, level, username]
    );

    if (updatedUser.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(updatedUser.rows[0]);
  } catch (err) {
    console.error('Profile update error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/upgrade — Upgrade to premium
router.post('/upgrade', async (req, res) => {
  try {
    const { username, user_id } = req.body;

    if (!process.env.DATABASE_URL) {
      return res.json({ id: 1, username, role: 'student', is_premium: true });
    }

    let query, params;
    if (user_id) {
      query = 'UPDATE users SET is_premium = true WHERE id = $1 RETURNING id, username, email, name, role, is_premium, age, grade, level';
      params = [user_id];
    } else {
      query = 'UPDATE users SET is_premium = true WHERE username = $1 RETURNING id, username, email, name, role, is_premium, age, grade, level';
      params = [username];
    }

    const updatedUser = await db.query(query, params);
    if (updatedUser.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(updatedUser.rows[0]);
  } catch (err) {
    console.error('Upgrade error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// ===== ADMIN ENDPOINTS =====

// GET /api/auth/admin/users — List all users (admin only)
router.get('/admin/users', adminAuth, async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) {
      return res.json([]);
    }

    const users = await db.query(
      'SELECT id, username, email, name, is_premium, role, level, age, grade, mobile FROM users ORDER BY id'
    );
    res.json(users.rows);
  } catch (err) {
    console.error('Admin users error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/admin/toggle-subscription — Toggle premium status
router.post('/admin/toggle-subscription', adminAuth, async (req, res) => {
  try {
    const { user_id } = req.body;

    if (!process.env.DATABASE_URL) {
      return res.json({ status: 'success', is_premium: true });
    }

    const user = await db.query('SELECT id, is_premium FROM users WHERE id = $1', [user_id]);
    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const newStatus = !user.rows[0].is_premium;
    await db.query('UPDATE users SET is_premium = $1 WHERE id = $2', [newStatus, user_id]);

    res.json({ status: 'success', is_premium: newStatus });
  } catch (err) {
    console.error('Toggle sub error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
