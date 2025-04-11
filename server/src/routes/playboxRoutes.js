const express = require('express');
const router = express.Router();
const playboxController = require('../controllers/playboxController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const upload = require('../middleware/upload');

// Public routes
router.get('/public', playboxController.getAllPlayboxes);
router.get('/public/available', playboxController.getAvailablePlayboxes);
router.get('/public/:id', playboxController.getPlayboxById);
router.post('/public/reserve', upload.single('payment_proof'), playboxController.createReservation);
router.get('/public/reservation/:booking_code', playboxController.getReservationByCode);

// Admin routes - require authentication and proper role
router.get('/', auth, playboxController.getAllPlayboxes);
router.post('/', auth, roleCheck(['Admin', 'Owner']), playboxController.createPlaybox);
router.put('/:id', auth, roleCheck(['Admin', 'Owner']), playboxController.updatePlaybox);
router.delete('/:id', auth, roleCheck(['Admin', 'Owner']), playboxController.deletePlaybox);

// Game management
router.post('/:playbox_id/games', auth, roleCheck(['Admin', 'Owner']), playboxController.addGameToPlaybox);

// Reservation management for admin
router.get('/reservations', auth, playboxController.getAllReservations);
router.post('/reservations/:reservation_id/confirm', auth, playboxController.confirmReservation);
router.put('/reservations/:reservation_id/status', auth, playboxController.updateReservationStatus);

module.exports = router;