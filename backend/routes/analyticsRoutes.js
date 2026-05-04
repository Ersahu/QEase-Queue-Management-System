const express = require('express');
const router = express.Router();
const { getAdminAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(authorize('admin'));

router.get('/', getAdminAnalytics);

module.exports = router;
