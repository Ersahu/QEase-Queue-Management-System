import React, { useState } from 'react';
import { Container, Stack } from '@mui/material';
import QueueJoinForm from '../components/token/QueueJoinForm';
import TokenDisplay from '../components/token/TokenDisplay';

const SelfServiceJoin = () => {
  const [tokenData, setTokenData] = useState(null);

  return (
    <Container maxWidth="sm" sx={{ mt: { xs: 3, sm: 6 }, mb: 4, px: { xs: 2, sm: 3 } }}>
      <Stack spacing={3}>
        <QueueJoinForm onTokenCreated={setTokenData} />
        <TokenDisplay tokenData={tokenData} />
      </Stack>
    </Container>
  );
};

export default SelfServiceJoin;
