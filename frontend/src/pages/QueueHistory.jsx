import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Box,
} from '@mui/material';
import { userAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const QueueHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await userAPI.getHistory();
      setHistory(response.data.data);
    } catch (error) {
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateWaitTime = (entry) => {
    if (entry.joinedAt && entry.calledAt) {
      const waitTime = (new Date(entry.calledAt) - new Date(entry.joinedAt)) / (1000 * 60);
      return Math.round(waitTime);
    }
    return entry.estimatedWaitTime || 0;
  };

  if (loading) {
    return <LoadingSpinner message="Loading history..." />;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Queue History
      </Typography>

      {history.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No queue history found
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Queue</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Position</TableCell>
                <TableCell>Wait Time</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {history.map((entry) => (
                <TableRow key={entry._id}>
                  <TableCell>{entry.queue?.name || 'N/A'}</TableCell>
                  <TableCell>{formatDate(entry.joinedAt)}</TableCell>
                  <TableCell>
                    <Chip
                      label={entry.status}
                      color={
                        entry.status === 'completed'
                          ? 'success'
                          : entry.status === 'cancelled'
                          ? 'error'
                          : 'default'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>#{entry.position}</TableCell>
                  <TableCell>{calculateWaitTime(entry)} min</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default QueueHistory;
