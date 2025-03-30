// File: server/src/controllers/reportController.js

const { 
  Transaction, 
  RentalSession, 
  Device, 
  FoodOrder,
  OrderItem,
  FoodItem,
  Staff,
  sequelize
} = require('../models');
const { Op } = require('sequelize');

// Get sales report data
exports.getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        message: 'Parameter tanggal mulai dan tanggal akhir diperlukan'
      });
    }
    
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    endDateObj.setHours(23, 59, 59, 999); // Set to end of day
    
    // Validasi tanggal
    if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
      return res.status(400).json({
        message: 'Format tanggal tidak valid'
      });
    }
    
    let salesData = [];
    
    if (groupBy === 'day') {
      // Kueri untuk data harian
      const rentalQuery = `
        SELECT 
          DATE(transaction_time) as date,
          SUM(amount) as rental_sales
        FROM transactions
        WHERE 
          transaction_time BETWEEN ? AND ?
          AND type = 'Rental'
        GROUP BY DATE(transaction_time)
        ORDER BY date ASC
      `;
      
      const foodQuery = `
        SELECT 
          DATE(transaction_time) as date,
          SUM(amount) as food_sales
        FROM transactions
        WHERE 
          transaction_time BETWEEN ? AND ?
          AND type = 'Food'
        GROUP BY DATE(transaction_time)
        ORDER BY date ASC
      `;
      
      const [rentalResults, foodResults] = await Promise.all([
        sequelize.query(rentalQuery, {
          replacements: [startDateObj, endDateObj],
          type: sequelize.QueryTypes.SELECT
        }),
        sequelize.query(foodQuery, {
          replacements: [startDateObj, endDateObj],
          type: sequelize.QueryTypes.SELECT
        })
      ]);
      
      // Map rentals to a date-indexed object
      const rentalsMap = {};
      rentalResults.forEach(item => {
        const dateStr = new Date(item.date).toISOString().split('T')[0];
        rentalsMap[dateStr] = parseFloat(item.rental_sales);
      });
      
      // Map food sales to a date-indexed object
      const foodMap = {};
      foodResults.forEach(item => {
        const dateStr = new Date(item.date).toISOString().split('T')[0];
        foodMap[dateStr] = parseFloat(item.food_sales);
      });
      
      // Generate dates between start and end date
      const dates = [];
      let currentDate = new Date(startDateObj);
      while (currentDate <= endDateObj) {
        dates.push(new Date(currentDate).toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      // Create combined data
      salesData = dates.map(date => ({
        date,
        rentalSales: rentalsMap[date] || 0,
        foodSales: foodMap[date] || 0
      }));
      
    } else if (groupBy === 'month') {
      // Kueri untuk data bulanan
      const rentalQuery = `
        SELECT 
          DATE_FORMAT(transaction_time, '%Y-%m') as date,
          SUM(amount) as rental_sales
        FROM transactions
        WHERE 
          transaction_time BETWEEN ? AND ?
          AND type = 'Rental'
        GROUP BY DATE_FORMAT(transaction_time, '%Y-%m')
        ORDER BY date ASC
      `;
      
      const foodQuery = `
        SELECT 
          DATE_FORMAT(transaction_time, '%Y-%m') as date,
          SUM(amount) as food_sales
        FROM transactions
        WHERE 
          transaction_time BETWEEN ? AND ?
          AND type = 'Food'
        GROUP BY DATE_FORMAT(transaction_time, '%Y-%m')
        ORDER BY date ASC
      `;
      
      const [rentalResults, foodResults] = await Promise.all([
        sequelize.query(rentalQuery, {
          replacements: [startDateObj, endDateObj],
          type: sequelize.QueryTypes.SELECT
        }),
        sequelize.query(foodQuery, {
          replacements: [startDateObj, endDateObj],
          type: sequelize.QueryTypes.SELECT
        })
      ]);
      
      // Map rentals to a month-indexed object
      const rentalsMap = {};
      rentalResults.forEach(item => {
        rentalsMap[item.date] = parseFloat(item.rental_sales);
      });
      
      // Map food sales to a month-indexed object
      const foodMap = {};
      foodResults.forEach(item => {
        foodMap[item.date] = parseFloat(item.food_sales);
      });
      
      // Generate months between start and end date
      const months = [];
      let currentDate = new Date(startDateObj);
      currentDate.setDate(1); // First day of month
      
      const endMonth = new Date(endDateObj);
      endMonth.setDate(1); // First day of month
      
      while (currentDate <= endMonth) {
        const yearMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
        months.push(yearMonth);
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
      
      // Create combined data
      salesData = months.map(month => ({
        date: month,
        rentalSales: rentalsMap[month] || 0,
        foodSales: foodMap[month] || 0
      }));
    }
    
    res.json(salesData);
  } catch (error) {
    console.error('Error generating sales report:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get rental usage report data
exports.getRentalUsageReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        message: 'Parameter tanggal mulai dan tanggal akhir diperlukan'
      });
    }
    
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    endDateObj.setHours(23, 59, 59, 999); // Set to end of day
    
    // Validasi tanggal
    if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
      return res.status(400).json({
        message: 'Format tanggal tidak valid'
      });
    }
    
    // Query untuk data berdasarkan jenis PS
    const byPSQuery = `
      SELECT 
        d.device_type as name,
        COUNT(rs.session_id) as usage,
        SUM(TIMESTAMPDIFF(HOUR, rs.start_time, 
          CASE 
            WHEN rs.actual_end_time IS NOT NULL THEN rs.actual_end_time
            WHEN rs.end_time < NOW() THEN rs.end_time
            ELSE NOW()
          END
        )) as hours
      FROM rental_sessions rs
      JOIN devices d ON rs.device_id = d.device_id
      WHERE 
        rs.start_time BETWEEN ? AND ?
        AND rs.status != 'Cancelled'
      GROUP BY d.device_type
      ORDER BY name ASC
    `;
    
    // Query untuk data berdasarkan jam
    const byHourQuery = `
      SELECT 
        HOUR(start_time) as hour,
        COUNT(session_id) as count
      FROM rental_sessions
      WHERE 
        start_time BETWEEN ? AND ?
        AND status != 'Cancelled'
      GROUP BY HOUR(start_time)
      ORDER BY hour ASC
    `;
    
    const [byPSResults, byHourResults] = await Promise.all([
      sequelize.query(byPSQuery, {
        replacements: [startDateObj, endDateObj],
        type: sequelize.QueryTypes.SELECT
      }),
      sequelize.query(byHourQuery, {
        replacements: [startDateObj, endDateObj],
        type: sequelize.QueryTypes.SELECT
      })
    ]);
    
    // Format jam
    const formattedByHour = byHourResults.map(item => ({
      hour: `${item.hour}:00`,
      count: parseInt(item.count)
    }));
    
    // Format hasil jenis PS
    const formattedByPS = byPSResults.map(item => ({
      name: item.name,
      usage: parseInt(item.usage),
      hours: parseInt(item.hours)
    }));
    
    res.json({
      byPS: formattedByPS,
      byHour: formattedByHour
    });
  } catch (error) {
    console.error('Error generating rental usage report:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get recent transactions
exports.getRecentTransactions = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    // Gunakan raw query untuk menghindari masalah asosiasi
    const rawTransactions = await sequelize.query(`
      SELECT 
        t.transaction_id, 
        t.type, 
        t.amount, 
        t.payment_method, 
        t.transaction_time,
        t.reference_id,
        CASE 
          WHEN t.type = 'Rental' THEN (
            SELECT CONCAT(d.device_name, ' (', d.device_type, ')')
            FROM rental_sessions rs
            JOIN devices d ON rs.device_id = d.device_id
            WHERE rs.session_id = t.reference_id
            LIMIT 1
          )
          WHEN t.type = 'Food' THEN (
            SELECT GROUP_CONCAT(fi.name SEPARATOR ', ')
            FROM food_orders fo
            JOIN order_items oi ON fo.order_id = oi.order_id
            JOIN food_items fi ON oi.item_id = fi.item_id
            WHERE fo.order_id = t.reference_id
            LIMIT 3
          )
          ELSE 'Transaksi Lainnya'
        END as reference_name
      FROM transactions t
      ORDER BY t.transaction_time DESC
      LIMIT ?
    `, {
      replacements: [parseInt(limit)],
      type: sequelize.QueryTypes.SELECT
    });
    
    // Format data untuk front-end
    const formattedTransactions = rawTransactions.map(transaction => {
      let reference = {};
      
      if (transaction.type === 'Rental') {
        reference = {
          device_name: transaction.reference_name?.split(' (')[0] || 'PS Unknown',
          device_type: transaction.reference_name?.split(' (')[1]?.replace(')', '') || 'Unknown'
        };
      } else if (transaction.type === 'Food') {
        reference = {
          items: transaction.reference_name?.split(', ') || ['Item makanan']
        };
      }
      
      return {
        transaction_id: transaction.transaction_id,
        type: transaction.type,
        amount: parseFloat(transaction.amount),
        payment_method: transaction.payment_method,
        transaction_time: transaction.transaction_time,
        reference
      };
    });
    
    res.json(formattedTransactions);
  } catch (error) {
    console.error('Error fetching recent transactions:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get daily sales stats
exports.getDailySalesStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Get today's sales
    const todaySalesQuery = `
      SELECT 
        SUM(CASE WHEN type = 'Rental' THEN amount ELSE 0 END) as rental_sales,
        SUM(CASE WHEN type = 'Food' THEN amount ELSE 0 END) as food_sales,
        SUM(amount) as total_sales
      FROM transactions
      WHERE transaction_time BETWEEN ? AND ?
    `;
    
    // Get yesterday's sales
    const yesterdaySalesQuery = `
      SELECT SUM(amount) as total_sales
      FROM transactions
      WHERE transaction_time BETWEEN ? AND ?
    `;
    
    const [todayResults, yesterdayResults] = await Promise.all([
      sequelize.query(todaySalesQuery, {
        replacements: [today, tomorrow],
        type: sequelize.QueryTypes.SELECT
      }),
      sequelize.query(yesterdaySalesQuery, {
        replacements: [yesterday, today],
        type: sequelize.QueryTypes.SELECT
      })
    ]);
    
    const todaySales = parseFloat(todayResults[0].total_sales) || 0;
    const todayRentalSales = parseFloat(todayResults[0].rental_sales) || 0;
    const todayFoodSales = parseFloat(todayResults[0].food_sales) || 0;
    const yesterdaySales = parseFloat(yesterdayResults[0].total_sales) || 0;
    
    // Calculate percent change
    let percentChange = 0;
    if (yesterdaySales > 0) {
      percentChange = ((todaySales - yesterdaySales) / yesterdaySales) * 100;
    }
    
    res.json({
      todaySales,
      todayRentalSales,
      todayFoodSales,
      yesterday: yesterdaySales,
      percentChange: parseFloat(percentChange.toFixed(2))
    });
  } catch (error) {
    console.error('Error fetching daily sales stats:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};