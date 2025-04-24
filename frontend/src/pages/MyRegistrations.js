import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Button,
  Box,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const MyRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          'http://localhost:5000/api/registrations/student',
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        setRegistrations(response.data);
        setError('');
      } catch (err) {
        console.error('Error fetching registrations:', err);
        if (err.response?.status === 401) {
          setError('Please login to view your registrations');
          navigate('/login');
        } else {
          setError('Failed to fetch your registrations. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrations();
  }, [navigate]);

  const handleCancelRegistration = async (eventId) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/registrations/${eventId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setRegistrations((prev) =>
        prev.filter((reg) => reg.event_id !== eventId)
      );
    } catch (err) {
      setError('Failed to cancel registration');
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
        My Registrations
      </Typography>
      {registrations.length === 0 ? (
        <Typography variant="body1" color="text.secondary">
          You haven't registered for any events yet.
        </Typography>
      ) : (
        <List>
          {registrations.map((registration) => (
            <ListItem
              key={registration.event_id}
              divider
              sx={{ py: 2 }}
            >
              <ListItemText
                primary={registration.event_title}
                secondary={
                  <>
                    <Typography component="span" variant="body2">
                      Date: {new Date(registration.event_date).toLocaleString()}
                    </Typography>
                    <br />
                    <Typography component="span" variant="body2">
                      Location: {registration.event_location}
                    </Typography>
                    <Box mt={1}>
                      <Chip
                        label={registration.event_category}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    </Box>
                  </>
                }
              />
              <ListItemSecondaryAction>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => navigate(`/events/${registration.event_id}`)}
                  sx={{ mr: 1 }}
                >
                  View Event
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => handleCancelRegistration(registration.event_id)}
                >
                  Cancel
                </Button>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}
    </Container>
  );
};

export default MyRegistrations; 