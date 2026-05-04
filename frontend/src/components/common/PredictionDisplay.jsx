import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import InfoIcon from '@mui/icons-material/Info';

const PredictionDisplay = ({ prediction, sx = {} }) => {
  if (!prediction || !prediction.success) return null;

  const getConfidenceColor = (confidence) => {
    switch (confidence) {
      case 'high':
        return 'success';
      case 'medium':
        return 'warning';
      case 'low':
        return 'error';
      default:
        return 'default';
    }
  };

  const getConfidenceLabel = (confidence) => {
    switch (confidence) {
      case 'high':
        return 'High Confidence';
      case 'medium':
        return 'Medium Confidence';
      case 'low':
        return 'Low Confidence';
      default:
        return 'Unknown';
    }
  };

  const formatTime = (minutes) => {
    if (minutes < 60) {
      return `${minutes} mins`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <Paper elevation={2} sx={{ p: 2, ...sx }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccessTimeIcon color="primary" />
          <Typography variant="h6">AI Wait Time Prediction</Typography>
        </Box>
        <Tooltip title={`Based on ${prediction.dataPoints || 0} historical data points`}>
          <Chip
            icon={<TrendingUpIcon />}
            label={prediction.method === 'ml' ? 'ML-Powered' : 'Rule-Based'}
            color="primary"
            size="small"
          />
        </Tooltip>
      </Box>

      <Box sx={{ textAlign: 'center', mb: 2 }}>
        <Typography variant="h3" color="primary.main" sx={{ fontWeight: 'bold' }}>
          {formatTime(prediction.predictedWaitTime)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Estimated Wait Time
        </Typography>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="caption" color="text.secondary">
            Prediction Confidence
          </Typography>
          <Typography variant="caption" fontWeight="bold">
            {prediction.confidence}
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={
            prediction.confidence === 'high' ? 90 : prediction.confidence === 'medium' ? 60 : 30
          }
          color={getConfidenceColor(prediction.confidence)}
          sx={{ height: 8, borderRadius: 1 }}
        />
      </Box>

      <Chip
        label={getConfidenceLabel(prediction.confidence)}
        color={getConfidenceColor(prediction.confidence)}
        size="small"
        sx={{ mb: 2 }}
      />

      {prediction.factors && (
        <Box sx={{ mt: 2, p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            <InfoIcon sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
            Factors considered:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {prediction.factors.peakHourAdjustment && (
              <Chip label="Peak Hours" size="small" color="warning" />
            )}
            {prediction.factors.weekendAdjustment && (
              <Chip label="Weekend" size="small" color="warning" />
            )}
            {prediction.factors.queueLengthFactor > 1 && (
              <Chip label="Long Queue" size="small" color="error" />
            )}
            <Chip label={`Avg: ${prediction.factors.avgServiceTime || prediction.avgServiceTime}min`} size="small" />
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default PredictionDisplay;
