import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Typography,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const CustomerList = ({ customers, onComplete, onRemove }) => {
  if (!customers || customers.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No customers in queue
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
      <Table sx={{ minWidth: 760 }}>
        <TableHead>
          <TableRow>
            <TableCell>Position</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Phone</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Wait Time</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {customers.map((customer) => (
            <TableRow
              key={customer._id}
              sx={{
                bgcolor: customer.status === 'called' ? 'action.selected' : 'inherit',
              }}
            >
              <TableCell>
                <Typography variant="h6" fontWeight="bold">
                  #{customer.position}
                </Typography>
              </TableCell>
              <TableCell>{customer.user?.name || 'N/A'}</TableCell>
              <TableCell>{customer.user?.email || 'N/A'}</TableCell>
              <TableCell>{customer.user?.phone || 'N/A'}</TableCell>
              <TableCell>
                <Chip
                  label={customer.status}
                  color={customer.status === 'called' ? 'success' : 'primary'}
                  size="small"
                />
              </TableCell>
              <TableCell>
                {customer.estimatedWaitTime} min
              </TableCell>
              <TableCell align="right">
                {customer.status === 'called' && (
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<CheckCircleIcon />}
                    onClick={() => onComplete(customer.queue, customer._id)}
                    color="success"
                  >
                    Complete
                  </Button>
                )}
                {customer.status === 'waiting' && (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={() => onRemove(customer.queue, customer._id)}
                    color="error"
                  >
                    Remove
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CustomerList;
