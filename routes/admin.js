const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// Add event
router.post('/events', async (req, res) => {
  const { title, description, category, date, time, venue, seats } = req.body;
  try {
    await db.query(
      'INSERT INTO events (title, description, category, date, time, venue, seats) VALUES (?,?,?,?,?,?,?)',
      [title, description, category, date, time, venue, seats]
    );
    res.json({ success: true, message: 'Event added!' });
  } catch (err) {
    res.json({ success: false, message: 'Failed to add event!' });
  }
});

// Delete event
router.delete('/events/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM registrations WHERE event_id = ?', [req.params.id]);
    await db.query('DELETE FROM events WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Event deleted!' });
  } catch (err) {
    res.json({ success: false, message: 'Failed to delete event!' });
  }
});

module.exports = router;
// Add notice
router.post('/notices', async (req, res) => {
  const { title, content } = req.body;
  try {
    await db.query('INSERT INTO notices (title, content) VALUES (?,?)', [title, content]);
    res.json({ success: true, message: 'Notice added!' });
  } catch (err) {
    res.json({ success: false, message: 'Failed to add notice!' });
  }
});

// Delete notice
router.delete('/notices/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM notices WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Notice deleted!' });
  } catch (err) {
    res.json({ success: false, message: 'Failed to delete notice!' });
  }
});
