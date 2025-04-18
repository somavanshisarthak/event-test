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
const createInAppNotification = async (user_id, title, message) => {
  try {
    await db.query(
      'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
      [user_id, title, message]
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
    // Get events starting in 12 hours
    const [events] = await db.query(`
      SELECT e.*, u.email as student_email, u.id as student_id
      FROM events e
      JOIN registrations r ON e.id = r.event_id
      JOIN users u ON r.student_id = u.id
      WHERE e.date_time BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 12 HOUR)
      AND NOT EXISTS (
        SELECT 1 FROM notifications n 
        WHERE n.user_id = u.id
        AND n.message LIKE '%reminder%'
      )
    `);

    for (const event of events) {
      const message = `Reminder: Event "${event.title}" is starting in 12 hours!`;
      
      // Send email notification
      await sendEmailNotification(
        event.student_email,
        'Event Reminder',
        message
      );

      // Create in-app notification
      await createInAppNotification(
        event.student_id,
        'Event Reminder',
        message
      );
    }
  } catch (error) {
    console.error('Error in checkAndSendEventReminders:', error);
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