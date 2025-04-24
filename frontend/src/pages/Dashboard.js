import React, { useEffect, useState } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  Box,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/events', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.data && Array.isArray(response.data)) {
          const events = response.data
            .filter(event => new Date(event.date_time) > new Date())
            .sort((a, b) => new Date(a.date_time) - new Date(b.date_time))
            .slice(0, 5);
          setUpcomingEvents(events);
          setError('');
        } else {
          setError('Invalid response format from server');
        }
      } catch (err) {
        console.error('Error fetching events:', err);
        if (err.response?.status === 401) {
          setError('Please login again');
        } else {
          setError('Failed to fetch upcoming events. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingEvents();
  }, []);

  if (!user) {
    return null;
  }

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
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              Welcome, {user.name}!
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Role: {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Upcoming Events
            </Typography>
            {upcomingEvents.length === 0 ? (
              <Typography variant="body1" color="text.secondary">
                No upcoming events
              </Typography>
            ) : (
              <List>
                {upcomingEvents.map((event) => (
                  <ListItem
                    key={event.id}
                    divider
                    sx={{ py: 2 }}
                  >
                    <ListItemText
                      primary={event.title}
                      secondary={
                        <>
                          <Typography component="span" variant="body2">
                            Date: {new Date(event.date_time).toLocaleString()}
                          </Typography>
                          <br />
                          <Typography component="span" variant="body2">
                            Location: {event.location}
                          </Typography>
                          <Box mt={1}>
                            <Chip
                              label={event.category}
                              color="primary"
                              variant="outlined"
                              size="small"
                              sx={{ mr: 1 }}
                            />
                            <Chip
                              label={`${event.current_registrations}/${event.capacity}`}
                              color={
                                event.current_registrations >= event.capacity
                                  ? 'error'
                                  : 'success'
                              }
                              size="small"
                            />
                          </Box>
                        </>
                      }
                    />
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => navigate(`/events/${event.id}`)}
                    >
                      View Details
                    </Button>
                  </ListItem>
                ))}
              </List>
            )}
            <Button
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
              onClick={() => navigate('/events')}
            >
              View All Events
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Quick Actions
            </Typography>
            <List>
              {user.role === 'student' && (
                <ListItem button onClick={() => navigate('/my-registrations')}>
                  <ListItemText primary="View My Registrations" />
                </ListItem>
              )}
              {(user.role === 'organizer' || user.role === 'admin') && (
                <ListItem button onClick={() => navigate('/create-event')}>
                  <ListItemText primary="Create New Event" />
                </ListItem>
              )}
              <ListItem button onClick={() => navigate('/notifications')}>
                <ListItemText primary="View Notifications" />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 