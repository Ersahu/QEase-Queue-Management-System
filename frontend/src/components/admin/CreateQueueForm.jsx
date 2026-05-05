import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';

const SERVICE_TYPES = [
  { value: 'clinic', label: '🏥 Medical Clinic' },
  { value: 'salon', label: '💇 Hair Salon' },
  { value: 'bank', label: '🏦 Bank' },
  { value: 'restaurant', label: '🍽️ Restaurant' },
  { value: 'retail', label: '🛍️ Retail Store' },
  { value: 'government', label: '🏛️ Government Office' },
  { value: 'other', label: '📋 Other Service' },
];

const CreateQueueForm = ({ open, onCreate, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    serviceType: 'clinic',
    avgServiceTime: 10,
    latitude: '',
    longitude: '',
    address: '',
    city: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'avgServiceTime' ? parseInt(value) || 10 : value,
    });
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      return;
    }
    onCreate({
      ...formData,
      location:
        formData.latitude && formData.longitude
          ? {
              coordinates: [Number(formData.longitude), Number(formData.latitude)],
              address: formData.address,
              city: formData.city,
            }
          : undefined,
    });
    setFormData({
      name: '',
      description: '',
      serviceType: 'clinic',
      avgServiceTime: 10,
      latitude: '',
      longitude: '',
      address: '',
      city: '',
    });
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      serviceType: 'clinic',
      avgServiceTime: 10,
      latitude: '',
      longitude: '',
      address: '',
      city: '',
    });
    onCancel();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Queue</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Queue Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            margin="normal"
            required
            placeholder="e.g., General Consultation, VIP Service"
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Service Type</InputLabel>
            <Select
              name="serviceType"
              value={formData.serviceType}
              onChange={handleChange}
              label="Service Type"
            >
              {SERVICE_TYPES.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            margin="normal"
            multiline
            rows={3}
            placeholder="Brief description of this queue service"
          />

          <TextField
            fullWidth
            label="Average Service Time (minutes)"
            name="avgServiceTime"
            type="number"
            value={formData.avgServiceTime}
            onChange={handleChange}
            margin="normal"
            InputProps={{ inputProps: { min: 1, max: 120 } }}
            helperText="Estimated time to serve each customer"
          />

          <TextField
            fullWidth
            label="Address (optional)"
            name="address"
            value={formData.address}
            onChange={handleChange}
            margin="normal"
            placeholder="Street or landmark"
          />

          <TextField
            fullWidth
            label="City (optional)"
            name="city"
            value={formData.city}
            onChange={handleChange}
            margin="normal"
          />

          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField
              fullWidth
              label="Latitude (optional)"
              name="latitude"
              type="number"
              value={formData.latitude}
              onChange={handleChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Longitude (optional)"
              name="longitude"
              type="number"
              value={formData.longitude}
              onChange={handleChange}
              margin="normal"
            />
          </Box>

          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            💡 This helps calculate accurate wait times for customers.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !formData.name.trim()}
        >
          {loading ? 'Creating...' : 'Create Queue'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateQueueForm;
