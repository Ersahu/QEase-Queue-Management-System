import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { queueAPI, tokenAPI } from '../../services/api';
import toast from 'react-hot-toast';

const SERVICE_TYPES = ['clinic', 'salon', 'bank', 'restaurant', 'retail', 'government', 'other'];

const QueueJoinForm = ({ onTokenCreated }) => {
  const [queues, setQueues] = useState([]);
  const [form, setForm] = useState({
    queueId: '',
    name: '',
    phone: '',
    serviceType: 'other',
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadQueues = async () => {
      setLoading(true);
      try {
        const response = await queueAPI.getAll();
        setQueues(response.data.data || []);
        const firstQueue = response.data.data?.[0];
        if (firstQueue) {
          setForm((current) => ({
            ...current,
            queueId: firstQueue._id,
            serviceType: firstQueue.serviceType || 'other',
          }));
        }
      } catch (error) {
        toast.error('Failed to load queues');
      } finally {
        setLoading(false);
      }
    };

    loadQueues();
  }, []);

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const response = await tokenAPI.create(form);
      toast.success(response.data.message);
      onTokenCreated(response.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate token');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Paper sx={{ p: { xs: 2.5, sm: 4 }, borderRadius: 2 }}>
      <Stack spacing={3} component="form" onSubmit={handleSubmit}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Self-Service Sign-In
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Enter your details to receive a queue token.
          </Typography>
        </Box>

        {queues.length === 0 && !loading && (
          <Alert severity="info">No active queues are available right now.</Alert>
        )}

        <FormControl fullWidth required>
          <InputLabel>Queue</InputLabel>
          <Select value={form.queueId} label="Queue" onChange={handleChange('queueId')}>
            {queues.map((queue) => (
              <MenuItem key={queue._id} value={queue._id}>
                {queue.name} - {queue.waitingCount || 0} waiting
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Full name"
          value={form.name}
          onChange={handleChange('name')}
          required
          inputProps={{ minLength: 2 }}
          fullWidth
        />

        <TextField
          label="Phone number"
          value={form.phone}
          onChange={handleChange('phone')}
          required
          inputMode="tel"
          fullWidth
        />

        <FormControl fullWidth>
          <InputLabel>Service type</InputLabel>
          <Select value={form.serviceType} label="Service type" onChange={handleChange('serviceType')}>
            {SERVICE_TYPES.map((type) => (
              <MenuItem key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          type="submit"
          variant="contained"
          size="large"
          startIcon={<PersonAddIcon />}
          disabled={submitting || loading || !form.queueId}
          sx={{ py: 1.5, fontSize: '1.05rem' }}
        >
          {submitting ? 'Generating Token...' : 'Generate Token'}
        </Button>
      </Stack>
    </Paper>
  );
};

export default QueueJoinForm;
