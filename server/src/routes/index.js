const express = require('express');
const router = express.Router();

// Import route files
const authRoutes = require('./authRoutes');
const deviceRoutes = require('./deviceRoutes');
const foodRoutes = require('./foodRoutes');
const memberRoutes = require('./memberRoutes');
const rentalRoutes = require('./rentalRoutes');
const staffRoutes = require('./staffRoutes');
const shiftRoutes = require('./shiftRoutes');
const reportRoutes = require('./reportRoutes');
const playboxRoutes = require('./playboxRoutes');
const dashboardRoutes = require('./dashboardRoutes');

// Define API routes
router.use('/auth', authRoutes);
router.use('/devices', deviceRoutes);
router.use('/food', foodRoutes);
router.use('/members', memberRoutes);
router.use('/rentals', rentalRoutes);
router.use('/staff', staffRoutes);
router.use('/shifts', shiftRoutes);
router.use('/reports', reportRoutes);
router.use('/playbox', playboxRoutes);

// Dashboard routes - ensure these are mounted properly
router.use('/reports/dashboard', dashboardRoutes);

module.exports = router;