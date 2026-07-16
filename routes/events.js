const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// Get all events
router.get('/', async (req, res) => {
  try {
    const [events] = await db.query('SELECT * FROM events ORDER BY date ASC');
    res.json({ success: true, events });
  } catch (err) {
    res.json({ success: false, message: 'Failed to fetch events!' });
  }
});

// Register for event
router.post('/register/:id', async (req, res) => {
  if (!req.session.user) return res.json({ success: false, message: 'Please login first!' });
  const { name, stream, phone, email } = req.body;
  try {
    await db.query(
      'INSERT INTO registrations (user_id, event_id, name, stream, phone, email) VALUES (?,?,?,?,?,?)',
      [req.session.user.id, req.params.id, name, stream, phone, email]
    );
    res.json({ success: true, message: 'Registered successfully!' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      res.json({ success: false, message: 'Already registered!' });
    } else {
      res.json({ success: false, message: 'Registration failed!' });
    }
  }
});
// My registrations
router.get('/my-registrations', async (req, res) => {
  if (!req.session.user) return res.json({ success: false, message: 'Please login!' });
  try {
    const [rows] = await db.query(
      `SELECT r.*, e.title, e.category, e.date, e.venue 
       FROM registrations r 
       JOIN events e ON r.event_id = e.id 
       WHERE r.user_id = ?`,
      [req.session.user.id]
    );
    res.json({ success: true, registrations: rows });
  } catch (err) {
    res.json({ success: false, message: 'Failed!' });
  }
});

// Admin - all registrations
router.get('/all-registrations', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT r.*, e.title as event_title, e.category 
       FROM registrations r 
       JOIN events e ON r.event_id = e.id 
       ORDER BY r.registered_at DESC`
    );
    res.json({ success: true, registrations: rows });
  } catch (err) {
    res.json({ success: false, message: 'Failed!' });
  }
});

router.get('/notices', async (req, res) => {
  try {
    const [notices] = await db.query('SELECT * FROM notices ORDER BY created_at DESC');
    res.json({ success: true, notices });
  } catch (err) {
    res.json({ success: false, message: 'Failed to fetch notices!' });
  }
});
// Get all thoughts
router.get('/thoughts', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM thoughts ORDER BY created_at DESC LIMIT 20');
    res.json({ success: true, thoughts: rows });
  } catch (err) {
    res.json({ success: false, message: 'Failed!' });
  }
});

// Post a thought
router.post('/thoughts', async (req, res) => {
  if (!req.session.user) return res.json({ success: false, message: 'Please login first!' });
  const { message } = req.body;
  if (!message) return res.json({ success: false, message: 'Message cannot be empty!' });
  try {
    await db.query(
      'INSERT INTO thoughts (user_name, message) VALUES (?,?)',
      [req.session.user.name, message]
    );
    res.json({ success: true, message: 'Thought posted!' });
  } catch (err) {
    res.json({ success: false, message: 'Failed to post!' });
  }
});
module.exports = router;
