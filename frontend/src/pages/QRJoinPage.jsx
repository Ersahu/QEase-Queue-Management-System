import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Box, Button, CircularProgress, Container, Paper, Stack, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { queueAPI, userAPI } from '../services/api';
import toast from 'react-hot-toast';

const QRJoinPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [queueData, setQueueData] = useState(null);
  const [joinedData, setJoinedData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadQueueDetails = async () => {
      try {
        const response = await queueAPI.getQRQueueDetails(token);
        setQueueData(response.data.data);
      } catch (apiError) {
        setError(apiError.response?.data?.message || 'Invalid QR or queue unavailable');
      } finally {
        setLoading(false);
      }
    };

    loadQueueDetails();
  }, [token]);

  const handleJoin = async () => {
    const authToken = localStorage.getItem('token');
    if (!authToken) {
      navigate(`/login?redirect=/qr-join/${token}`);
      return;
    }

    setJoining(true);
    try {
      const response = await userAPI.joinQueueViaQR(token);
      toast.success(response.data.message);
      setJoinedData(response.data.data);
    } catch (apiError) {
      const existingEntry = apiError.response?.data?.data;
      const message = apiError.response?.data?.message || 'Failed to join queue';
      if (existingEntry?.entryId) {
        setJoinedData({
          entryId: existingEntry.entryId,
          position: existingEntry.position,
          queueName: queueData?.name,
        });
        toast.success('You are already checked in for this queue');
      } else {
        toast.error(message);
      }
    } finally {
      setJoining(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: { xs: 3, sm: 6 }, px: { xs: 2, sm: 3 } }}>
      <Paper sx={{ p: { xs: 2.5, sm: 4 }, borderRadius: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : joinedData ? (
          <Stack spacing={2.5} alignItems="stretch">
            <Box sx={{ textAlign: 'center' }}>
              <CheckCircleIcon color="success" sx={{ fontSize: 56, mb: 1 }} />
              <Typography variant="h5" gutterBottom>
                Check-in Successful
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your details have been sent to the admin dashboard.
              </Typography>
            </Box>

            <Alert severity="success">
              Queue: {joinedData.queueName || queueData?.name || 'Selected queue'}<br />
              Position: #{joinedData.position || '-'}
            </Alert>

            <Button variant="contained" size="large" onClick={() => navigate('/dashboard')}>
              Open My Dashboard
            </Button>
          </Stack>
        ) : (
          <>
            <Typography variant="h5" gutterBottom>
              Join Queue
            </Typography>
            <Typography variant="h6" sx={{ mb: 1 }}>
              {queueData?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {queueData?.description || 'No description available'}
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              Service: {queueData?.serviceType || 'general'}
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              Avg service time: {queueData?.avgServiceTime} min
            </Typography>
            <Typography variant="body2" sx={{ mb: 3 }}>
              Managed by: {queueData?.adminName}
            </Typography>

            {queueData?.isPaused && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                This queue is currently paused.
              </Alert>
            )}

            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={handleJoin}
              disabled={joining || queueData?.isPaused}
            >
              {joining ? 'Joining...' : 'Join Queue'}
            </Button>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default QRJoinPage;
