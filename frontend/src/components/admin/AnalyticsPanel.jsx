import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from 'recharts';
import { adminAPI } from '../../services/api';

const RANGE_OPTIONS = [7, 14, 30];

const AnalyticsPanel = ({ queues = [] }) => {
  const [days, setDays] = useState(7);
  const [selectedQueueId, setSelectedQueueId] = useState('all');
  const [analytics, setAnalytics] = useState({
    summary: { totalUsersServed: 0, averageWaitTimeMinutes: 0, activeQueues: 0 },
    peakHours: [],
    queueTrends: [],
    queueBreakdown: [],
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      const params = { days };
      if (selectedQueueId !== 'all') {
        params.queueId = selectedQueueId;
      }

      const response = await adminAPI.getAnalytics(params);
      setAnalytics(response.data.data);
    };

    fetchAnalytics().catch((error) => {
      console.error('Analytics fetch error:', error);
    });
  }, [days, selectedQueueId]);

  const topPeakHour = useMemo(() => analytics.peakHours[0], [analytics.peakHours]);

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <Typography variant="subtitle2" color="text.secondary">
              Users Served
            </Typography>
            <Typography variant="h4">{analytics.summary.totalUsersServed}</Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="subtitle2" color="text.secondary">
              Avg Wait Time
            </Typography>
            <Typography variant="h4">{analytics.summary.averageWaitTimeMinutes} min</Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="subtitle2" color="text.secondary">
              Active Queues
            </Typography>
            <Typography variant="h4">{analytics.summary.activeQueues}</Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="subtitle2" color="text.secondary">
              Peak Hour
            </Typography>
            <Typography variant="h4">{topPeakHour?.hour || '-'}</Typography>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Range</InputLabel>
          <Select value={days} label="Range" onChange={(event) => setDays(event.target.value)}>
            {RANGE_OPTIONS.map((option) => (
              <MenuItem key={option} value={option}>
                Last {option} days
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Queue</InputLabel>
          <Select
            value={selectedQueueId}
            label="Queue"
            onChange={(event) => setSelectedQueueId(event.target.value)}
          >
            <MenuItem value="all">All queues</MenuItem>
            {queues.map((queue) => (
              <MenuItem key={queue.queueId} value={queue.queueId}>
                {queue.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: 320 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Queue Trends
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={analytics.queueTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line dataKey="served" stroke="#1976d2" strokeWidth={2} />
                <Line dataKey="averageWaitTimeMinutes" stroke="#ff9800" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: 320 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Peak Hours
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={analytics.peakHours}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="servedCount" fill="#2e7d32" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsPanel;
