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
router.get('/playbox', auth, roleCheck(['Admin', 'Owner']), reportController.getPlayboxReport);
router.get('/playstation', auth, roleCheck(['Admin', 'Owner']), reportController.getPlayStationReport);
router.get('/food-beverage', auth, roleCheck(['Admin', 'Owner']), reportController.getFoodBeverageReport);
router.get('/stock-alerts', auth, roleCheck(['Admin', 'Owner']), reportController.getStockAlerts);

module.exports = router;