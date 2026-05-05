import React, { useEffect, useState } from 'react';
import { Alert, Button, Container, CircularProgress, Box } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useParams } from 'react-router-dom';
import { tokenAPI } from '../services/api';
import { initializeSocket, joinQueueRoom, onTokenUpdated } from '../services/socketService';
import LiveQueueDashboard from '../components/token/LiveQueueDashboard';
import toast from 'react-hot-toast';

const TokenStatus = () => {
  const { entryId } = useParams();
  const [token, setToken] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStatus = async () => {
    try {
      setError('');
      const response = await tokenAPI.getStatus(entryId);
      setToken(response.data.data.token);
      setStatus(response.data.data.status);
      if (response.data.data.token?.queueId) {
        joinQueueRoom(response.data.data.token.queueId);
      }
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Failed to load token status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeSocket();
    loadStatus();

    const unsubscribe = onTokenUpdated((data) => {
      if (!token?.queueId || String(data.queueId) === String(token.queueId)) {
        loadStatus();
        if (data.message) toast.success(data.message);
      }
    });

    return unsubscribe;
  }, [entryId, token?.queueId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: { xs: 3, sm: 6 }, mb: 4, px: { xs: 2, sm: 3 } }}>
      {error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <>
          <LiveQueueDashboard token={token} status={status} />
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadStatus}
            sx={{ mt: 3 }}
          >
            Refresh
          </Button>
        </>
      )}
    </Container>
  );
};

export default TokenStatus;
