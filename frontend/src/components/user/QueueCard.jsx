import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const QueueCard = ({ queue, onJoin }) => {
  const getServiceTypeIcon = (serviceType) => {
    const icons = {
      clinic: '🏥',
      salon: '💇',
      bank: '🏦',
      restaurant: '🍽️',
      retail: '🛍️',
      government: '🏛️',
      other: '📋',
    };
    return icons[serviceType] || '📋';
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="h6" component="h2" gutterBottom>
              {queue.serviceType ? getServiceTypeIcon(queue.serviceType) : '📋'} {queue.name}
            </Typography>
          </Box>
          <Chip
            label={queue.isPaused ? 'Paused' : 'Active'}
            color={queue.isPaused ? 'warning' : 'success'}
            size="small"
          />
        </Box>

        {queue.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {queue.description}
          </Typography>
        )}

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <PeopleIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {queue.waitingCount || 0} waiting
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <AccessTimeIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              ~{queue.avgServiceTime} min/service
            </Typography>
          </Box>
        </Box>
      </CardContent>

      <CardActions>
        <Button
          variant="contained"
          fullWidth
          onClick={() => onJoin(queue._id)}
          disabled={queue.isPaused}
        >
          {queue.isPaused ? 'Queue Paused' : 'Join Queue'}
        </Button>
      </CardActions>
    </Card>
  );
};

export default QueueCard;
