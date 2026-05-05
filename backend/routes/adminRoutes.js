const express = require('express');
const router = express.Router();
const {
  getDashboard,
  callNextCustomer,
  completeCustomer,
  pauseQueue,
  resumeQueue,
  removeCustomer,
  getQueueCustomers,
  deleteQueue,
} = require('../controllers/adminController');
const { createQueue } = require('../controllers/queueController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// All routes are protected and admin-only
router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getDashboard);
router.post('/queues', createQueue);
router.delete('/queues/:id', deleteQueue);
router.post('/queues/:id/call-next', callNextCustomer);
router.post('/queues/:id/complete/:entryId', completeCustomer);
router.post('/queues/:id/pause', pauseQueue);
router.post('/queues/:id/resume', resumeQueue);
router.delete('/queues/:queueId/customers/:entryId', removeCustomer);
router.get('/queues/:id/customers', getQueueCustomers);

module.exports = router;
