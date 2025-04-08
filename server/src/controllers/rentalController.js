const { 
  RentalSession, 
  Device, 
  User, 
  Staff, 
  Transaction, 
  Pricing,
  Notification,
  sequelize
} = require('../models');
const { Op } = require('sequelize');

// Get active rental sessions
exports.getActiveRentals = async (req, res) => {
  try {
    const activeSessions = await RentalSession.findAll({
      where: {
        status: 'Active'
      },
      include: [
        { model: Device },
        { model: User },
        { model: Staff, attributes: ['staff_id', 'name'] }
      ],
      order: [['start_time', 'ASC']]
    });
    
    // Calculate remaining time for each session
    const sessionsWithRemainingTime = activeSessions.map(session => {
      const now = new Date();
      const endTime = new Date(session.end_time);
      const remainingMs = endTime - now;
      
      let remaining = {
        hours: 0,
        minutes: 0,
        seconds: 0,
        total_seconds: 0,
        is_overdue: false
      };
      
      if (remainingMs > 0) {
        remaining.hours = Math.floor(remainingMs / (1000 * 60 * 60));
        remaining.minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
        remaining.seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);
        remaining.total_seconds = Math.floor(remainingMs / 1000);
      } else {
        remaining.is_overdue = true;
      }
      
      return {
        ...session.toJSON(),
        remaining
      };
    });
    
    res.json(sessionsWithRemainingTime);
  } catch (error) {
    console.error('Error fetching active rentals:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Start new rental session
exports.startRental = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { device_id, user_id, duration_hours, payment_method } = req.body;
    const staff_id = req.userData.staff_id;
    
    // Check if device exists and is available
    const device = await Device.findByPk(device_id, { transaction });
    if (!device) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Perangkat tidak ditemukan' });
    }
    
    if (device.status !== 'Available') {
      await transaction.rollback();
      return res.status(400).json({ message: 'Perangkat sedang tidak tersedia' });
    }
    
    // Calculate end time
    const start_time = new Date();
    const end_time = new Date(start_time.getTime() + (duration_hours * 60 * 60 * 1000));
    
    // Get pricing (simplified for example)
    let total_amount = 0;
    switch (device.device_type) {
      case 'PS5':
        total_amount = duration_hours * 20000;
        break;
      case 'PS4':
        total_amount = duration_hours * 15000;
        break;
      case 'PS3':
        total_amount = duration_hours * 10000;
        break;
      default:
        total_amount = duration_hours * 15000;
    }
    
    // Apply discount based on duration
    if (duration_hours >= 10) {
      total_amount = total_amount * 0.8; // 20% discount
    } else if (duration_hours >= 5) {
      total_amount = total_amount * 0.9; // 10% discount
    } else if (duration_hours >= 3) {
      total_amount = total_amount * 0.95; // 5% discount
    } if (!duration_hours || duration_hours <= 0 || duration_hours > 24) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Durasi tidak valid. Maksimal 24 jam' });
    }
    
    // Create rental session
    const session = await RentalSession.create({
      device_id,
      user_id: user_id || null, // Optional member
      staff_id,
      start_time,
      end_time,
      actual_end_time: null,
      status: 'Active',
      total_amount,
      payment_method,
      payment_status: 'Paid'
    }, { transaction });
    
    // Update device status
    await device.update({ status: 'In Use' }, { transaction });
    
    // Record transaction
    await Transaction.create({
      shift_id: req.body.shift_id, // Current active shift
      type: 'Rental',
      reference_id: session.session_id,
      amount: total_amount,
      payment_method,
      transaction_time: new Date()
    }, { transaction });
    
    await transaction.commit();
    
    res.status(201).json({
      message: 'Sesi rental berhasil dimulai',
      session: {
        ...session.toJSON(),
        device: device.toJSON()
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error starting rental:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// End rental session
exports.endRental = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { session_id } = req.params;
    
    // Find active session
    const session = await RentalSession.findOne({
      where: {
        session_id,
        status: 'Active'
      },
      include: [{ model: Device }],
      transaction
    });
    
    if (!session) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Sesi rental aktif tidak ditemukan' });
    }
    
    // Update session
    const actual_end_time = new Date();
    await session.update({
      actual_end_time,
      status: 'Completed'
    }, { transaction });
    
    // Update device status - selalu ubah ke Available
    await Device.update(
      { status: 'Available' },
      { where: { device_id: session.device_id }, transaction }
    );
    
    await transaction.commit();
    
    res.json({
      message: 'Sesi rental berhasil diakhiri',
      session: session.toJSON()
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error ending rental:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Extend rental session
exports.extendRental = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { session_id } = req.params;
    const { additional_hours, payment_method } = req.body;
    
    // Find active session
    const session = await RentalSession.findOne({
      where: {
        session_id,
        status: 'Active'
      },
      include: [{ model: Device }],
      transaction
    });
    
    if (!session) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Sesi rental aktif tidak ditemukan' });
    }
    
    // Calculate additional amount (simplified)
    let hourly_rate = 15000; // Default
    switch (session.Device.device_type) {
      case 'PS5':
        hourly_rate = 20000;
        break;
      case 'PS4':
        hourly_rate = 15000;
        break;
      case 'PS3':
        hourly_rate = 10000;
        break;
    }
    
    const additional_amount = hourly_rate * additional_hours;
    
    // Calculate new end time
    const new_end_time = new Date(session.end_time.getTime() + (additional_hours * 60 * 60 * 1000));
    
    // Update session
    await session.update({
      end_time: new_end_time,
      total_amount: session.total_amount + additional_amount
    }, { transaction });
    
    // Record additional transaction
    await Transaction.create({
      shift_id: req.body.shift_id, // Current active shift
      type: 'Rental',
      reference_id: session.session_id,
      amount: additional_amount,
      payment_method,
      transaction_time: new Date()
    }, { transaction });
    
    await transaction.commit();
    
    res.json({
      message: 'Sesi rental berhasil diperpanjang',
      session: {
        ...session.toJSON(),
        additional_amount,
        new_end_time
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error extending rental:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get rental history
exports.getRentalHistory = async (req, res) => {
  try {
    const { startDate, endDate, status, deviceId, userId } = req.query;
    let whereClause = {};
    
    // Apply filters
    if (startDate && endDate) {
      whereClause.start_time = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else if (startDate) {
      whereClause.start_time = {
        [Op.gte]: new Date(startDate)
      };
    } else if (endDate) {
      whereClause.start_time = {
        [Op.lte]: new Date(endDate)
      };
    }
    
    if (status) {
      whereClause.status = status;
    }
    
    if (deviceId) {
      whereClause.device_id = deviceId;
    }
    
    if (userId) {
      whereClause.user_id = userId;
    }
    
    const sessions = await RentalSession.findAll({
      where: whereClause,
      include: [
        { model: Device },
        { model: User },
        { model: Staff, attributes: ['staff_id', 'name'] }
      ],
      order: [['start_time', 'DESC']],
      limit: 100
    });
    
    res.json(sessions);
  } catch (error) {
    console.error('Error fetching rental history:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get rental details
exports.getRentalDetails = async (req, res) => {
  try {
    const { session_id } = req.params;
    
    const session = await RentalSession.findByPk(session_id, {
      include: [
        { model: Device },
        { model: User },
        { model: Staff, attributes: ['staff_id', 'name'] }
      ]
    });
    
    if (!session) {
      return res.status(404).json({ message: 'Sesi rental tidak ditemukan' });
    }
    
    res.json(session);
  } catch (error) {
    console.error('Error fetching rental details:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Check and end expired sessions
exports.checkExpiredSessions = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const now = new Date();
    
    // Find all active sessions that have passed their end time
    const expiredSessions = await RentalSession.findAll({
      where: {
        status: 'Active',
        end_time: {
          [Op.lt]: now
        }
      },
      include: [{ model: Device }],
      transaction
    });
    
    if (expiredSessions.length === 0) {
      await transaction.rollback();
      return res.json({ message: 'Tidak ada sesi yang kedaluwarsa' });
    }
    
    // End all expired sessions
    const updated = [];
    for (const session of expiredSessions) {
      // Update session
      await session.update({
        actual_end_time: now,
        status: 'Completed'
      }, { transaction });
      
      // Update device status
      await session.Device.update({ status: 'Available' }, { transaction });
      
      updated.push({
        session_id: session.session_id,
        device_id: session.device_id,
        device_name: session.Device.device_name
      });
    }
    
    await transaction.commit();
    
    res.json({
      message: `${updated.length} sesi yang kedaluwarsa telah diakhiri`,
      sessions: updated
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error checking expired sessions:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
exports.getRentalHistory = async (req, res) => {
  try {
    const { startDate, endDate, status, deviceId, userId, deviceType } = req.query;
    let whereClause = {};
    
    // Apply filters
    if (startDate && endDate) {
      whereClause.start_time = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else if (startDate) {
      whereClause.start_time = {
        [Op.gte]: new Date(startDate)
      };
    } else if (endDate) {
      whereClause.start_time = {
        [Op.lte]: new Date(endDate)
      };
    }
    
    if (status) {
      whereClause.status = status;
    }
    
    if (deviceId) {
      whereClause.device_id = deviceId;
    }
    
    if (userId) {
      whereClause.user_id = userId;
    }
    
    const includeClause = [
      { 
        model: Device,
        ...(deviceType ? { where: { device_type: deviceType } } : {})
      },
      { model: User },
      { model: Staff, attributes: ['staff_id', 'name'] }
    ];
    
    const sessions = await RentalSession.findAll({
      where: whereClause,
      include: includeClause,
      order: [['start_time', 'DESC']],
      limit: 100
    });
    
    res.json(sessions);
  } catch (error) {
    console.error('Error fetching rental history:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};