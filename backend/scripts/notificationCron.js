const notificationService = require('../services/notificationService');
require('dotenv').config();

// Run the notification check every 5 minutes
setInterval(async () => {
  console.log('Checking for upcoming events...');
  await notificationService.checkAndSendEventReminders();
}, 5 * 60 * 1000); // 5 minutes in milliseconds

// Initial check
console.log('Starting notification service...');
notificationService.checkAndSendEventReminders(); 