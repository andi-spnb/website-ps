// File: server/src/routes/reportRoutes.js

const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Laporan hanya bisa diakses oleh Admin dan Owner
router.use(auth, roleCheck(['Admin', 'Owner']));

// Rute laporan penjualan
router.get('/sales', reportController.getSalesReport);

// Rute laporan penggunaan PlayStation
router.get('/rental-usage', reportController.getRentalUsageReport);

// Rute untuk transaksi terbaru
router.get('/recent-transactions', reportController.getRecentTransactions);

// Rute untuk statistik penjualan harian
router.get('/daily-sales', reportController.getDailySalesStats);

module.exports = router;