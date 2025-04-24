# College Event Management System - Backend

This is the backend service for the College Event Management System, built with Node.js, Express, and MySQL.

## Features

- User authentication and authorization (JWT)
- Role-based access control (Admin, Organizer, Student)
- Event management (CRUD operations)
- Event registration system
- Notification service (email and in-app)
- RESTful API endpoints
- Swagger documentation

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   DB_HOST=localhost
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   DB_NAME=college_events
   JWT_SECRET=your_jwt_secret_key
   EMAIL_SERVICE=gmail
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_email_password
   ```

4. Set up the database:
   ```bash
   mysql -u your_username -p < database/schema.sql
   ```

5. Start the server:
   ```bash
   npm start
   ```

6. Start the notification service (in a separate terminal):
   ```bash
   node scripts/notificationCron.js
   ```

## API Documentation

Once the server is running, you can access the Swagger documentation at:
```
http://localhost:5000/api-docs
```

## API Endpoints

### Authentication
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login user

### Events
- GET /api/events - Get all events
- GET /api/events/:id - Get single event
- POST /api/events - Create event (Organizer/Admin only)
- PUT /api/events/:id - Update event (Organizer/Admin only)
- DELETE /api/events/:id - Delete event (Organizer/Admin only)

### Registrations
- POST /api/registrations - Register for an event (Student only)
- GET /api/registrations/event/:event_id - Get event registrations (Organizer/Admin only)
- GET /api/registrations/student - Get student's registrations
- DELETE /api/registrations/:event_id - Cancel registration (Student only)

### Notifications
- GET /api/notifications - Get user notifications
- PUT /api/notifications/:id/read - Mark notification as read
- PUT /api/notifications/read-all - Mark all notifications as read

## Development

To run the server in development mode with hot reloading:
```bash
npm run dev
```

## Testing

To run tests:
```bash
npm test
```

## License

MIT 