const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth, checkRole } = require('../middleware/auth');

// Register for an event (Student only)
router.post('/:eventId', auth, checkRole(['student']), async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const studentId = req.user.id;

    // Check if event exists and has capacity
    const [events] = await db.query(
      'SELECT * FROM events WHERE id = ?',
      [eventId]
    );

    if (events.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const event = events[0];

    // Check if event is full
    const [registrations] = await db.query(
      'SELECT COUNT(*) as count FROM registrations WHERE event_id = ?',
      [eventId]
    );

    if (registrations[0].count >= event.capacity) {
      return res.status(400).json({ message: 'Event is full' });
    }

    // Check if already registered
    const [existingReg] = await db.query(
      'SELECT * FROM registrations WHERE event_id = ? AND student_id = ?',
      [eventId, studentId]
    );

    if (existingReg.length > 0) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }

    // Register student
    await db.query(
      'INSERT INTO registrations (event_id, student_id) VALUES (?, ?)',
      [eventId, studentId]
    );

    // Update event's current registrations count
    await db.query(
      'UPDATE events SET current_registrations = current_registrations + 1 WHERE id = ?',
      [eventId]
    );

    res.status(201).json({ message: 'Successfully registered for the event' });
  } catch (err) {
    console.error('Error registering for event:', err);
    res.status(500).json({ message: 'Error registering for event' });
  }
});

// Get registrations for an event (Organizer and Admin only)
router.get('/event/:event_id', auth, checkRole(['organizer', 'admin']), async (req, res) => {
  try {
    const event_id = req.params.event_id;

    // Check if event exists and user has permission
    const [events] = await db.query(
      'SELECT * FROM events WHERE id = ?',
      [event_id]
    );

    if (events.length === 0) {
      return res.status(402).json({ message: 'Event not found' });
    }

    if (req.user.role === 'organizer' && events[0].organizer_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view registrations for this event' });
    }

    const [registrations] = await db.query(`
      SELECT r.*, u.name as student_name, u.email as student_email
      FROM registrations r
      JOIN users u ON r.student_id = u.id
      WHERE r.event_id = ?
    `, [event_id]);

    res.json(registrations);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching registrations' });
  }
});

// Get student's registrations
router.get('/student', auth, checkRole(['student']), async (req, res) => {
  try {
    const [registrations] = await db.query(`
      SELECT r.*, e.title as event_title, e.description as event_description, 
             e.date_time as event_date_time, u.name as organizer_name
      FROM registrations r
      JOIN events e ON r.event_id = e.id
      JOIN users u ON e.organizer_id = u.id
      WHERE r.student_id = ?
    `, [req.user.id]);

    res.json(registrations);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching registrations' });
  }
});

// Cancel registration (Student only)
router.delete('/:event_id', auth, checkRole(['student']), async (req, res) => {
  try {
    const event_id = req.params.event_id;
    const student_id = req.user.id;

    const [result] = await db.query(
      'DELETE FROM registrations WHERE event_id = ? AND student_id = ?',
      [event_id, student_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    res.json({ message: 'Registration cancelled successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error cancelling registration' });
  }
});

module.exports = router; 