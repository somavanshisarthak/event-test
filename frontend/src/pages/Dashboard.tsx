import React, { useEffect, useState } from 'react';
import {
  Grid,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  Box,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface Event {
  id: number;
  title: string;
  description: string;
  date_time: string;
  capacity: number;
  organizer_name: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/events');
        const events = response.data
          .filter((event: Event) => new Date(event.date_time) > new Date())
          .sort((a: Event, b: Event) => new Date(a.date_time).getTime() - new Date(b.date_time).getTime())
          .slice(0, 5);
        setUpcomingEvents(events);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingEvents();
  }, []);

  if (!user) {
    return null; // or redirect to login
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h5" gutterBottom>
            Welcome, {user.name}!
          </Typography>
          <Typography variant="body1">
            Role: {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
          </Typography>
        </Paper>
      </Grid>

      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Upcoming Events
          </Typography>
          {loading ? (
            <Typography>Loading...</Typography>
          ) : upcomingEvents.length > 0 ? (
            <List>
              {upcomingEvents.map((event) => (
                <ListItem
                  key={event.id}
                  button
                  onClick={() => navigate(`/events/${event.id}`)}
                >
                  <ListItemText
                    primary={event.title}
                    secondary={
                      <>
                        <Typography component="span" variant="body2">
                          {new Date(event.date_time).toLocaleString()}
                        </Typography>
                        <br />
                        <Typography component="span" variant="body2">
                          Organizer: {event.organizer_name}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography>No upcoming events</Typography>
          )}
          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/events')}
            >
              View All Events
            </Button>
          </Box>
        </Paper>
      </Grid>

      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
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
  );
};

export default Dashboard; 