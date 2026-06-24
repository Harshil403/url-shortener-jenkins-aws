const express = require('express');
const router = express.Router();
const {
  getAnalytics,
  getOverallAnalytics,
} = require('../controllers/analyticsController');

router.get('/analytics', getOverallAnalytics);
router.get('/analytics/:shortCode', getAnalytics);

module.exports = router;
