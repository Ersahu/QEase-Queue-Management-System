const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
  generateQueueJoinQR,
  getQueueDetailsFromToken,
  joinQueueFromQr,
} = require('../controllers/qrCheckinController');

router.get('/:token/details', getQueueDetailsFromToken);
router.post('/:token/join', protect, joinQueueFromQr);
router.post('/queues/:id/generate', protect, authorize('admin'), generateQueueJoinQR);

module.exports = router;
