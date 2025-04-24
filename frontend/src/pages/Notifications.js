import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Box,
  CircularProgress,
  Alert,
  IconButton,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(
          'http://localhost:5000/api/notifications',
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        setNotifications(response.data);
      } catch (err) {
        setError('Failed to fetch notifications');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await axios.put(
        `http://localhost:5000/api/notifications/${notificationId}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, is_read: true }
            : notification
        )
      );
    } catch (err) {
      setError('Failed to mark notification as read');
      console.error('Error:', err);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Notifications
      </Typography>
      {notifications.length === 0 ? (
        <Typography variant="body1" color="text.secondary">
          You have no notifications.
        </Typography>
      ) : (
        <List>
          {notifications.map((notification) => (
            <ListItem
              key={notification.id}
              divider
              sx={{
                backgroundColor: notification.is_read
                  ? 'inherit'
                  : 'action.hover',
              }}
            >
              <ListItemIcon>
                {notification.is_read ? (
                  <NotificationsOffIcon color="action" />
                ) : (
                  <NotificationsActiveIcon color="primary" />
                )}
              </ListItemIcon>
              <ListItemText
                primary={notification.title}
                secondary={
                  <>
                    <Typography component="span" variant="body2">
                      {notification.message}
                    </Typography>
                    <br />
                    <Typography component="span" variant="caption">
                      {new Date(notification.created_at).toLocaleString()}
                    </Typography>
                  </>
                }
              />
              {!notification.is_read && (
                <IconButton
                  edge="end"
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <NotificationsIcon />
                </IconButton>
              )}
            </ListItem>
          ))}
        </List>
      )}
    </Container>
  );
};

export default Notifications; 