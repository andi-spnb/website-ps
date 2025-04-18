const express = require('express');
const router = express.Router();
const pricingController = require('../controllers/pricingController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Public routes - untuk halaman publik
router.get('/public', pricingController.getActivePricing);

// Admin routes - hanya untuk admin
router.get('/', auth, pricingController.getAllPricing);
router.get('/active', auth, pricingController.getActivePricing);
router.get('/:id', auth, pricingController.getPricingById);

// Rute dengan proteksi admin/owner
router.post('/', auth, roleCheck(['Admin', 'Owner']), pricingController.createPricing);
router.put('/:id', auth, roleCheck(['Admin', 'Owner']), pricingController.updatePricing);
router.delete('/:id', auth, roleCheck(['Admin', 'Owner']), pricingController.deletePricing);
router.patch('/:id/toggle-status', auth, roleCheck(['Admin', 'Owner']), pricingController.toggleActiveStatus);
router.get('/device-type/:type', auth, pricingController.getPricingByDeviceType);

module.exports = router;