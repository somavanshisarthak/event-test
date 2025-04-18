import React, { useState } from 'react';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Avatar,
  MenuItem,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import useTypingEffect from '../hooks/useTypingEffect';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { register } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const words = ['hackathons', 'events', 'workshops', 'conferences', 'meetups'];
  const typingText = useTypingEffect(words, 100, 50, 2000);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const { confirmPassword, ...userData } = formData;
    const result = await register(userData);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: { xs: 'column', md: 'row' },
      margin: 0,
      padding: 0,
      width: '100%'
    }}>
      {/* Left Side - Info Section - Hidden on Mobile */}
      {!isMobile && (
        <Box sx={{
          flex: 1,
          backgroundColor: '#0d1117',
          color: 'white',
          p: { xs: 4, md: 8 },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: { xs: 'center', md: 'flex-start' },
          textAlign: { xs: 'center', md: 'left' },
          margin: 0,
          padding: 0,
          width: '100%'
        }}>
          <Typography variant="h3" component="h1" sx={{ 
            fontWeight: 'bold',
            mb: 2,
            fontSize: { xs: '2rem', md: '3rem' }
          }}>
            Join EventHub
          </Typography>
          <Typography variant="h6" sx={{ 
            color: '#8b949e',
            maxWidth: '500px',
            minHeight: '72px'
          }}>
            Find <span style={{ color: '#28a745' }}>{typingText}</span>
            <span style={{ 
              borderRight: '2px solid #28a745',
              animation: 'blink 1s step-end infinite',
              marginLeft: '2px'
            }}></span>
          </Typography>
        </Box>
      )}

      {/* Right Side - Form Section */}
      <Box sx={{
        flex: 1,
        backgroundColor: 'white',
        p: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        margin: 0,
        padding: 0,
        width: '100%'
      }}>
        <Paper 
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            width: '100%',
            maxWidth: '100%',
            borderRadius: 0,
            backgroundColor: 'white',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            margin: 0,
            padding: 0
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            mb: 3,
            mt: { xs: 4, md: 0 }
          }}>
            <Avatar sx={{ bgcolor: '#28a745', mb: 2 }}>
              <PersonAddOutlinedIcon />
            </Avatar>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
              Create an Account
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              margin="normal"
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              margin="normal"
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              select
              label="Role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              margin="normal"
              required
              sx={{ mb: 3 }}
            >
              <MenuItem value="student">Student</MenuItem>
              <MenuItem value="organizer">Organizer</MenuItem>
            </TextField>
            <Button
              fullWidth
              type="submit"
              variant="contained"
              sx={{
                mb: 2,
                py: 1.5,
                backgroundColor: '#28a745',
                '&:hover': {
                  backgroundColor: '#218838'
                }
              }}
            >
              Create account
            </Button>
            <Button
              fullWidth
              variant="text"
              onClick={() => navigate('/login')}
              sx={{
                color: '#28a745',
                '&:hover': {
                  backgroundColor: 'rgba(40, 167, 69, 0.04)'
                }
              }}
            >
              Already have an account? Sign in
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default Register; 