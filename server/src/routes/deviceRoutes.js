const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Get all devices - accessible to all authenticated users
router.get('/', auth, deviceController.getAllDevices);

// Get available devices
router.get('/available', auth, deviceController.getAvailableDevices);

// Get device by ID
router.get('/:id', auth, deviceController.getDeviceById);

// Admin/Owner only routes
router.post('/', auth, roleCheck(['Admin', 'Owner']), deviceController.createDevice);
router.put('/:id', auth, roleCheck(['Admin', 'Owner']), deviceController.updateDevice);
router.delete('/:id', auth, roleCheck(['Admin', 'Owner']), deviceController.deleteDevice);
router.patch('/:id/status', auth, roleCheck(['Admin', 'Owner']), deviceController.updateDeviceStatus);

module.exports = router;