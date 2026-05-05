import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Box, Alert, Button } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import QrCodeIcon from '@mui/icons-material/QrCode';
import { userAPI, aiAPI } from '../services/api';
import {
  onQueueUpdated,
  onCustomerCalled,
  joinQueueRoom,
  onNearTurn,
  onPositionUpdated,
  onQueuePausedForUser,
  onQueueResumedForUser,
} from '../services/socketService';
import QueueCard from '../components/user/QueueCard';
import QueuePosition from '../components/user/QueuePosition';
import JoinQueueForm from '../components/user/JoinQueueForm';
import NearbyQueues from '../components/user/NearbyQueues';
import PredictionDisplay from '../components/common/PredictionDisplay';
import QRCodeDisplay from '../components/common/QRCodeDisplay';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const UserDashboard = () => {
  const [queues, setQueues] = useState([]);
  const [myPosition, setMyPosition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joinDialog, setJoinDialog] = useState({ open: false, queueId: null, queueName: '' });
  const [joining, setJoining] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);

  useEffect(() => {
    fetchData();
    setupSocketListeners();
  }, []);

  const fetchData = async () => {
    try {
      const [queuesRes, positionRes] = await Promise.all([
        userAPI.getQueues(),
        userAPI.getMyPosition(),
      ]);

      setQueues(queuesRes.data.data);
      if (positionRes.data.data) {
        setMyPosition(positionRes.data.data);
        joinQueueRoom(positionRes.data.data.queue._id);
        
        // Fetch AI prediction
        const predRes = await aiAPI.predictWaitTime({
          queueId: positionRes.data.data.queue._id,
        });
        if (predRes.data.success) {
          setPrediction(predRes.data.data);
        }
      }
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const setupSocketListeners = () => {
    onQueueUpdated((data) => {
      if (myPosition && data.queueId === myPosition.queue._id) {
        // Refresh position data
        userAPI.getMyPosition().then((res) => {
          if (res.data.data) {
            setMyPosition(res.data.data);
          } else {
            setMyPosition(null);
            toast.success('You have been served!');
          }
        });
      }
    });

    onCustomerCalled((data) => {
      toast.success(data.message, { duration: 5000 });
    });

    onNearTurn((data) => {
      toast.success(data.message, { duration: 5000 });
    });

    onPositionUpdated((data) => {
      toast(data.message, { icon: '🔄' });
    });

    onQueuePausedForUser((data) => {
      toast.error(data.message, { duration: 5000 });
    });

    onQueueResumedForUser((data) => {
      toast.success(data.message, { duration: 5000 });
    });
  };

  const handleJoinClick = (queueId, queueName) => {
    setJoinDialog({ open: true, queueId, queueName });
  };

  const handleJoinConfirm = async () => {
    setJoining(true);
    try {
      const response = await userAPI.joinQueue(joinDialog.queueId);
      toast.success(response.data.message);
      setJoinDialog({ open: false, queueId: null, queueName: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to join queue');
    } finally {
      setJoining(false);
    }
  };

  const handleLeaveQueue = async () => {
    if (!myPosition) return;

    try {
      await userAPI.leaveQueue(myPosition.queue._id);
      toast.success('Left queue successfully');
      setMyPosition(null);
    } catch (error) {
      toast.error('Failed to leave queue');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading queues..." />;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 3, sm: 4 }, mb: 4, px: { xs: 2, sm: 3 } }}>
      {/* Current Position Display */}
      {myPosition && (
        <Box sx={{ mb: 4 }}>
          <QueuePosition
            position={myPosition.position}
            estimatedWaitTime={myPosition.estimatedWaitTime}
            queueName={myPosition.queue.name}
            status={myPosition.status}
          />
          
          {/* AI Prediction */}
          {prediction && (
            <Box sx={{ mt: 3 }}>
              <PredictionDisplay prediction={prediction} />
            </Box>
          )}

          {myPosition.status === 'waiting' && (
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Alert severity="info" sx={{ mb: 2 }}>
                You are currently in queue. You will be notified when it's your turn.
              </Alert>
              <Box
                sx={{
                  display: 'flex',
                  gap: 1.5,
                  justifyContent: 'center',
                  mb: 2,
                  flexDirection: { xs: 'column', sm: 'row' },
                }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setQrDialogOpen(true)}
                  startIcon={<QrCodeIcon />}
                >
                  Show QR Code
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleLeaveQueue}
                  startIcon={<span>🚪</span>}
                >
                  Withdraw from Queue
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      )}

      {/* Available Queues */}
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Available Queues
      </Typography>

      <NearbyQueues onJoin={handleJoinClick} />

      {queues.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Alert severity="info" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
            <Typography variant="h6" gutterBottom>
              No Active Queues Right Now
            </Typography>
            <Typography variant="body2">
              There are currently no queues available. Please check back later or contact the service provider.
            </Typography>
          </Alert>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchData}
            sx={{ mt: 2 }}
          >
            Refresh Queues
          </Button>
        </Box>
      ) : (
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          {queues.map((queue) => (
            <Grid item xs={12} sm={6} md={4} key={queue._id}>
              <QueueCard queue={queue} onJoin={() => handleJoinClick(queue._id, queue.name)} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Join Queue Dialog */}
      <JoinQueueForm
        open={joinDialog.open}
        queueName={joinDialog.queueName}
        onConfirm={handleJoinConfirm}
        onCancel={() => setJoinDialog({ open: false, queueId: null, queueName: '' })}
        loading={joining}
      />

      {/* QR Code Dialog */}
      {myPosition && (
        <QRCodeDisplay
          entryId={myPosition._id}
          open={qrDialogOpen}
          onClose={() => setQrDialogOpen(false)}
        />
      )}
    </Container>
  );
};

export default UserDashboard;
