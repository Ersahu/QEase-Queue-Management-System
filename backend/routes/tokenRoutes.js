const express = require('express');
const router = express.Router();
const {
  createToken,
  getTokenStatus,
  getPublicQueueStatus,
} = require('../controllers/tokenController');

router.post('/', createToken);
router.get('/:entryId/status', getTokenStatus);
router.get('/queues/:queueId/status', getPublicQueueStatus);

module.exports = router;
