const express = require('express');
const router = express.Router();
const rentalController = require('../controllers/rentalController');
const auth = require('../middleware/auth');

// Get active rental sessions
router.get('/active', auth, rentalController.getActiveRentals);

// Get rental history (with optional filters)
router.get('/history', auth, rentalController.getRentalHistory);

// Start new rental session
router.post('/start', auth, rentalController.startRental);

// End rental session
router.post('/:session_id/end', auth, rentalController.endRental);

// Extend rental session
router.post('/:session_id/extend', auth, rentalController.extendRental);

// Get rental details
router.get('/:session_id', auth, rentalController.getRentalDetails);

module.exports = router;