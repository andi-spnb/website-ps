const express = require('express');
const router = express.Router();
const playboxPricingController = require('../controllers/playboxPricingController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Public routes - untuk halaman publik
router.get('/public', playboxPricingController.getActivePricing);

// Admin routes - hanya untuk admin
router.get('/', auth, playboxPricingController.getAllPricing);
router.get('/active', auth, playboxPricingController.getActivePricing);
router.get('/:id', auth, playboxPricingController.getPricingById);

// Rute dengan proteksi admin/owner
router.post('/', auth, roleCheck(['Admin', 'Owner']), playboxPricingController.createPricing);
router.put('/:id', auth, roleCheck(['Admin', 'Owner']), playboxPricingController.updatePricing);
router.delete('/:id', auth, roleCheck(['Admin', 'Owner']), playboxPricingController.deletePricing);
router.patch('/:id/toggle-status', auth, roleCheck(['Admin', 'Owner']), playboxPricingController.toggleActiveStatus);

module.exports = router;