import React from 'react';
import { Box, Typography, Chip, Tooltip } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

/**
 * SmartWaitTimeDisplay Component
 * Displays predicted wait time with color-coded indicators and confidence levels
 * 
 * @param {Object} props
 * @param {Number} props.waitTime - Predicted wait time in minutes
 * @param {String} props.confidence - Confidence level: 'high', 'medium', 'low'
 * @param {Boolean} props.showDetails - Show detailed breakdown
 */
const SmartWaitTimeDisplay = ({ waitTime, confidence = 'medium', showDetails = false }) => {
  // Determine color based on wait time
  const getColor = () => {
    if (waitTime === 0) return 'success';
    if (waitTime < 10) return 'success';
    if (waitTime <= 20) return 'warning';
    return 'error';
  };

  // Get confidence badge color
  const getConfidenceColor = () => {
    switch (confidence) {
      case 'high':
        return 'success';
      case 'medium':
        return 'warning';
      case 'low':
        return 'default';
      default:
        return 'default';
    }
  };

  // Format wait time message
  const getMessage = () => {
    if (waitTime === 0) return 'No waiting time';
    if (waitTime === 1) return '~1 minute';
    return `~${waitTime} minutes`;
  };

  // Get emoji indicator
  const getEmoji = () => {
    if (waitTime === 0) return '✅';
    if (waitTime < 10) return '🟢';
    if (waitTime <= 20) return '🟡';
    return '🔴';
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        <Typography variant="body2" color="text.secondary">
          Estimated wait time:
        </Typography>
        
        <Chip
          icon={<AccessTimeIcon />}
          label={getMessage()}
          color={getColor()}
          size="small"
          sx={{ fontWeight: 'bold' }}
        />

        {/* Confidence Badge */}
        {confidence && (
          <Tooltip
            title={`Prediction confidence: ${confidence} (based on historical data)`}
          >
            <Chip
              icon={<TrendingUpIcon />}
              label={`${confidence} confidence`}
              color={getConfidenceColor()}
              variant="outlined"
              size="small"
              sx={{ fontSize: '0.7rem' }}
            />
          </Tooltip>
        )}
      </Box>

      {/* Detailed Breakdown (optional) */}
      {showDetails && (
        <Box sx={{ mt: 1.5, p: 1.5, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary" display="block">
            {getEmoji()} Smart Prediction powered by AI
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
            • Based on recent service times
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            • Adjusted for current queue length
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            • Considers peak hours & trends
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default SmartWaitTimeDisplay;
