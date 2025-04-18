const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth, checkRole } = require('../middleware/auth');

// Get all events
router.get('/', async (req, res) => {
  try {
    const [events] = await db.query(`
      SELECT e.*, u.name as organizer_name 
      FROM events e 
      JOIN users u ON e.organizer_id = u.id
      ORDER BY e.date_time ASC
    `);
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching events' });
  }
});

// Get single event
router.get('/:id', async (req, res) => {
  try {
    const [events] = await db.query(`
      SELECT e.*, u.name as organizer_name 
      FROM events e 
      JOIN users u ON e.organizer_id = u.id
      WHERE e.id = ?
    `, [req.params.id]);

    if (events.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(events[0]);
  } catch (err) {
    console.error('Error fetching event:', err);
    res.status(500).json({ message: 'Error fetching event' });
  }
});

// Create event (Organizer and Admin only)
router.post('/', auth, checkRole(['organizer', 'admin']), async (req, res) => {
  try {
    const { title, description, date_time, capacity, location, category } = req.body;
    
    // Validate required fields
    if (!title || !description || !date_time || !capacity || !location || !category) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Set organizer_id based on user role
    const organizer_id = req.user.role === 'admin' ? req.body.organizer_id : req.user.id;

    const [result] = await db.query(
      'INSERT INTO events (title, description, date_time, capacity, location, category, organizer_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, description, date_time, capacity, location, category, organizer_id]
    );

    res.status(201).json({
      message: 'Event created successfully',
      event: { 
        id: result.insertId, 
        title, 
        description, 
        date_time, 
        capacity, 
        location, 
        category, 
        organizer_id 
      }
    });
  } catch (err) {
    console.error('Error creating event:', err);
    res.status(500).json({ message: 'Error creating event' });
  }
});

// Update event (Organizer and Admin only)
router.put('/:id', auth, checkRole(['organizer', 'admin']), async (req, res) => {
  try {
    const { title, description, date_time, capacity } = req.body;
    const eventId = req.params.id;

    // Check if event exists and user has permission
    const [events] = await db.query(
      'SELECT * FROM events WHERE id = ?',
      [eventId]
    );

    if (events.length === 0) {
      return res.status(402).json({ message: 'Event not found' });
    }

    if (req.user.role === 'organizer' && events[0].organizer_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }

    await db.query(
      'UPDATE events SET title = ?, description = ?, date_time = ?, capacity = ? WHERE id = ?',
      [title, description, date_time, capacity, eventId]
    );

    res.json({ message: 'Event updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating event' });
  }
});

// Delete event (Organizer and Admin only)
router.delete('/:id', auth, checkRole(['organizer', 'admin']), async (req, res) => {
  try {
    const eventId = req.params.id;

    // Check if event exists and user has permission
    const [events] = await db.query(
      'SELECT * FROM events WHERE id = ?',
      [eventId]
    );

    if (events.length === 0) {
      return res.status(402).json({ message: 'Event not found' });
    }

    if (req.user.role === 'organizer' && events[0].organizer_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    await db.query('DELETE FROM events WHERE id = ?', [eventId]);
    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting event' });
  }
});

module.exports = router; 