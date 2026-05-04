import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import PersonIcon from '@mui/icons-material/Person';
import QueueIcon from '@mui/icons-material/Queue';
import { Html5Qrcode } from 'html5-qrcode';
import { aiAPI } from '../services/api';
import toast from 'react-hot-toast';

const QRScanner = () => {
  const [scanning, setScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [qrType, setQrType] = useState(null); // 'ADMIN_QR' or 'CUSTOMER_QR'

  useEffect(() => {
    let scanner = null;

    if (scanning) {
      scanner = new Html5Qrcode('qr-reader');

      scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          // QR code detected
          setScanning(false);
          scanner.stop();
          await handleScan(decodedText);
        },
        (errorMessage) => {
          // Scan error - can be ignored
        }
      ).catch((err) => {
        console.error('Error starting scanner:', err);
        setError('Failed to start camera. Please use manual input.');
        setScanning(false);
      });
    }

    return () => {
      if (scanner && scanning) {
        scanner.stop().catch(console.error);
      }
    };
  }, [scanning]);

  const handleScan = async (qrData) => {
    setLoading(true);
    setError(null);

    try {
      // Detect QR type
      let decodedData = null;
      try {
        decodedData = JSON.parse(atob(qrData));
        setQrType(decodedData.type);
      } catch (e) {
        setQrType('CUSTOMER_QR');
      }

      let response;
      
      // Handle based on QR type
      if (qrType === 'ADMIN_QR' || (decodedData && decodedData.type === 'ADMIN_QR')) {
        // Customer scanning admin's QR to check-in
        response = await aiAPI.checkinAdminQR({ qrData });
      } else {
        // Admin scanning customer's QR (existing functionality)
        response = await aiAPI.scanQR({ qrData });
      }

      if (response.data.success) {
        setResult({
          success: true,
          message: response.data.message,
          data: response.data.data,
          type: qrType || 'CUSTOMER_QR',
        });
        toast.success(response.data.message);
      } else {
        setResult({
          success: false,
          message: response.data.message,
          type: qrType || 'CUSTOMER_QR',
        });
        toast.error(response.data.message);
      }
    } catch (err) {
      console.error('QR scan error:', err);
      setError('Failed to process QR code');
      toast.error('Failed to process QR code');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    await handleScan(manualCode);
  };

  const handleStartScan = () => {
    setScanning(true);
    setResult(null);
    setError(null);
  };

  const handleStopScan = () => {
    setScanning(false);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        <QrCodeScannerIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        QR Code Check-In
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Scan QR Code
        </Typography>

        {!scanning ? (
          <Button
            variant="contained"
            onClick={handleStartScan}
            startIcon={<QrCodeScannerIcon />}
            sx={{ mb: 2 }}
          >
            Start Camera Scanner
          </Button>
        ) : (
          <Box>
            <div id="qr-reader" style={{ width: '100%', maxWidth: 500 }} />
            <Button
              variant="outlined"
              color="error"
              onClick={handleStopScan}
              sx={{ mt: 2 }}
            >
              Stop Scanner
            </Button>
          </Box>
        )}

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <CircularProgress />
          </Box>
        )}
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Or Enter QR Code Manually
        </Typography>

        <form onSubmit={handleManualSubmit}>
          <TextField
            fullWidth
            label="QR Code Data"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder="QEase:entryId:..."
            sx={{ mb: 2 }}
          />
          <Button type="submit" variant="contained" disabled={!manualCode.trim()}>
            Validate & Check-In
          </Button>
        </form>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {result && (
        <Paper
          sx={{
            p: 3,
            bgcolor: result.success ? 'success.light' : 'error.light',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            {result.success ? (
              <CheckCircleIcon color="success" sx={{ fontSize: 40 }} />
            ) : (
              <ErrorIcon color="error" sx={{ fontSize: 40 }} />
            )}
            <Typography variant="h6">{result.message}</Typography>
          </Box>

          {result.type === 'ADMIN_QR' && result.success && result.data ? (
            // Customer checked in via admin QR
            <Box>
              <Chip
                label="Check-in Successful"
                color="success"
                sx={{ mb: 2 }}
              />
              
              <Typography variant="h6" gutterBottom>
                Your Details:
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography><strong>Name:</strong> {result.data.entry.user.name}</Typography>
                <Typography><strong>Email:</strong> {result.data.entry.user.email}</Typography>
                {result.data.entry.user.phone && (
                  <Typography><strong>Phone:</strong> {result.data.entry.user.phone}</Typography>
                )}
              </Box>

              <Typography variant="h6" gutterBottom>
                Queue Information:
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography><strong>Queue:</strong> {result.data.entry.queue}</Typography>
                <Typography><strong>Position:</strong> #{result.data.entry.position}</Typography>
                <Typography><strong>Status:</strong> {result.data.entry.status}</Typography>
                <Typography>
                  <strong>Checked In At:</strong> {new Date(result.data.entry.checkedInAt).toLocaleString()}
                </Typography>
              </Box>

              <Alert severity="success">
                The admin has been notified of your arrival. Please wait for your turn.
              </Alert>
            </Box>
          ) : result.success && result.data && result.data.entry ? (
            // Admin scanned customer QR (original functionality)
            <Box>
              <Typography>Queue: {result.data.entry.queue}</Typography>
              <Typography>Position: #{result.data.entry.position}</Typography>
              <Typography>User: {result.data.entry.user}</Typography>
              <Typography>
                Checked In At: {new Date(result.data.entry.checkedInAt).toLocaleString()}
              </Typography>
            </Box>
          ) : null}
        </Paper>
      )}
    </Container>
  );
};

export default QRScanner;
