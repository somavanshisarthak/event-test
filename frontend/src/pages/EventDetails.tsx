import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface Event {
  id: number;
  title: string;
  description: string;
  date_time: string;
  capacity: number;
  current_registrations: number;
  organizer_name: string;
  location: string;
  category: string;
}

const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/events/${id}`);
        setEvent(response.data);
        
        if (user) {
          const registrationResponse = await axios.get(
            `http://localhost:5000/api/registrations/check/${id}`,
            { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
          );
          setIsRegistered(registrationResponse.data.isRegistered);
        }
      } catch (err) {
        setError('Failed to fetch event details');
        console.error('Error:', err);
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
      await axios.post(
        `http://localhost:5000/api/registrations/${id}`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setIsRegistered(true);
      if (event) {
        setEvent({ ...event, current_registrations: event.current_registrations + 1 });
      }
    } catch (err) {
      setError('Failed to register for the event');
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

  if (error || !event) {
    return (
      <Box p={3}>
        <Alert severity="error">{error || 'Event not found'}</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
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
                color={event.current_registrations >= event.capacity ? 'error' : 'success'}
              />
            </Box>
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
            <Box mt={3}>
              {user && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleRegistration}
                  disabled={isRegistered || event.current_registrations >= event.capacity}
                >
                  {isRegistered
                    ? 'Already Registered'
                    : event.current_registrations >= event.capacity
                    ? 'Event Full'
                    : 'Register Now'}
                </Button>
              )}
              {!user && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate('/login')}
                >
                  Login to Register
                </Button>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EventDetails; 