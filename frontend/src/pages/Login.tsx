import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  Paper,
  Grid,
  Avatar,
  useTheme,
} from '@mui/material';
import { LockOutlined } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.palette.background.default,
        py: 12,
        px: 2,
      }}
    >
      <Container maxWidth="xs">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'linear-gradient(145deg, #ffffff 0%, #f4f4f4 100%)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #2196F3 0%, #21CBF3 100%)',
            },
          }}
        >
          <Avatar
            sx={{
              m: 2,
              bgcolor: 'primary.main',
              width: 56,
              height: 56,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
              animation: 'popIn 0.5s ease-out',
              '@keyframes popIn': {
                '0%': {
                  transform: 'scale(0)',
                  opacity: 0,
                },
                '100%': {
                  transform: 'scale(1)',
                  opacity: 1,
                },
              },
            }}
          >
            <LockOutlined />
          </Avatar>
          <Typography
            component="h1"
            variant="h5"
            sx={{
              fontWeight: 'bold',
              mb: 3,
              background: 'linear-gradient(90deg, #2196F3 0%, #21CBF3 100%)',
              backgroundClip: 'text',
              textFillColor: 'transparent',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Welcome Back
          </Typography>
          {error && (
            <Alert
              severity="error"
              sx={{
                width: '100%',
                mb: 2,
                borderRadius: 1,
                animation: 'slideIn 0.3s ease-out',
                '@keyframes slideIn': {
                  '0%': {
                    transform: 'translateY(-20px)',
                    opacity: 0,
                  },
                  '100%': {
                    transform: 'translateY(0)',
                    opacity: 1,
                  },
                },
              }}
            >
              {error}
            </Alert>
          )}
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              width: '100%',
              mt: 1,
            }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    '& fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                  '&.Mui-focused': {
                    '& fieldset': {
                      borderWidth: '2px',
                    },
                  },
                },
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    '& fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                  '&.Mui-focused': {
                    '& fieldset': {
                      borderWidth: '2px',
                    },
                  },
                },
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 2,
                mb: 3,
                py: 1.5,
                position: 'relative',
                overflow: 'hidden',
                background: 'linear-gradient(90deg, #2196F3 0%, #21CBF3 100%)',
                transition: 'all 0.3s ease-in-out',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, #21CBF3 0%, #2196F3 100%)',
                  opacity: 0,
                  transition: 'opacity 0.3s ease-in-out',
                },
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(33, 203, 243, 0.3)',
                  '&::before': {
                    opacity: 1,
                  },
                },
                '&:active': {
                  transform: 'translateY(0)',
                },
              }}
            >
              Sign In
            </Button>
            <Grid container justifyContent="center">
              <Grid item>
                <Link
                  component={RouterLink}
                  to="/register"
                  variant="body2"
                  sx={{
                    color: 'primary.main',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      color: 'primary.dark',
                      textDecoration: 'underline',
                    },
                  }}
                >
                  {"Don't have an account? Sign Up"}
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login; 