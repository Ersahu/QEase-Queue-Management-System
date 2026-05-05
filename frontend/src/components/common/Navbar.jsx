import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <AppBar position="static" color="primary">
      <Container maxWidth="lg">
        <Toolbar
          sx={{
            justifyContent: 'space-between',
            gap: 1,
            flexWrap: 'wrap',
            py: { xs: 1, sm: 0 },
          }}
        >
          {/* Logo */}
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              textDecoration: 'none',
              color: 'inherit',
              fontWeight: 'bold',
            }}
          >
            QEase
          </Typography>

          {/* Navigation Links */}
          <Box
            sx={{
              display: 'flex',
              gap: { xs: 0.5, sm: 1.5 },
              alignItems: 'center',
              flexWrap: 'wrap',
              justifyContent: 'flex-end',
            }}
          >
            {!user ? (
              <>
                <Button
                  color="inherit"
                  component={RouterLink}
                  to="/login"
                >
                  Login
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  component={RouterLink}
                  to="/register"
                >
                  Sign Up
                </Button>
              </>
            ) : (
              <>
                {isAdmin ? (
                  <Button
                    color="inherit"
                    component={RouterLink}
                    to="/admin/dashboard"
                  >
                    Dashboard
                  </Button>
                ) : (
                  <>
                    <Button
                      color="inherit"
                      component={RouterLink}
                      to="/dashboard"
                    >
                      Dashboard
                    </Button>
                    <Button
                      color="inherit"
                      component={RouterLink}
                      to="/qr-scanner"
                    >
                      QR Scanner
                    </Button>
                    <Button
                      color="inherit"
                      component={RouterLink}
                      to="/history"
                    >
                      History
                    </Button>
                  </>
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'white',
                      maxWidth: { xs: 110, sm: 180 },
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {user.name}
                  </Typography>
                  <Button color="inherit" onClick={handleLogout}>
                    Logout
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
