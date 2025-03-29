const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');
const auth = require('../middleware/auth');

// Get all members
router.get('/', auth, memberController.getAllMembers);

// Get member by ID
router.get('/:id', auth, memberController.getMemberById);

// Create a new member
router.post('/', auth, memberController.createMember);

// Update a member
router.put('/:id', auth, memberController.updateMember);

// Delete a member
router.delete('/:id', auth, memberController.deleteMember);

module.exports = router;