import React from 'react';
import { Alert, Box, Button, Container, Typography } from '@mui/material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      message: error?.message || 'Something went wrong',
    };
  }

  componentDidCatch(error, info) {
    console.error('App render error:', error, info);
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <Container maxWidth="sm" sx={{ py: { xs: 4, sm: 8 } }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {this.state.message}
        </Alert>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          The page could not render. Refresh once; if it continues, log out and sign in again.
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button variant="contained" onClick={() => window.location.reload()}>
            Refresh
          </Button>
          <Button variant="outlined" href="/login">
            Login
          </Button>
        </Box>
      </Container>
    );
  }
}

export default ErrorBoundary;
