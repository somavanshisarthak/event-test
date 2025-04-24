import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Chip,
  CircularProgress,
  Alert,
  Grid,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const EventDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/events/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.data) {
          setEvent(response.data);
          setError('');
          
          if (user) {
            try {
              const registrationResponse = await axios.get(
                `http://localhost:5000/api/registrations/check/${id}`,
                {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                  }
                }
              );
              setIsRegistered(registrationResponse.data.isRegistered);
            } catch (regErr) {
              console.error('Error checking registration:', regErr);
              setIsRegistered(false);
            }
          }
        } else {
          setError('Invalid event data received');
        }
      } catch (err) {
        console.error('Error fetching event:', err);
        if (err.response?.status === 404) {
          setError('Event not found');
        } else if (err.response?.status === 401) {
          setError('Please login to view event details');
        } else {
          setError('Failed to fetch event details. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [id, user]);

  const handleRegistration = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await axios.post(
        'http://localhost:5000/api/registrations',
        { event_id: parseInt(id) },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
        }
      );

      // Update local state
      setIsRegistered(true);
      setEvent((prev) => ({
        ...prev,
        current_registrations: prev.current_registrations + 1,
      }));

      // Show success message
      setError('Successfully registered for the event!');
      setTimeout(() => setError(''), 3000); // Clear success message after 3 seconds

      // Refresh registration status
      const checkResponse = await axios.get(
        `http://localhost:5000/api/registrations/check/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setIsRegistered(checkResponse.data.registered);
    } catch (err) {
      console.error('Registration error:', err);
      if (err.response?.status === 400) {
        setError(err.response.data.message || 'Failed to register for the event');
      } else if (err.response?.status === 401) {
        setError('Please login to register for the event');
        navigate('/login');
      } else if (err.response?.status === 404) {
        setError('Event not found');
      } else {
        setError('Failed to register for the event. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !event) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error || 'Event not found'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      <Paper sx={{ p: 4, mt: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h4" gutterBottom>
              {event.title}
            </Typography>
            <Box mb={2}>
              <Chip
                label={event.category}
                color="primary"
                variant="outlined"
                sx={{ mr: 1 }}
              />
              <Chip
                label={`${event.current_registrations}/${event.capacity} registered`}
                color={
                  event.current_registrations >= event.capacity
                    ? 'error'
                    : 'success'
                }
              />
            </Box>
          </Grid>

          <Grid item xs={12} md={8}>
            <Typography variant="body1" paragraph>
              {event.description}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              Date & Time: {new Date(event.date_time).toLocaleString()}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              Location: {event.location}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              Organizer: {event.organizer_name}
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{ mt: { xs: 2, md: 0 } }}>
              {user ? (
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={handleRegistration}
                  disabled={
                    loading ||
                    isRegistered ||
                    event.current_registrations >= event.capacity
                  }
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : isRegistered ? (
                    'Already Registered'
                  ) : event.current_registrations >= event.capacity ? (
                    'Event Full'
                  ) : (
                    'Register Now'
                  )}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={() => navigate('/login')}
                >
                  Login to Register
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default EventDetails; 