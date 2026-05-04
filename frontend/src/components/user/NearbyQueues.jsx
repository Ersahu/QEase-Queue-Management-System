import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  Alert,
  Chip,
} from '@mui/material';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import { userAPI } from '../../services/api';

const NearbyQueues = ({ onJoin }) => {
  const [queues, setQueues] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const locateAndFetch = async () => {
    setLoading(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const response = await userAPI.getNearbyQueues({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            radiusKm: 8,
          });
          setQueues(response.data.data);
        } catch (apiError) {
          setError(apiError.response?.data?.message || 'Unable to fetch nearby queues');
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError('Location permission denied. Enable location to discover nearby queues.');
        setLoading(false);
      }
    );
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Nearby Queues</Typography>
        <Button
          variant="outlined"
          startIcon={<MyLocationIcon />}
          onClick={locateAndFetch}
          disabled={loading}
        >
          {loading ? 'Locating...' : 'Find Near Me'}
        </Button>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {queues.length > 0 && (
        <Grid container spacing={2}>
          {queues.map((queue) => (
            <Grid item xs={12} md={6} key={queue._id}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {queue.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {queue.description || 'No description'}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip label={`${queue.distanceKm} km`} size="small" />
                    <Chip label={`${queue.waitingCount} waiting`} size="small" color="primary" />
                    <Chip label={queue.serviceType || 'service'} size="small" />
                  </Box>
                  <Button size="small" variant="contained" onClick={() => onJoin(queue._id, queue.name)}>
                    Join Queue
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default NearbyQueues;
