const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Get all staff - admin only
router.get('/', auth, roleCheck(['Admin', 'Owner']), staffController.getAllStaff);

// Get staff by ID - admin only
router.get('/:id', auth, roleCheck(['Admin', 'Owner']), staffController.getStaffById);

// Update staff status - admin only
router.patch('/:id/status', auth, roleCheck(['Admin', 'Owner']), staffController.updateStaffStatus);

// Delete staff - admin only
router.delete('/:id', auth, roleCheck(['Admin', 'Owner']), staffController.deleteStaff);

module.exports = router;