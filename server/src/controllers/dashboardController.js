const { 
  Transaction, 
  Device, 
  FoodItem, 
  RentalSession, 
  FoodOrder,
  OrderItem,
  User,
  sequelize
} = require('../models');
const { Op } = require('sequelize');

// Get dashboard summary data
exports.getDashboardSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Validate date parameters
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Tanggal awal dan akhir diperlukan' });
    }
    
    // Start and end dates for the current period
    const currentPeriodStart = new Date(startDate);
    const currentPeriodEnd = new Date(endDate);
    
    // Calculate date range for previous period of equal length
    const dayDiff = Math.ceil((currentPeriodEnd - currentPeriodStart) / (1000 * 60 * 60 * 24));
    const previousPeriodEnd = new Date(currentPeriodStart);
    previousPeriodEnd.setDate(previousPeriodEnd.getDate() - 1);
    const previousPeriodStart = new Date(previousPeriodEnd);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - dayDiff);
    
    // Get total revenue for current period
    const currentPeriodRevenue = await Transaction.sum('amount', {
      where: {
        transaction_time: {
          [Op.between]: [currentPeriodStart, currentPeriodEnd]
        }
      }
    }) || 0;
    
    // Get total revenue for previous period
    const previousPeriodRevenue = await Transaction.sum('amount', {
      where: {
        transaction_time: {
          [Op.between]: [previousPeriodStart, previousPeriodEnd]
        }
      }
    }) || 0;
    
    // Calculate percent change
    let percentChange = 0;
    if (previousPeriodRevenue > 0) {
      percentChange = ((currentPeriodRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100;
    }
    
    // Get revenue by type for current period
    const rentalRevenue = await Transaction.sum('amount', {
      where: {
        type: 'Rental',
        transaction_time: {
          [Op.between]: [currentPeriodStart, currentPeriodEnd]
        }
      }
    }) || 0;
    
    const foodRevenue = await Transaction.sum('amount', {
      where: {
        type: 'Food',
        transaction_time: {
          [Op.between]: [currentPeriodStart, currentPeriodEnd]
        }
      }
    }) || 0;
    
    // Get count of active members
    const memberCount = await User.count({
      where: {
        status: 'Active',
        expiry_date: {
          [Op.gte]: new Date()
        }
      }
    });
    
    // Get count of active devices
    const activeDevices = await Device.count({
      where: {
        status: 'In Use'
      }
    });
    
    // Get total orders
    const totalOrders = await Transaction.count({
      where: {
        transaction_time: {
          [Op.between]: [currentPeriodStart, currentPeriodEnd]
        }
      }
    });
    
    res.json({
      totalRevenue: currentPeriodRevenue,
      totalOrders,
      rentalRevenue,
      foodRevenue,
      memberCount,
      activeDevices,
      percentChange: parseFloat(percentChange.toFixed(2))
    });
  } catch (error) {
    console.error('Error getting dashboard summary:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get revenue by day
exports.getRevenueByDay = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Validate date parameters
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Tanggal awal dan akhir diperlukan' });
    }
    
    // Query to get revenue by day and type
    const query = `
      SELECT 
        DATE(transaction_time) as date,
        SUM(CASE WHEN type = 'Rental' THEN amount ELSE 0 END) as rental,
        SUM(CASE WHEN type = 'Food' THEN amount ELSE 0 END) as food,
        SUM(amount) as total
      FROM transactions
      WHERE transaction_time BETWEEN ? AND ?
      GROUP BY DATE(transaction_time)
      ORDER BY date
    `;
    
    const results = await sequelize.query(query, {
      replacements: [startDate, endDate],
      type: sequelize.QueryTypes.SELECT
    });
    
    // Format the results with proper date labels
    const formattedResults = results.map(item => ({
      ...item,
      label: new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
    }));
    
    res.json(formattedResults);
  } catch (error) {
    console.error('Error getting revenue by day:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get device usage and revenue breakdown
exports.getDevicesData = async (req, res) => {
  try {
    // Get revenue by device type
    const revenueByDeviceType = await sequelize.query(`
      SELECT 
        d.device_type as name,
        SUM(t.amount) as value
      FROM transactions t
      JOIN rental_sessions rs ON t.reference_id = rs.session_id AND t.type = 'Rental'
      JOIN devices d ON rs.device_id = d.device_id
      GROUP BY d.device_type
      ORDER BY value DESC
    `, {
      type: sequelize.QueryTypes.SELECT
    });
    
    // Add Playbox revenue if it exists
    try {
      const playboxRevenue = await Transaction.sum('amount', {
        where: {
          type: 'Playbox'
        }
      }) || 0;
      
      if (playboxRevenue > 0) {
        revenueByDeviceType.push({
          name: 'Playbox',
          value: playboxRevenue
        });
      }
    } catch (error) {
      console.error('Error getting Playbox revenue:', error);
    }
    
    // Get usage and revenue by device
    const deviceUsage = await sequelize.query(`
      SELECT 
        d.device_name as name,
        SUM(TIMESTAMPDIFF(HOUR, rs.start_time, IFNULL(rs.actual_end_time, rs.end_time))) as hours,
        SUM(t.amount) as revenue
      FROM rental_sessions rs
      JOIN devices d ON rs.device_id = d.device_id
      LEFT JOIN transactions t ON t.reference_id = rs.session_id AND t.type = 'Rental'
      GROUP BY d.device_id
      ORDER BY revenue DESC
      LIMIT 5
    `, {
      type: sequelize.QueryTypes.SELECT
    });
    
    res.json({
      revenueByCategory: revenueByDeviceType,
      devices: deviceUsage
    });
  } catch (error) {
    console.error('Error getting devices data:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get top selling products
exports.getTopProducts = async (req, res) => {
  try {
    const { startDate, endDate, limit = 5 } = req.query;
    
    // Query to get top selling products
    const query = `
      SELECT 
        fi.name,
        fi.category,
        SUM(oi.quantity) as quantity,
        SUM(oi.subtotal) as revenue
      FROM order_items oi
      JOIN food_items fi ON oi.item_id = fi.item_id
      JOIN food_orders fo ON oi.order_id = fo.order_id
      WHERE fo.order_time BETWEEN ? AND ?
      GROUP BY fi.item_id
      ORDER BY quantity DESC
      LIMIT ?
    `;
    
    const results = await sequelize.query(query, {
      replacements: [startDate || '2000-01-01', endDate || '2099-12-31', parseInt(limit)],
      type: sequelize.QueryTypes.SELECT
    });
    
    res.json(results);
  } catch (error) {
    console.error('Error getting top products:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get hourly traffic data
exports.getHourlyTraffic = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Validate date parameters
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Tanggal awal dan akhir diperlukan' });
    }
    
    // Query to get hourly customer traffic
    const query = `
      SELECT 
        HOUR(rs.start_time) as hour_num,
        CONCAT(HOUR(rs.start_time), ':00') as hour,
        COUNT(DISTINCT rs.session_id) as customers,
        SUM(t.amount) as revenue
      FROM rental_sessions rs
      LEFT JOIN transactions t ON t.reference_id = rs.session_id AND t.type = 'Rental'
      WHERE rs.start_time BETWEEN ? AND ?
      GROUP BY HOUR(rs.start_time)
      ORDER BY hour_num
    `;
    
    const results = await sequelize.query(query, {
      replacements: [startDate, endDate],
      type: sequelize.QueryTypes.SELECT
    });
    
    res.json(results);
  } catch (error) {
    console.error('Error getting hourly traffic:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get member activity by day of week
exports.getMemberActivity = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Validate date parameters
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Tanggal awal dan akhir diperlukan' });
    }
    
    // Query to get member activity by day of week
    const query = `
      SELECT 
        WEEKDAY(rs.start_time) as day_num,
        CASE WEEKDAY(rs.start_time)
          WHEN 0 THEN 'Sen'
          WHEN 1 THEN 'Sel'
          WHEN 2 THEN 'Rab'
          WHEN 3 THEN 'Kam'
          WHEN 4 THEN 'Jum'
          WHEN 5 THEN 'Sab'
          WHEN 6 THEN 'Min'
        END as day,
        COUNT(DISTINCT CASE WHEN rs.user_id IS NOT NULL THEN rs.session_id END) as visits,
        SUM(CASE WHEN rs.user_id IS NOT NULL THEN t.amount ELSE 0 END) as spending
      FROM rental_sessions rs
      LEFT JOIN transactions t ON t.reference_id = rs.session_id AND t.type = 'Rental'
      WHERE rs.start_time BETWEEN ? AND ?
      GROUP BY WEEKDAY(rs.start_time)
      ORDER BY day_num
    `;
    
    const results = await sequelize.query(query, {
      replacements: [startDate, endDate],
      type: sequelize.QueryTypes.SELECT
    });
    
    res.json(results);
  } catch (error) {
    console.error('Error getting member activity:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};