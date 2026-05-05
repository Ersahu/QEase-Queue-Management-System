import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import CallIcon from '@mui/icons-material/Call';
import AdminQRDisplay from './AdminQRDisplay';

const QueueManager = ({ queue, onCallNext, onPause, onResume, adminId }) => {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 1,
            mb: 2,
          }}
        >
          <Typography variant="h6">{queue.name}</Typography>
          <Chip
            label={queue.isPaused ? 'Paused' : 'Active'}
            color={queue.isPaused ? 'warning' : 'success'}
          />
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(3, 1fr)', sm: 'repeat(3, max-content)' }, gap: { xs: 1.5, sm: 3 }, mb: 2 }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" color="text.secondary">
              Waiting
            </Typography>
            <Typography variant="h4" sx={{ fontSize: { xs: '1.8rem', sm: '2.125rem' } }}>{queue.waitingCount}</Typography>
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" color="text.secondary">
              Called
            </Typography>
            <Typography variant="h4" sx={{ fontSize: { xs: '1.8rem', sm: '2.125rem' } }}>{queue.calledCount}</Typography>
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" color="text.secondary">
              Served Today
            </Typography>
            <Typography variant="h4" sx={{ fontSize: { xs: '1.8rem', sm: '2.125rem' } }}>{queue.completedToday}</Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexDirection: { xs: 'column', sm: 'row' } }}>
          <Button
            variant="contained"
            startIcon={<CallIcon />}
            onClick={() => onCallNext(queue.queueId)}
            disabled={queue.isPaused || queue.waitingCount === 0}
            fullWidth
          >
            Call Next
          </Button>

          {queue.isPaused ? (
            <Button
              variant="outlined"
              startIcon={<PlayArrowIcon />}
              onClick={() => onResume(queue.queueId)}
              color="success"
              fullWidth
            >
              Resume
            </Button>
          ) : (
            <Button
              variant="outlined"
              startIcon={<PauseIcon />}
              onClick={() => onPause(queue.queueId)}
              color="warning"
              fullWidth
            >
              Pause
            </Button>
          )}
        </Box>

        <AdminQRDisplay queue={queue} adminId={adminId} />
      </CardContent>
    </Card>
  );
};

export default QueueManager;
