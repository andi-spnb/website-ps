const { Staff } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const sequelize = require('../config/database');

// Get all staff
exports.getAllStaff = async (req, res) => {
  try {
    const staff = await Staff.findAll({
      attributes: { exclude: ['password_hash'] },
      order: [['name', 'ASC']]
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
    
    res.json(staff);
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create new staff
exports.createStaff = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { name, role, username, password } = req.body;
    
    // Check if username already exists
    const existingStaff = await Staff.findOne({ 
      where: { username },
      transaction
    });
    
    if (existingStaff) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Username sudah digunakan' });
    }
    
    // Create new staff
    const newStaff = await Staff.create({
      name,
      role,
      username,
      password_hash: password, // Will be hashed by the model hook
      status: 'Active'
    }, { transaction });
    
    await transaction.commit();
    
    res.status(201).json({
      message: 'Karyawan berhasil ditambahkan',
      staff: {
        staff_id: newStaff.staff_id,
        name: newStaff.name,
        role: newStaff.role,
        status: newStaff.status
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating staff:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update staff
exports.updateStaff = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { name, role, username, password } = req.body;
    const staffId = req.params.id;
    
    const staff = await Staff.findByPk(staffId, { transaction });
    
    if (!staff) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Karyawan tidak ditemukan' });
    }
    
    // Check if username is changed and already exists
    if (username !== staff.username) {
      const existingStaff = await Staff.findOne({ 
        where: { 
          username,
          staff_id: { [Op.ne]: staffId }
        },
        transaction
      });
      
      if (existingStaff) {
        await transaction.rollback();
        return res.status(400).json({ message: 'Username sudah digunakan' });
      }
    }
    
    // Update staff
    const updateData = {
      name,
      role,
      username
    };
    
    // Add password only if provided
    if (password && password.trim() !== '') {
      updateData.password_hash = password;
    }
    
    await staff.update(updateData, { transaction });
    
    await transaction.commit();
    
    res.json({
      message: 'Karyawan berhasil diperbarui',
      staff: {
        staff_id: staff.staff_id,
        name: staff.name,
        role: staff.role,
        status: staff.status
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error updating staff:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete staff
exports.deleteStaff = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const staffId = req.params.id;
    
    // Prevent deleting self
    if (staffId == req.userData.staff_id) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Tidak dapat menghapus akun sendiri' });
    }
    
    // Prevent deleting the last owner
    if (req.userData.role !== 'Owner') {
      const staff = await Staff.findByPk(staffId, { transaction });
      
      if (staff && staff.role === 'Owner') {
        await transaction.rollback();
        return res.status(403).json({ message: 'Tidak memiliki izin untuk menghapus Owner' });
      }
    }
    
    const staff = await Staff.findByPk(staffId, { transaction });
    
    if (!staff) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Karyawan tidak ditemukan' });
    }
    
    await staff.destroy({ transaction });
    
    await transaction.commit();
    
    res.json({ message: 'Karyawan berhasil dihapus' });
  } catch (error) {
    await transaction.rollback();
    console.error('Error deleting staff:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Change staff status
exports.changeStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const staffId = req.params.id;
    
    // Validate status
    if (status !== 'Active' && status !== 'Inactive') {
      return res.status(400).json({ message: 'Status tidak valid' });
    }
    
    // Prevent changing own status
    if (staffId == req.userData.staff_id) {
      return res.status(400).json({ message: 'Tidak dapat mengubah status akun sendiri' });
    }
    
    const staff = await Staff.findByPk(staffId);
    
    if (!staff) {
      return res.status(404).json({ message: 'Karyawan tidak ditemukan' });
    }
    
    await staff.update({ status });
    
    res.json({
      message: 'Status karyawan berhasil diperbarui',
      staff: {
        staff_id: staff.staff_id,
        name: staff.name,
        role: staff.role,
        status: staff.status
      }
    });
  } catch (error) {
    console.error('Error changing staff status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};