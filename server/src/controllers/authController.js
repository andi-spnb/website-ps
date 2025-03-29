const jwt = require('jsonwebtoken');
const { Staff } = require('../models');
require('dotenv').config();

// Login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const staff = await Staff.findOne({ where: { username } });
    if (!staff) {
      return res.status(401).json({ message: 'Username atau password salah' });
    }

    const isPasswordValid = await staff.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Username atau password salah' });
    }

    if (staff.status !== 'Active') {
      return res.status(401).json({ message: 'Akun Anda tidak aktif' });
    }

    const token = jwt.sign(
      { 
        staff_id: staff.staff_id,
        username: staff.username,
        role: staff.role
      },
      process.env.JWT_SECRET || 'kenzie-gaming-secret-key',
      { expiresIn: '12h' }
    );

    res.json({
      message: 'Login berhasil',
      token,
      staff: {
        staff_id: staff.staff_id,
        name: staff.name,
        role: staff.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get current user info - Tambahkan fungsi ini
exports.getCurrentUser = async (req, res) => {
  try {
    const staff = await Staff.findByPk(req.userData.staff_id, {
      attributes: ['staff_id', 'name', 'role', 'username', 'status']
    });

    if (!staff) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    res.json({ staff });
  } catch (error) {
    console.error('Error getting current user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Register a new staff (Admin only)
exports.register = async (req, res) => {
  try {
    const { name, role, username, password } = req.body;
    
    // Check if username already exists
    const existingStaff = await Staff.findOne({ where: { username } });
    if (existingStaff) {
      return res.status(400).json({ message: 'Username sudah digunakan' });
    }

    // Create new staff
    const newStaff = await Staff.create({
      name,
      role,
      username,
      password_hash: password, // Will be hashed by the model hook
      status: 'Active'
    });

    res.status(201).json({
      message: 'Karyawan baru berhasil dibuat',
      staff: {
        staff_id: newStaff.staff_id,
        name: newStaff.name,
        role: newStaff.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const staff = await Staff.findByPk(req.userData.staff_id);

    if (!staff) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    const isPasswordValid = await staff.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Password saat ini salah' });
    }

    staff.password_hash = newPassword; // Will be hashed by model hook
    await staff.save();

    res.json({ message: 'Password berhasil diubah' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
exports.registerPublic = async (req, res) => {
  try {
    const { name, username, password, role } = req.body;
    
    // Check if username already exists
    const existingStaff = await Staff.findOne({ where: { username } });
    if (existingStaff) {
      return res.status(400).json({ message: 'Username sudah digunakan' });
    }
    
    // For public registration, limit role choices
    let safeRole = 'Cashier'; // Default to Cashier
    
    if (role === 'Admin') {
      // Admin accounts are pending approval
      safeRole = 'Cashier'; // Still create as Cashier, admin can upgrade later
    }
    
    // Create new staff
    const newStaff = await Staff.create({
      name,
      role: safeRole,
      username,
      password_hash: password, // Will be hashed by the model hook
      status: 'Active' // Auto-activate Cashier accounts, Admin would need approval
    });

    res.status(201).json({
      message: 'Pendaftaran berhasil',
      staff: {
        staff_id: newStaff.staff_id,
        name: newStaff.name,
        role: newStaff.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};