import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';

const JoinQueueForm = ({ open, queueName, onConfirm, onCancel, loading }) => {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle>Join Queue</DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Are you sure you want to join the queue:
        </Typography>
        <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
          {queueName}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          You will receive a notification when it's your turn. Estimated wait
          time will be calculated based on current queue length.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          disabled={loading}
        >
          {loading ? 'Joining...' : 'Confirm Join'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default JoinQueueForm;
