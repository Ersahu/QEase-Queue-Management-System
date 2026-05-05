import React from 'react';
import { Alert, Box, Chip, Grid, Paper, Typography } from '@mui/material';

const StatBox = ({ label, value }) => (
  <Paper sx={{ p: 2.5, height: '100%' }}>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="h4" fontWeight="bold">
      {value}
    </Typography>
  </Paper>
);

const LiveQueueDashboard = ({ token, status }) => {
  if (!token) return null;

  return (
    <Box>
      <Paper sx={{ p: { xs: 2.5, sm: 4 }, mb: 3, borderRadius: 2 }}>
        <Typography variant="overline" color="text.secondary">
          Live Queue Status
        </Typography>
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          {token.tokenNumber}
        </Typography>
        <Chip
          label={token.status}
          color={token.status === 'called' ? 'success' : 'primary'}
          sx={{ mb: 2 }}
        />
        <Typography variant="body1" color="text.secondary">
          {token.queueName} - {token.customer?.name || 'Customer'}
        </Typography>
      </Paper>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <StatBox label="Now Serving" value={status?.currentToken || 'None'} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatBox label="Your Position" value={`#${token.position || '-'}`} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatBox label="Estimated Wait" value={`${token.estimatedWaitTime || 0} min`} />
        </Grid>
      </Grid>

      {token.position <= 3 && token.status === 'waiting' && (
        <Alert severity="warning">
          Your turn is near. Please stay ready for service.
        </Alert>
      )}

      {token.status === 'called' && (
        <Alert severity="success">
          Your token is being served now.
        </Alert>
      )}
    </Box>
  );
};

export default LiveQueueDashboard;
