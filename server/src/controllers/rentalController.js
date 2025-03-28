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
    
    // Get pricing
    const pricing = await Pricing.findOne({
      where: {
        device_type: device.device_type,
        [Op.or]: [
          { time_condition: 'Any' },
          { time_condition: start_time.getDay() === 0 || start_time.getDay() === 6 ? 'Weekend' : 'Weekday' }
        ]
      },
      order: [['price_id', 'DESC']], // Prioritize more specific pricing
      transaction
    });
    
    if (!pricing) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Harga tidak ditemukan untuk jenis perangkat ini' });
    }
    
    // Calculate total amount
    let total_amount;
    if (duration_hours >= (pricing.package_hours || 99999) && pricing.package_amount) {
      // Use package price if duration meets package requirement
      total_amount = pricing.package_amount;
    } else {
      total_amount = pricing.amount_per_hour * duration_hours;
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
    
    // Schedule notifications for time warnings (handled by background job)
    await Notification.create({
      target_id: session.session_id,
      type: 'TimeWarning',
      message: `PlayStation ${device.device_name} akan habis dalam 15 menit`,
      created_at: new Date(end_time.getTime() - (15 * 60 * 1000)), // 15 minutes before end
      is_read: false
    }, { transaction });
    
    await Notification.create({
      target_id: session.session_id,
      type: 'TimeWarning',
      message: `PlayStation ${device.device_name} akan habis dalam 5 menit`,
      created_at: new Date(end_time.getTime() - (5 * 60 * 1000)), // 5 minutes before end
      is_read: false
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
    
    // Update device status
    await session.Device.update({ status: 'Available' }, { transaction });
    
    // Clear any pending notifications
    await Notification.update(
      { is_read: true },
      { 
        where: { 
          target_id: session_id,
          type: 'TimeWarning',
          is_read: false
        },
        transaction
      }
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
    
    // Get pricing
    const pricing = await Pricing.findOne({
      where: {
        device_type: session.Device.device_type,
        [Op.or]: [
          { time_condition: 'Any' },
          { time_condition: new Date().getDay() === 0 || new Date().getDay() === 6 ? 'Weekend' : 'Weekday' }
        ]
      },
      order: [['price_id', 'DESC']], // Prioritize more specific pricing
      transaction
    });
    
    if (!pricing) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Harga tidak ditemukan untuk jenis perangkat ini' });
    }
    
    // Calculate additional amount
    const additional_amount = pricing.amount_per_hour * additional_hours;
    
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
    
    // Update notifications for new end time
    await Notification.destroy({
      where: {
        target_id: session_id,
        type: 'TimeWarning',
        is_read: false
      },
      transaction
    });
    
    // Create new notifications
    await Notification.create({
      target_id: session.session_id,
      type: 'TimeWarning',
      message: `PlayStation ${session.Device.device_name} akan habis dalam 15 menit`,
      created_at: new Date(new_end_time.getTime() - (15 * 60 * 1000)), // 15 minutes before end
      is_read: false
    }, { transaction });
    
    await Notification.create({
      target_id: session.session_id,
      type: 'TimeWarning',
      message: `PlayStation ${session.Device.device_name} akan habis dalam 5 menit`,
      created_at: new Date(new_end_time.getTime() - (5 * 60 * 1000)), // 5 minutes before end
      is_read: false
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