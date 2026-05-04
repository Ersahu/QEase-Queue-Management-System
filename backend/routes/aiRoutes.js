const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const aiController = require('../controllers/aiController');

// All routes require authentication
router.use(protect);

// Prediction endpoints
router.post('/predict-wait-time', aiController.getWaitTimePrediction);

// Notification endpoints
router.post('/notify-user', aiController.notifyUser);

// QR Code endpoints
router.post('/generate-qr', aiController.generateQR);
router.get('/my-qr', aiController.getMyQR);
router.post('/scan-qr', aiController.scanQR);
router.post('/checkin-admin-qr', aiController.checkinAdminQR);

// Chatbot endpoints
router.post('/chatbot', aiController.chatbotMessage);
router.get('/chat-history', aiController.getChatHistory);

// Recommendation endpoints
router.get('/recommend-time/:queueId', aiController.recommendTime);

// Location endpoints
router.post('/location', aiController.updateLocation);

// Admin-only routes
router.post('/train-model/:queueId', authorize('admin'), aiController.trainMLModel);

module.exports = router;
