import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import QrCodeIcon from '@mui/icons-material/QrCode';
import DownloadIcon from '@mui/icons-material/Download';
import CloseIcon from '@mui/icons-material/Close';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import { adminAPI } from '../../services/api';

/**
 * AdminQRDisplay Component
 * Displays QR code for customers to scan and check-in
 */
const AdminQRDisplay = ({ queue, adminId }) => {
  const [open, setOpen] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (open && queue) {
      generateAdminQR();
    }
  }, [open, queue]);

  const generateAdminQR = async () => {
    const queueId = queue?.queueId || queue?._id;

    if (!queueId) {
      const message = 'Queue ID is missing. Refresh the dashboard and try again.';
      setErrorMessage(message);
      toast.error(message);
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');
      setQrData(null);

      if (queue?.qrCheckinData) {
        setQrData(queue.qrCheckinData);
        return;
      }

      const response = await adminAPI.generateQueueJoinQR(queueId);
      setQrData(response.data.data.qrData);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to generate secure QR link';
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const svg = document.getElementById(`admin-qr-${queue.queueId || queue._id}`);
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');

      const link = document.createElement('a');
      link.download = `qease-${queue.name}-checkin-qr.png`;
      link.href = pngFile;
      link.click();
      toast.success('QR code downloaded');
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>${queue.name} - Check-in QR Code</title>
          <style>
            body { 
              display: flex; 
              justify-content: center; 
              align-items: center; 
              min-height: 100vh; 
              margin: 0; 
              font-family: Arial, sans-serif;
            }
            .container { text-align: center; }
            h1 { color: #667eea; margin-bottom: 10px; }
            p { color: #666; margin-bottom: 30px; }
            .qr-code { margin: 20px 0; }
            .instructions { 
              margin-top: 30px; 
              padding: 20px; 
              background: #f5f5f5; 
              border-radius: 8px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>${queue.name}</h1>
            <p>Scan this QR code to check-in for your appointment</p>
            <div class="qr-code">
              ${document.getElementById(`admin-qr-${queue.queueId || queue._id}`).outerHTML}
            </div>
            <div class="instructions">
              <h3>How to Check-in:</h3>
              <ol style="text-align: left;">
                <li>Login to QEase Customer Portal</li>
                <li>Navigate to QR Scanner</li>
                <li>Scan this QR code</li>
                <li>Your check-in will be confirmed</li>
              </ol>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<QrCodeIcon />}
        onClick={() => setOpen(true)}
        sx={{ mt: 1 }}
      >
        Show Check-in QR
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              {queue.name} - Customer Check-in QR Code
            </Typography>
            <Button onClick={() => setOpen(false)} startIcon={<CloseIcon />}>
              Close
            </Button>
          </Box>
        </DialogTitle>

        <DialogContent>
          {errorMessage ? (
            <Box sx={{ py: 3 }}>
              <Alert severity="error" sx={{ mb: 2 }}>
                {errorMessage}
              </Alert>
              <Button variant="contained" onClick={generateAdminQR} disabled={loading}>
                Retry QR Generation
              </Button>
            </Box>
          ) : qrData ? (
            <Box sx={{ textAlign: 'center' }}>
              <Alert severity="info" sx={{ mb: 3 }}>
                Display or print this QR code at your building entrance. Customers scan it from their QR Scanner page when they arrive.
              </Alert>

              <Paper
                elevation={3}
                sx={{
                  p: 4,
                  mb: 3,
                  display: 'inline-block',
                  bgcolor: 'white',
                }}
              >
                <QRCodeSVG
                  id={`admin-qr-${queue.queueId || queue._id}`}
                  value={qrData}
                  size={300}
                  level="H"
                  includeMargin={true}
                />
              </Paper>

              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Queue: {queue.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Customers already in this queue scan this QR to mark themselves arrived.
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownload}
                >
                  Download QR
                </Button>
                <Button
                  variant="outlined"
                  onClick={handlePrint}
                >
                  Print QR
                </Button>
              </Box>
            </Box>
          ) : loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : null}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AdminQRDisplay;
