import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import CreateEvent from './pages/CreateEvent';
import MyRegistrations from './pages/MyRegistrations';
import Notifications from './pages/Notifications';
import AdminDashboard from './pages/AdminDashboard';
import theme from './theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="events" element={<PrivateRoute><Events /></PrivateRoute>} />
              <Route path="events/:id" element={<PrivateRoute><EventDetails /></PrivateRoute>} />
              <Route path="create-event" element={<PrivateRoute roles={['admin', 'organizer']}><CreateEvent /></PrivateRoute>} />
              <Route path="my-registrations" element={<PrivateRoute roles={['student']}><MyRegistrations /></PrivateRoute>} />
              <Route path="notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
              <Route path="admin" element={<PrivateRoute roles={['admin']}><AdminDashboard /></PrivateRoute>} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 