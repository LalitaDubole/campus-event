const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db/connection');

// Register
router.post('/register', async (req, res) => {
  const { full_name, email, phone, department, year, password } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    await db.query(
      'INSERT INTO users (full_name, email, phone, department, year, password) VALUES (?,?,?,?,?,?)',
      [full_name, email, phone, department, year, hashed]
    );
    res.json({ success: true, message: 'Account created!' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      res.json({ success: false, message: 'Email already registered!' });
    } else {
      res.json({ success: false, message: 'Registration failed!' });
    }
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) return res.json({ success: false, message: 'User not found!' });

    const match = await bcrypt.compare(password, rows[0].password);
    if (!match) return res.json({ success: false, message: 'Wrong password!' });

    req.session.user = { id: rows[0].id, name: rows[0].full_name, email: rows[0].email, role: rows[0].role };
    res.json({ success: true, user: req.session.user });
  } catch (err) {
    res.json({ success: false, message: 'Login failed!' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true, message: 'Logged out!' });
});

module.exports = router;