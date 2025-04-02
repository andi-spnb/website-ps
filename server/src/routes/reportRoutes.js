// server/src/routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Basic report routes - accessible to all staff
router.get('/daily-sales', auth, reportController.getDailySales);
router.get('/recent-transactions', auth, reportController.getRecentTransactions);

// Advanced report routes - restricted to Admin and Owner
router.get('/sales', auth, roleCheck(['Admin', 'Owner']), reportController.getSalesData);
router.get('/rental-usage', auth, roleCheck(['Admin', 'Owner']), reportController.getRentalUsage);

module.exports = router;