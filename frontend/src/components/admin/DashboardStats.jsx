import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import QueueIcon from '@mui/icons-material/Queue';

const DashboardStats = ({ stats }) => {
  const statCards = [
    {
      title: 'Total Queues',
      value: stats.totalQueues || 0,
      icon: <QueueIcon sx={{ fontSize: 40 }} />,
      color: '#2196f3',
    },
    {
      title: 'Total Waiting',
      value: stats.totalWaiting || 0,
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: '#ff9800',
    },
    {
      title: 'Currently Called',
      value: stats.totalCalled || 0,
      icon: <AccessTimeIcon sx={{ fontSize: 40 }} />,
      color: '#9c27b0',
    },
    {
      title: 'Served Today',
      value: stats.totalCompletedToday || 0,
      icon: <CheckCircleIcon sx={{ fontSize: 40 }} />,
      color: '#4caf50',
    },
  ];

  return (
    <Grid container spacing={3}>
      {statCards.map((stat, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Paper
            sx={{
              p: { xs: 2, sm: 3 },
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              borderLeft: `4px solid ${stat.color}`,
            }}
          >
            <Box sx={{ color: stat.color }}>{stat.icon}</Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                {stat.title}
              </Typography>
              <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: '1.8rem', sm: '2.125rem' } }}>
                {stat.value}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export default DashboardStats;
