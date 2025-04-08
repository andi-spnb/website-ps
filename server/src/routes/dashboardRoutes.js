const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Admin/Owner only routes
const adminOnly = roleCheck(['Admin', 'Owner']);

// Dashboard endpoints
router.get('/summary', auth, dashboardController.getDashboardSummary);
router.get('/revenue', auth, dashboardController.getRevenueByDay);
router.get('/devices', auth, dashboardController.getDevicesData);
router.get('/top-products', auth, dashboardController.getTopProducts);
router.get('/hourly-traffic', auth, dashboardController.getHourlyTraffic);
router.get('/member-activity', auth, dashboardController.getMemberActivity);

// Debug route to test API connectivity
router.get('/test', (req, res) => {
  res.json({ message: 'Dashboard API is working' });
});

module.exports = router;