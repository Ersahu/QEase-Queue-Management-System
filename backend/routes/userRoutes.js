const express = require('express');
const router = express.Router();
const {
  getUserQueues,
  getNearbyQueues,
  joinQueue,
  leaveQueue,
  getMyPosition,
  getQueueHistory,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

router.get('/queues', getUserQueues);
router.get('/queues/nearby', getNearbyQueues);
router.post('/queues/:id/join', joinQueue);
router.delete('/queues/:id/leave', leaveQueue);
router.get('/my-position', getMyPosition);
router.get('/history', getQueueHistory);

module.exports = router;
