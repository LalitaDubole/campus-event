const express = require('express');
const session = require('express-session');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'campushub_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events'));
app.use('/api/admin', require('./routes/admin'));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('CampusHub running at http://localhost:' + PORT);
});

// Auto delete expired events -  24 hour check
const db = require('./db/connection');

async function deleteExpiredEvents() {
  try {
    await db.query('DELETE FROM registrations WHERE event_id IN (SELECT id FROM events WHERE date < CURDATE())');
    await db.query('DELETE FROM events WHERE date < CURDATE()');
    console.log('Expired events cleaned up!');
  } catch (err) {
    console.error('Cleanup error:', err);
  }
}

// Run immediately on server start
deleteExpiredEvents();

// Run every 24 hours
setInterval(deleteExpiredEvents, 24 * 60 * 60 * 1000);