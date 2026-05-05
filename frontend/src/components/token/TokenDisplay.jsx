import React from 'react';
import { Alert, Box, Button, Paper, Stack, Typography } from '@mui/material';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import { useNavigate } from 'react-router-dom';

const TokenDisplay = ({ tokenData }) => {
  const navigate = useNavigate();
  const token = tokenData?.token || tokenData;

  if (!token) return null;

  return (
    <Paper sx={{ p: { xs: 2.5, sm: 4 }, borderRadius: 2, textAlign: 'center' }}>
      <Stack spacing={3} alignItems="center">
        <ConfirmationNumberIcon color="primary" sx={{ fontSize: 56 }} />
        <Box>
          <Typography variant="overline" color="text.secondary">
            Your Token
          </Typography>
          <Typography variant="h2" fontWeight="bold" sx={{ letterSpacing: 0 }}>
            {token.tokenNumber}
          </Typography>
        </Box>

        <Alert severity="success" sx={{ width: '100%', textAlign: 'left' }}>
          Queue: {token.queueName}<br />
          Position: #{token.position}<br />
          Estimated wait: {token.estimatedWaitTime} min
        </Alert>

        <Button
          variant="contained"
          size="large"
          onClick={() => navigate(`/token/${token.id}`)}
          sx={{ py: 1.5, px: 4 }}
        >
          Track My Queue
        </Button>
      </Stack>
    </Paper>
  );
};

export default TokenDisplay;
