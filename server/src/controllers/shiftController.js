const { Shift, Staff, Transaction, sequelize } = require('../models');
const { Op } = require('sequelize');

// Get active shift
exports.getActiveShift = async (req, res) => {
  try {
    const activeShift = await Shift.findOne({
      where: {
        staff_id: req.userData.staff_id,
        status: 'Active'
      },
      include: [{ model: Staff, attributes: ['staff_id', 'name', 'role'] }]
    });
    
    res.json({ shift: activeShift });
  } catch (error) {
    console.error('Error fetching active shift:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get shift history
exports.getShiftHistory = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    const shifts = await Shift.findAll({
      include: [{ model: Staff, attributes: ['staff_id', 'name', 'role'] }],
      order: [['start_time', 'DESC']],
      limit: parseInt(limit)
    });
    
    res.json(shifts);
  } catch (error) {
    console.error('Error fetching shift history:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Start new shift
exports.startShift = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { opening_balance } = req.body;
    const staff_id = req.userData.staff_id;
    
    // Check if staff already has an active shift
    const activeShift = await Shift.findOne({
      where: {
        staff_id,
        status: 'Active'
      },
      transaction
    });
    
    if (activeShift) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Anda sudah memiliki shift aktif' });
    }
    
    // Create new shift
    const newShift = await Shift.create({
      staff_id,
      start_time: new Date(),
      opening_balance,
      status: 'Active'
    }, { transaction });
    
    await transaction.commit();
    
    res.status(201).json({
      message: 'Shift berhasil dimulai',
      shift: newShift
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error starting shift:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// End shift
exports.endShift = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { shift_id } = req.params;
    const { closing_balance, notes } = req.body;
    const staff_id = req.userData.staff_id;
    
    // Find the active shift
    const shift = await Shift.findOne({
      where: {
        shift_id,
        staff_id,
        status: 'Active'
      },
      transaction
    });
    
    if (!shift) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Shift aktif tidak ditemukan' });
    }
    
    // Calculate total sales
    const totalSales = await Transaction.sum('amount', {
      where: {
        shift_id,
        transaction_time: {
          [Op.between]: [shift.start_time, new Date()]
        }
      },
      transaction
    });
    
    // Update shift
    await shift.update({
      end_time: new Date(),
      closing_balance,
      total_sales: totalSales || 0,
      notes,
      status: 'Closed'
    }, { transaction });
    
    await transaction.commit();
    
    res.json({
      message: 'Shift berhasil diakhiri',
      shift: shift.toJSON()
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error ending shift:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};