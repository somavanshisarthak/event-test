const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth, checkRole } = require('../middleware/auth');
const { sendEmailNotification, createInAppNotification } = require('../services/notificationService');

// Register for an event (Student only)
router.post('/', auth, checkRole(['student']), async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const { event_id } = req.body;
    const user_id = req.user.id;

    console.log('Registration attempt:', { event_id, user_id });

    // Validate event_id
    if (!event_id || isNaN(parseInt(event_id))) {
      throw { status: 400, message: 'Invalid event ID' };
    }

    // Check if event exists and has capacity
    const [events] = await connection.query(
      `SELECT e.*, u.name as organizer_name, u.email as student_email 
       FROM events e 
       JOIN users u ON e.organizer_id = u.id 
       WHERE e.id = ?`,
      [event_id]
    );

    if (events.length === 0) {
      throw { status: 404, message: 'Event not found' };
    }

    const event = events[0];
    console.log('Event found:', event);

    // Check if event date has passed
    if (new Date(event.date_time) < new Date()) {
      throw { status: 400, message: 'Event has already taken place' };
    }

    // Check if event is full
    const [registrations] = await connection.query(
      `SELECT COUNT(*) as count 
       FROM registrations 
       WHERE event_id = ? AND status = "confirmed"`,
      [event_id]
    );

    if (registrations[0].count >= event.capacity) {
      throw { status: 400, message: 'Event is full' };
    }

    // Check if already registered
    const [existingReg] = await connection.query(
      `SELECT * FROM registrations 
       WHERE event_id = ? AND user_id = ?`,
      [event_id, user_id]
    );

    if (existingReg.length > 0) {
      throw { status: 400, message: 'Already registered for this event' };
    }

    // Register student
    const [result] = await connection.query(
      `INSERT INTO registrations (event_id, user_id, status) 
       VALUES (?, ?, "confirmed")`,
      [event_id, user_id]
    );

    console.log('Registration created:', result);

    // Update event's current registrations count
    await connection.query(
      `UPDATE events 
       SET current_registrations = current_registrations + 1 
       WHERE id = ?`,
      [event_id]
    );

    // Check if we should send an immediate reminder
    const eventTime = new Date(event.date_time);
    const now = new Date();
    const diffHours = (eventTime - now) / (1000 * 60 * 60);

    if (diffHours <= 12) {
      const when = eventTime.toLocaleString();
      const message = `Are you ready for "${event.title}" on ${when}?`;

      // Send immediate email notification
      await sendEmailNotification(
        event.student_email,
        'Event Reminder',
        message
      );

      // Create immediate in-app notification
      await createInAppNotification(
        user_id,
        event_id,
        'Event Reminder',
        message
      );
    }

    await connection.commit();

    res.status(201).json({ 
      message: 'Successfully registered for the event',
      event: {
        title: event.title,
        date_time: event.date_time,
        organizer_name: event.organizer_name
      }
    });
  } catch (err) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Registration error:', err);
    const status = err.status || 500;
    const message = err.message || 'Error registering for event';
    res.status(status).json({ message });
  } finally {
    if (connection) {
      connection.release();
    }
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
      JOIN users u ON r.user_id = u.id
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
      SELECT 
        r.*,
        e.title              AS event_title,
        e.description        AS event_description,
        e.date_time          AS event_date,        -- match frontend
        e.location           AS event_location,    -- match frontend
        e.category           AS event_category,    -- match frontend
        u.name               AS organizer_name
      FROM registrations r
      JOIN events e ON r.event_id = e.id
      JOIN users u ON e.organizer_id = u.id
      WHERE r.user_id = ?
    `, [req.user.id]);

    res.json(registrations);
  } catch (err) {
    console.error('Error fetching registrations:', err);
    res.status(500).json({ message: 'Error fetching registrations' });
  }
});

// Cancel registration (Student only)
router.delete('/:event_id', auth, checkRole(['student']), async (req, res) => {
  try {
    const event_id = req.params.event_id;
    const user_id = req.user.id;

    const [result] = await db.query(
      'DELETE FROM registrations WHERE event_id = ? AND user_id = ?',
      [event_id, user_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    res.json({ message: 'Registration cancelled successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error cancelling registration' });
  }
});

// Check if user is registered for an event
router.get('/check/:eventId', auth, async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const studentId = req.user.id;

    console.log('Checking registration:', { eventId, studentId });

    if (isNaN(eventId)) {
      return res.status(400).json({ message: 'Invalid event ID' });
    }

    // Check if event exists
    const [events] = await db.query(
      `SELECT id FROM events WHERE id = ?`,
      [eventId]
    );

    if (events.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check registration status
    const [registrations] = await db.query(
      `SELECT * FROM registrations 
       WHERE user_id = ? AND event_id = ?`,
      [studentId, eventId]
    );

    console.log('Registration check result:', registrations);

    if (registrations.length > 0) {
      res.json({
        registered: true,
        registration: registrations[0]
      });
    } else {
      res.json({
        registered: false
      });
    }
  } catch (err) {
    console.error('Error checking registration:', err);
    res.status(500).json({ message: 'Error checking registration status' });
  }
});

// Alias for /student endpoint
router.get('/my', auth, checkRole(['student']), async (req, res) => {
  try {
    const [registrations] = await db.query(`
      SELECT 
        r.*,
        e.title              AS event_title,
        e.description        AS event_description,
        e.date_time          AS event_date,        -- match frontend
        e.location           AS event_location,    -- match frontend
        e.category           AS event_category,    -- match frontend
        u.name               AS organizer_name
      FROM registrations r
      JOIN events e ON r.event_id = e.id
      JOIN users u ON e.organizer_id = u.id
      WHERE r.user_id = ?
    `, [req.user.id]);
    res.json(registrations);
  } catch (err) {
    console.error('Error fetching registrations:', err);
    res.status(500).json({ message: 'Error fetching registrations' });
  }
});

module.exports = router; 