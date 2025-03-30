const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Hanya Admin dan Owner yang bisa akses manajemen karyawan
const adminAccess = roleCheck(['Admin', 'Owner']);

// Get all staff
router.get('/', auth, adminAccess, staffController.getAllStaff);

// Get staff by ID
router.get('/:id', auth, adminAccess, staffController.getStaffById);

// Create new staff
router.post('/', auth, adminAccess, staffController.createStaff);

// Update staff
router.put('/:id', auth, adminAccess, staffController.updateStaff);

// Delete staff
router.delete('/:id', auth, adminAccess, staffController.deleteStaff);

// Change staff status (active/inactive)
router.patch('/:id/status', auth, adminAccess, staffController.changeStatus);

router.get('/admin', auth, adminAccess, async (req, res) => {
    try {
      const adminStaff = await Staff.findAll({
        where: {
          role: {
            [Op.in]: ['Admin', 'Owner']
          }
        },
        attributes: { exclude: ['password_hash'] },
        order: [['name', 'ASC']]
      });
      
      res.json(adminStaff);
    } catch (error) {
      console.error('Error fetching admin staff:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
module.exports = router;