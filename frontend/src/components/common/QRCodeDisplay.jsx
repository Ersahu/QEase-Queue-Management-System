import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import QrCodeIcon from '@mui/icons-material/QrCode';
import DownloadIcon from '@mui/icons-material/Download';
import { QRCodeSVG } from 'qrcode.react';
import { aiAPI } from '../../services/api';
import toast from 'react-hot-toast';

const QRCodeDisplay = ({ entryId, open, onClose }) => {
  const [qrData, setQrData] = useState(null);
  const [qrImage, setQrImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open && entryId) {
      fetchQRCode();
    }
  }, [open, entryId]);

  const fetchQRCode = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await aiAPI.generateQR({ entryId });

      if (response.data.success) {
        setQrData(response.data.data.qrData);
        setQrImage(response.data.data.qrImage);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError('Failed to generate QR code');
      toast.error('Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!qrImage) return;

    const link = document.createElement('a');
    link.download = `qease-qr-${entryId}.png`;
    link.href = qrImage;
    link.click();
    toast.success('QR code downloaded');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <QrCodeIcon />
          <Typography>Your Queue Check-In QR Code</Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : qrImage ? (
          <Box sx={{ textAlign: 'center' }}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                mb: 2,
                display: 'inline-block',
                bgcolor: 'white',
              }}
            >
              <QRCodeSVG
                value={qrData}
                size={256}
                level="H"
                includeMargin={true}
              />
            </Paper>

            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                Show this QR code at the venue for quick check-in
              </Typography>
            </Alert>

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
              QR Data: {qrData}
            </Typography>
          </Box>
        ) : (
          <Alert severity="warning">No QR code available</Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        {qrImage && (
          <Button
            onClick={handleDownload}
            startIcon={<DownloadIcon />}
            variant="contained"
          >
            Download QR
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default QRCodeDisplay;
