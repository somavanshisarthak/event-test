import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Grid,
  Avatar,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';
import './Register.css';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import useTypingEffect from '../hooks/useTypingEffect';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const words = ['hackathons', 'events', 'workshops', 'conferences', 'meetups'];
  const typingText = useTypingEffect(words, 100, 50, 2000);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const result = await login(email, password);
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
            Welcome to EventHub
          </Typography>
          <Typography variant="h6" sx={{ 
            color: '#8b949e',
            maxWidth: '500px',
            minHeight: '72px'
          }}>
            Find <span style={{ color: '#2196F3' }}>{typingText}</span>
            <span style={{ 
              borderRight: '2px solid #2196F3',
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
            <Avatar sx={{ bgcolor: '#2196F3', mb: 2 }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
              Sign in to EventHub
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
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              sx={{ mb: 3 }}
            />
            <Button
              fullWidth
              type="submit"
              variant="contained"
              sx={{
                mb: 2,
                py: 1.5,
                backgroundColor: '#2196F3',
                '&:hover': {
                  backgroundColor: '#1976D2'
                }
              }}
            >
              Sign in
            </Button>
            <Button
              fullWidth
              variant="text"
              onClick={() => navigate('/register')}
              sx={{
                color: '#2196F3',
                '&:hover': {
                  backgroundColor: 'rgba(33, 150, 243, 0.04)'
                }
              }}
            >
              Don't have an account? Sign up
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default Login; 