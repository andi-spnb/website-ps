const { Staff } = require('../models');
const { Op } = require('sequelize');

// Get all staff
exports.getAllStaff = async (req, res) => {
  try {
    // Owner dapat melihat semua karyawan
    // Admin hanya dapat melihat karyawan dengan peran Cashier dan Admin
    const whereClause = req.userData.role === 'Owner' 
      ? {} 
      : { role: { [Op.in]: ['Cashier', 'Admin'] } };
    
    const staff = await Staff.findAll({
      where: whereClause,
      attributes: { exclude: ['password_hash'] },
      order: [['role', 'ASC'], ['name', 'ASC']]
    });
    
    res.json(staff);
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get staff by ID
exports.getStaffById = async (req, res) => {
  try {
    const staff = await Staff.findByPk(req.params.id, {
      attributes: { exclude: ['password_hash'] }
    });
    
    if (!staff) {
      return res.status(404).json({ message: 'Karyawan tidak ditemukan' });
    }
    
    // Admin tidak boleh melihat detail Owner
    if (req.userData.role !== 'Owner' && staff.role === 'Owner') {
      return res.status(403).json({ message: 'Anda tidak memiliki izin yang cukup' });
    }
    
    res.json(staff);
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update staff status
exports.updateStaffStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status || !['Active', 'Inactive'].includes(status)) {
      return res.status(400).json({ message: 'Status tidak valid' });
    }
    
    const staff = await Staff.findByPk(req.params.id);
    
    if (!staff) {
      return res.status(404).json({ message: 'Karyawan tidak ditemukan' });
    }
    
    // Admin tidak boleh mengubah status Owner
    if (req.userData.role !== 'Owner' && staff.role === 'Owner') {
      return res.status(403).json({ message: 'Anda tidak memiliki izin yang cukup' });
    }
    
    // User tidak boleh mengubah status dirinya sendiri
    if (staff.staff_id === req.userData.staff_id) {
      return res.status(400).json({ message: 'Anda tidak dapat mengubah status akun Anda sendiri' });
    }
    
    await staff.update({ status });
    
    res.json({
      message: `Status karyawan berhasil diperbarui menjadi ${status}`,
      staff: {
        staff_id: staff.staff_id,
        name: staff.name,
        role: staff.role,
        status: staff.status
      }
    });
  } catch (error) {
    console.error('Error updating staff status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete staff
exports.deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findByPk(req.params.id);
    
    if (!staff) {
      return res.status(404).json({ message: 'Karyawan tidak ditemukan' });
    }
    
    // Admin tidak boleh menghapus Owner
    if (req.userData.role !== 'Owner' && staff.role === 'Owner') {
      return res.status(403).json({ message: 'Anda tidak memiliki izin yang cukup' });
    }
    
    // User tidak boleh menghapus dirinya sendiri
    if (staff.staff_id === req.userData.staff_id) {
      return res.status(400).json({ message: 'Anda tidak dapat menghapus akun Anda sendiri' });
    }
    
    await staff.destroy();
    
    res.json({ message: 'Karyawan berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting staff:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};