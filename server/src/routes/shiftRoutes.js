const express = require('express');
const router = express.Router();
const shiftController = require('../controllers/shiftController');
const auth = require('../middleware/auth');

// Get active shift
router.get('/active', auth, shiftController.getActiveShift);

// Get shift history
router.get('/history', auth, shiftController.getShiftHistory);

// Start new shift
router.post('/start', auth, shiftController.startShift);

// End shift
router.post('/:shift_id/end', auth, shiftController.endShift);

module.exports = router;