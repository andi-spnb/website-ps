const { User } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// Get all members
exports.getAllMembers = async (req, res) => {
  try {
    const members = await User.findAll({
      order: [['registration_date', 'DESC']]
    });
    
    res.json(members);
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get member by ID
exports.getMemberById = async (req, res) => {
  try {
    const member = await User.findByPk(req.params.id);
    
    if (!member) {
      return res.status(404).json({ message: 'Member tidak ditemukan' });
    }
    
    res.json(member);
  } catch (error) {
    console.error('Error fetching member:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new member
exports.createMember = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { 
      name, 
      phone, 
      email, 
      membership_id, 
      expiry_date 
    } = req.body;
    
    // Check if membership_id or email already exists
    if (membership_id) {
      const existingMember = await User.findOne({ 
        where: { membership_id },
        transaction
      });
      
      if (existingMember) {
        await transaction.rollback();
        return res.status(400).json({ message: 'ID member sudah digunakan' });
      }
    }
    
    if (email) {
      const existingEmail = await User.findOne({ 
        where: { email },
        transaction 
      });
      
      if (existingEmail) {
        await transaction.rollback();
        return res.status(400).json({ message: 'Email sudah digunakan oleh member lain' });
      }
    }
    
    // Generate membership_id if not provided
    let membershipId = membership_id;
    if (!membershipId) {
      const lastMember = await User.findOne({
        order: [['user_id', 'DESC']],
        transaction
      });
      
      const lastId = lastMember ? parseInt(lastMember.membership_id.replace('KG-', '')) : 0;
      membershipId = `KG-${(lastId + 1).toString().padStart(4, '0')}`;
    }
    
    const newMember = await User.create({
      name,
      phone,
      email,
      membership_id: membershipId,
      registration_date: new Date(),
      reward_points: 0,
      expiry_date: new Date(expiry_date),
      status: 'Active'
    }, { transaction });
    
    await transaction.commit();
    
    res.status(201).json(newMember);
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating member:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update a member
exports.updateMember = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { 
      name, 
      phone, 
      email,
      // memberController.js (lanjutan)
      status,
      expiry_date 
    } = req.body;
    
    const member = await User.findByPk(req.params.id, { transaction });
    
    if (!member) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Member tidak ditemukan' });
    }
    
    // Check if email is already used by another member
    if (email && email !== member.email) {
      const existingEmail = await User.findOne({
        where: { 
          email,
          user_id: { [Op.ne]: member.user_id }
        },
        transaction
      });
      
      if (existingEmail) {
        await transaction.rollback();
        return res.status(400).json({ message: 'Email sudah digunakan oleh member lain' });
      }
    }
    
    await member.update({
      name,
      phone,
      email,
      status,
      expiry_date: expiry_date ? new Date(expiry_date) : member.expiry_date
    }, { transaction });
    
    await transaction.commit();
    
    res.json(member);
  } catch (error) {
    await transaction.rollback();
    console.error('Error updating member:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a member
exports.deleteMember = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const member = await User.findByPk(req.params.id, { transaction });
    
    if (!member) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Member tidak ditemukan' });
    }
    
    // Check if member has active rental sessions
    // You would need to add a check here in a real application
    
    await member.destroy({ transaction });
    
    await transaction.commit();
    
    res.json({ message: 'Member berhasil dihapus' });
  } catch (error) {
    await transaction.rollback();
    console.error('Error deleting member:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};