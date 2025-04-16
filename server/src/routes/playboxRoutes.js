const express = require('express');
const router = express.Router();
const playboxController = require('../controllers/playboxController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const upload = require('../middleware/upload');
const uploadIdentity = require('../middleware/uploadIdentity');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Public routes
router.get('/public', playboxController.getAllPlayboxes);
router.get('/public/available', playboxController.getAvailablePlayboxes);
router.get('/public/:id', playboxController.getPlayboxById);
router.post('/public/reserve', 
  (req, res, next) => {
    const uploadFields = [
      { name: 'payment_proof', maxCount: 1 },
      { name: 'identity_file', maxCount: 1 }
    ];
    
    upload.fields(uploadFields)(req, res, (err) => {
      if (err) {
        console.error('Upload error:', err);
        return res.status(400).json({ message: err.message });
      }
      
      // Untuk debug
      if (req.files) {
        console.log('Files uploaded:', Object.keys(req.files));
        for (const fieldName in req.files) {
          req.files[fieldName].forEach(file => {
            console.log(`${fieldName} saved at: ${file.path} (${file.mimetype})`);
          });
        }
      }
      
      next();
    });
  },
  playboxController.createReservation
);
router.get('/public/reservation/:booking_code', playboxController.getReservationByCode);

// Admin routes - require authentication and proper role
router.get('/', auth, playboxController.getAllPlayboxes);
router.post('/', auth, roleCheck(['Admin', 'Owner']), playboxController.createPlaybox);
router.put('/:id', auth, roleCheck(['Admin', 'Owner']), playboxController.updatePlaybox);
router.delete('/:id', auth, roleCheck(['Admin', 'Owner']), playboxController.deletePlaybox);
router.get('/reservations/:reservation_id/identity', auth, roleCheck(['Admin', 'Owner']), playboxController.getCustomerIdentityByReservationId);

// Game management
router.post('/:playbox_id/games', auth, roleCheck(['Admin', 'Owner']), playboxController.addGameToPlaybox);

// Reservation management for admin
router.get('/reservations', auth, playboxController.getAllReservationsWithIdentity);
router.post('/reservations/:reservation_id/confirm', auth, playboxController.confirmReservation);
router.put('/reservations/:reservation_id/status', auth, playboxController.updateReservationStatus);

module.exports = router;