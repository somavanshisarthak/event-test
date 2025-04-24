const nodemailer = require('nodemailer');
const db = require('../config/db');
require('dotenv').config();

// Create email transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Send email notification
const sendEmailNotification = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text
    });
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

// Create in-app notification
const createInAppNotification = async (user_id, event_id, title, message) => {
  try {
    await db.query(
      `INSERT INTO notifications
        (user_id, event_id, title, message)
       VALUES (?, ?, ?, ?)`,
      [user_id, event_id, title, message]
    );
    return true;
  } catch (error) {
    console.error('Error creating notification:', error);
    return false;
  }
};

// Check and send event reminders
const checkAndSendEventReminders = async () => {
  try {
    const [rows] = await db.query(`
      SELECT
        e.id           AS event_id,
        e.title        AS event_title,
        e.date_time    AS event_date_time,
        r.user_id      AS student_id,
        u.email        AS student_email
      FROM events e
      JOIN registrations r ON e.id = r.event_id
      JOIN users u         ON u.id = r.user_id
      WHERE 
        e.date_time BETWEEN
          -- 12 hours minus 5 minutes
          DATE_SUB(
            DATE_ADD(NOW(), INTERVAL 12 HOUR),
            INTERVAL 5 MINUTE
          )
        AND
          -- 12 hours plus 5 minutes
          DATE_ADD(
            DATE_ADD(NOW(), INTERVAL 12 HOUR),
            INTERVAL 5 MINUTE
          )
        AND NOT EXISTS (
          -- only skip if *this* event reminder already exists
          SELECT 1
          FROM notifications n
          WHERE n.user_id  = r.user_id
            AND n.event_id = e.id
            AND n.title    = 'Event Reminder'
        )
    `);

    for (const event of rows) {
      const when = new Date(event.event_date_time).toLocaleString();
      const message = `Are you ready for "${event.event_title}" on ${when}?`;

      // email
      await sendEmailNotification(event.student_email, 'Event Reminder', message);

      // in-app
      await createInAppNotification(
        event.student_id,   // user_id
        event.event_id,     // event_id
        'Event Reminder',   // title
        message
      );
    }
  } catch (error) {
    console.error('Error checking and sending reminders:', error);
  }
};

// Get user notifications
const getUserNotifications = async (user_id) => {
  try {
    const [notifications] = await db.query(`
      SELECT n.*
      FROM notifications n
      WHERE n.user_id = ?
      ORDER BY n.created_at DESC
    `, [user_id]);
    return notifications;
  } catch (error) {
    console.error('Error getting user notifications:', error);
    return [];
  }
};

// Mark notification as read
const markNotificationAsRead = async (notification_id) => {
  try {
    await db.query(
      'UPDATE notifications SET is_read = true WHERE id = ?',
      [notification_id]
    );
    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
};

module.exports = {
  sendEmailNotification,
  createInAppNotification,
  checkAndSendEventReminders,
  getUserNotifications,
  markNotificationAsRead
}; 