import React from 'react';
import {
  Paper,
  Typography,
  Box,
  LinearProgress,
  Chip,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import SmartWaitTimeDisplay from '../common/SmartWaitTimeDisplay';

const QueuePosition = ({ position, estimatedWaitTime, queueName, status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'waiting':
        return 'primary';
      case 'called':
        return 'success';
      case 'completed':
        return 'default';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'waiting':
        return 'Waiting';
      case 'called':
        return 'Being Called';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 4,
        textAlign: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
      }}
    >
      <Typography variant="h6" gutterBottom>
        {queueName}
      </Typography>

      <Box sx={{ my: 3 }}>
        <PersonIcon sx={{ fontSize: 60, mb: 1 }} />
        <Typography variant="h2" fontWeight="bold">
          #{position}
        </Typography>
        <Typography variant="subtitle1" sx={{ mt: 1 }}>
          Your Position
        </Typography>
      </Box>

      <Box sx={{ my: 3 }}>
        <AccessTimeIcon sx={{ fontSize: 40, mb: 1 }} />
        <Typography variant="h4" fontWeight="bold">
          {estimatedWaitTime} min
        </Typography>
        <Typography variant="subtitle1">
          Estimated Wait Time
        </Typography>
      </Box>

      {/* Smart Wait Time Display with AI Prediction */}
      <SmartWaitTimeDisplay 
        waitTime={estimatedWaitTime}
        confidence="medium"
        showDetails={true}
      />

      <Chip
        label={getStatusLabel()}
        color={getStatusColor()}
        sx={{
          mt: 2,
          bgcolor: 'white',
          color: 'primary.main',
          fontWeight: 'bold',
          px: 2,
          py: 1,
        }}
      />

      {status === 'waiting' && (
        <Box sx={{ mt: 3 }}>
          <LinearProgress
            variant="indeterminate"
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: 'rgba(255,255,255,0.3)',
              '& .MuiLinearProgress-bar': {
                bgcolor: 'white',
              },
            }}
          />
        </Box>
      )}
    </Paper>
  );
};

export default QueuePosition;
