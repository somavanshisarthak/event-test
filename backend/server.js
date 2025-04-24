const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const { initializeDatabase } = require('./config/database');
const registrationsRouter = require('./routes/registrations');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Initialize database and start server
const startServer = async () => {
  try {
    await initializeDatabase();
    console.log('Database initialized successfully');

    // Routes
    console.log('Loading routes...');
    app.use('/api/auth', require('./routes/auth.js'));
    console.log('Auth route loaded');
    app.use('/api/events', require('./routes/events.js'));
    console.log('Events route loaded');
    app.use('/api/users', require('./routes/users.js'));
    console.log('Users route loaded');
    app.use('/api/notifications', require('./routes/notifications.js'));
    console.log('Notifications route loaded');
    app.use('/api/registrations', registrationsRouter);
    console.log('Registrations route loaded');

    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error('Error:', err.stack);
      res.status(500).json({ message: 'Something went wrong!' });
    });

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

    // Kick off your reminder-checker
    require('./scripts/notificationCron');
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer(); 