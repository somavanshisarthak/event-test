import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container, IconButton, Menu, MenuItem, useMediaQuery, useTheme } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Don't show AppBar on login and register pages
  const showAppBar = !['/login', '/register'].includes(location.pathname);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNavigation = (path) => {
    navigate(path);
    handleClose();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {showAppBar && (
        <AppBar position="static">
          <Toolbar>
            <Typography
              variant="h6"
              component="div"
              sx={{ flexGrow: 1, cursor: 'pointer' }}
              onClick={() => navigate('/')}
            >
              EventHub
            </Typography>
            {user ? (
              <>
                {isMobile ? (
                  <>
                    <IconButton
                      size="large"
                      edge="end"
                      color="inherit"
                      aria-label="menu"
                      onClick={handleMenu}
                    >
                      <MenuIcon />
                    </IconButton>
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl)}
                      onClose={handleClose}
                      PaperProps={{
                        sx: {
                          width: 200,
                          maxHeight: 300,
                        },
                      }}
                    >
                      <MenuItem onClick={() => handleNavigation('/events')}>
                        Events
                      </MenuItem>
                      {user.role === 'student' && (
                        <MenuItem onClick={() => handleNavigation('/my-registrations')}>
                          My Registrations
                        </MenuItem>
                      )}
                      {(user.role === 'organizer' || user.role === 'admin') && (
                        <MenuItem onClick={() => handleNavigation('/create-event')}>
                          Create Event
                        </MenuItem>
                      )}
                      <MenuItem onClick={() => handleNavigation('/notifications')}>
                        Notifications
                      </MenuItem>
                      <MenuItem onClick={handleLogout}>Logout</MenuItem>
                    </Menu>
                  </>
                ) : (
                  <>
                    <Button color="inherit" onClick={() => navigate('/events')}>
                      Events
                    </Button>
                    {user.role === 'student' && (
                      <Button
                        color="inherit"
                        onClick={() => navigate('/my-registrations')}
                      >
                        My Registrations
                      </Button>
                    )}
                    {(user.role === 'organizer' || user.role === 'admin') && (
                      <Button
                        color="inherit"
                        onClick={() => navigate('/create-event')}
                      >
                        Create Event
                      </Button>
                    )}
                    <Button color="inherit" onClick={() => navigate('/notifications')}>
                      Notifications
                    </Button>
                    <Button color="inherit" onClick={handleLogout}>
                      Logout
                    </Button>
                  </>
                )}
              </>
            ) : (
              <>
                <Button color="inherit" onClick={() => navigate('/login')}>
                  Login
                </Button>
                <Button color="inherit" onClick={() => navigate('/register')}>
                  Register
                </Button>
              </>
            )}
          </Toolbar>
        </AppBar>
      )}
      <Container 
        component="main" 
        sx={{ 
          flex: 1, 
          py: 4, 
          px: 0,
          maxWidth: '100% !important',
          width: '100%'
        }}
      >
        {children}
      </Container>
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? theme.palette.grey[200]
              : theme.palette.grey[800],
        }}
      >
        <Container maxWidth="sm">
          <Typography variant="body2" align="center">
            EventHub © {new Date().getFullYear()}
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout; 