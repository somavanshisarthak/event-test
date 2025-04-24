const { checkAndSendEventReminders } = require('../services/notificationService');
require('dotenv').config();

// Run every 5 minutes
const INTERVAL = 5 * 60 * 1000;

console.log('Starting notification cron job...');

// Initial run
checkAndSendEventReminders().catch(console.error);

// Schedule subsequent runs
setInterval(() => {
  checkAndSendEventReminders().catch(console.error);
}, INTERVAL); 