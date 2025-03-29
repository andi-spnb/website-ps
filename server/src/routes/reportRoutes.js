// server/src/routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Only admin and owner can access reports
const adminAccess = roleCheck(['Admin', 'Owner']);

// Daily sales report - buka untuk semua peran
router.get('/daily-sales', auth, reportController.getDailySales);

// Recent transactions
router.get('/recent-transactions', auth, reportController.getRecentTransactions);

// Sales reports
router.get('/sales', auth, adminAccess, reportController.getSalesReport);

// Rental usage reports
router.get('/rental-usage', auth, adminAccess, reportController.getRentalUsageReport);

module.exports = router;