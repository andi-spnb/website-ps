const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Public routes
router.post('/login', authController.login);
router.post('/register-public', authController.registerPublic); // Add this new route

// Protected routes
router.get('/me', auth, authController.getCurrentUser);
router.post('/register', auth, roleCheck(['Admin', 'Owner']), authController.register);
router.post('/change-password', auth, authController.changePassword);

module.exports = router;