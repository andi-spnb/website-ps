const { 
  RentalSession, 
  Device, 
  Transaction, 
  FoodOrder,
  PlayboxReservation, 
  Playbox,
  sequelize 
} = require('../models');
const { Op } = require('sequelize');

// Mendapatkan statistik penggunaan rental
exports.getRentalUsage = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Validasi parameter tanggal
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Tanggal mulai dan akhir diperlukan' });
    }
    
    // Konversi ke objek Date untuk validasi
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Format tanggal tidak valid' });
    }
    
    // Dapatkan penggunaan berdasarkan tipe perangkat
    const usageByPS = await sequelize.query(`
      SELECT 
        d.device_type as name,
        COUNT(rs.session_id) as total_usage,
        SUM(TIMESTAMPDIFF(HOUR, rs.start_time, 
          IFNULL(rs.actual_end_time, rs.end_time))) as hours
      FROM rental_sessions rs
      JOIN devices d ON rs.device_id = d.device_id
      WHERE rs.start_time BETWEEN :startDate AND :endDate
      GROUP BY d.device_type
      ORDER BY d.device_type
    `, {
      replacements: { startDate, endDate },
      type: sequelize.QueryTypes.SELECT
    });
    
    // Perbaikan nama field untuk frontend
    const fixedUsageByPS = usageByPS.map(item => ({
      name: item.name,
      usage: parseInt(item.total_usage),
      hours: parseInt(item.hours || 0)
    }));
    
    // Dapatkan penggunaan berdasarkan jam
    const usageByHour = await sequelize.query(`
      SELECT 
        HOUR(start_time) as hour_num,
        CONCAT(HOUR(start_time), ':00') as hour,
        COUNT(session_id) as count
      FROM rental_sessions
      WHERE start_time BETWEEN :startDate AND :endDate
      GROUP BY HOUR(start_time), hour
      ORDER BY hour_num
    `, {
      replacements: { startDate, endDate },
      type: sequelize.QueryTypes.SELECT
    });
    
    res.json({
      byPS: fixedUsageByPS,
      byHour: usageByHour
    });
  } catch (error) {
    console.error('Error mendapatkan data penggunaan rental:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mendapatkan data penjualan untuk laporan
exports.getSalesData = async (req, res) => {
  try {
    const { startDate, endDate, groupBy } = req.query;
    
    // Validasi parameter tanggal
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Tanggal mulai dan akhir diperlukan' });
    }
    
    // Konversi ke objek Date untuk validasi
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Format tanggal tidak valid' });
    }
    
    let query;
    let groupFormat;
    let labelFormat;
    
    // Atur format tanggal berdasarkan pengelompokan
    if (groupBy === 'month') {
      groupFormat = '%Y-%m';
      labelFormat = '%b %Y';
    } else {
      // Default ke hari
      groupFormat = '%Y-%m-%d';
      labelFormat = '%e %b';
    }
    
    // Query untuk mendapatkan data penjualan yang dikelompokkan berdasarkan hari atau bulan
    query = `
      SELECT 
        DATE_FORMAT(t.transaction_time, '${groupFormat}') as date,
        DATE_FORMAT(t.transaction_time, '${labelFormat}') as label,
        SUM(CASE WHEN t.type = 'Rental' THEN t.amount ELSE 0 END) as rentalSales,
        SUM(CASE WHEN t.type = 'Food' THEN t.amount ELSE 0 END) as foodSales
      FROM transactions t
      WHERE t.transaction_time BETWEEN :startDate AND :endDate
      GROUP BY DATE_FORMAT(t.transaction_time, '${groupFormat}')
      ORDER BY date
    `;
    
    const salesData = await sequelize.query(query, {
      replacements: { startDate, endDate },
      type: sequelize.QueryTypes.SELECT
    });
    
    res.json(salesData);
  } catch (error) {
    console.error('Error mendapatkan data penjualan:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Fungsi getRecentTransactions yang sangat sederhana - GANTI SELURUH ISI FUNGSI
exports.getRecentTransactions = async (req, res) => {
  try {
    // Ambil parameter limit dari query
    const limit = parseInt(req.query.limit || 5);
    
    // Hanya ambil data transaksi tanpa join atau subquery
    const query = "SELECT * FROM transactions ORDER BY transaction_time DESC LIMIT ?";
    
    const transactions = await sequelize.query(query, {
      replacements: [limit],
      type: sequelize.QueryTypes.SELECT
    });
    
    // Format data untuk frontend
    const formattedTransactions = transactions.map(transaction => {
      // Buat data reference default berdasarkan tipe transaksi
      let reference = {};
      
      if (transaction.type === 'Rental') {
        reference = { 
          device_name: `PlayStation ${transaction.reference_id}`, 
          device_type: 'PS4' 
        };
      } else if (transaction.type === 'Food') {
        reference = { 
          items: ['Pesanan Makanan/Minuman'] 
        };
      }
      
      return {
        transaction_id: transaction.transaction_id,
        type: transaction.type,
        amount: transaction.amount,
        payment_method: transaction.payment_method,
        transaction_time: transaction.transaction_time,
        reference
      };
    });
    
    console.log('Berhasil mengambil transaksi:', formattedTransactions.length);
    res.json(formattedTransactions);
  } catch (error) {
    console.error('Error mendapatkan transaksi terbaru:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mendapatkan statistik penjualan harian
exports.getDailySales = async (req, res) => {
  try {
    const today = new Date();
    const todayStart = new Date(today.setHours(0, 0, 0, 0));
    const todayEnd = new Date(today.setHours(23, 59, 59, 999));
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStart = new Date(yesterday.setHours(0, 0, 0, 0));
    const yesterdayEnd = new Date(yesterday.setHours(23, 59, 59, 999));
    
    // Dapatkan penjualan hari ini
    const todaySalesQuery = `
      SELECT 
        SUM(amount) as total,
        SUM(CASE WHEN type = 'Rental' THEN amount ELSE 0 END) as rental,
        SUM(CASE WHEN type = 'Food' THEN amount ELSE 0 END) as food
      FROM transactions
      WHERE transaction_time BETWEEN :start AND :end
    `;
    
    const todaySales = await sequelize.query(todaySalesQuery, {
      replacements: { start: todayStart, end: todayEnd },
      type: sequelize.QueryTypes.SELECT
    });
    
    // Dapatkan penjualan kemarin
    const yesterdaySales = await sequelize.query(todaySalesQuery, {
      replacements: { start: yesterdayStart, end: yesterdayEnd },
      type: sequelize.QueryTypes.SELECT
    });
    
    const todayTotal = todaySales[0].total || 0;
    const yesterdayTotal = yesterdaySales[0].total || 0;
    
    // Hitung perubahan persentase
    let percentChange = 0;
    if (yesterdayTotal > 0) {
      percentChange = ((todayTotal - yesterdayTotal) / yesterdayTotal) * 100;
    }
    
    res.json({
      todaySales: todayTotal,
      todayRentalSales: todaySales[0].rental || 0,
      todayFoodSales: todaySales[0].food || 0,
      yesterday: yesterdayTotal,
      percentChange: parseFloat(percentChange.toFixed(2))
    });
  } catch (error) {
    console.error('Error mendapatkan penjualan harian:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
// Get Playbox report data
exports.getPlayboxReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Validate parameters
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Tanggal mulai dan akhir diperlukan' });
    }
    
    // Convert to Date objects for validation
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Format tanggal tidak valid' });
    }
    
    // Try to get playbox reservations data
    let reservations = [];
    try {
      // This query would be more complex in production, with proper joins
      reservations = await PlayboxReservation.findAll({
        where: {
          start_time: {
            [Op.between]: [startDate, endDate]
          }
        },
        include: [{ model: Playbox }],
        order: [['start_time', 'DESC']]
      });
    } catch (err) {
      console.log('Could not fetch reservations data', err);
      // Continue with empty array if query fails
    }
    
    // Calculate status distribution
    const statusCounts = {
      Completed: 0,
      Cancelled: 0,
      'In Use': 0,
      Pending: 0
    };
    
    reservations.forEach(reservation => {
      if (statusCounts[reservation.status] !== undefined) {
        statusCounts[reservation.status]++;
      } else {
        statusCounts['Pending']++; // Default bucket
      }
    });
    
    const statusDistribution = Object.keys(statusCounts).map(key => ({
      name: key,
      value: statusCounts[key]
    }));
    
    // Calculate revenue by playbox
    const revenueByPlaybox = await sequelize.query(`
      SELECT 
        p.playbox_name as name,
        SUM(pr.total_amount) as revenue
      FROM playbox_reservations pr
      JOIN playboxes p ON pr.playbox_id = p.playbox_id
      WHERE pr.start_time BETWEEN :startDate AND :endDate
      AND pr.status IN ('Completed', 'In Use')
      GROUP BY p.playbox_id, p.playbox_name
      ORDER BY revenue DESC
    `, {
      replacements: { startDate, endDate },
      type: sequelize.QueryTypes.SELECT
    }).catch(err => {
      console.log('Could not fetch revenue data', err);
      return [];
    });
    
    // Calculate popular time slots
    const popularTimeSlots = await sequelize.query(`
      SELECT 
        CONCAT(HOUR(start_time), ':00') as hour,
        COUNT(*) as count
      FROM playbox_reservations
      WHERE start_time BETWEEN :startDate AND :endDate
      GROUP BY HOUR(start_time)
      ORDER BY HOUR(start_time)
    `, {
      replacements: { startDate, endDate },
      type: sequelize.QueryTypes.SELECT
    }).catch(err => {
      console.log('Could not fetch time slot data', err);
      return [];
    });
    
    // Calculate summary statistics
    const totalReservations = reservations.length;
    const totalRevenue = reservations.reduce((sum, res) => sum + res.total_amount, 0);
    const completedReservations = reservations.filter(res => res.status === 'Completed').length;
    const completionRate = totalReservations ? Math.round((completedReservations / totalReservations) * 100) : 0;
    
    // Calculate average duration
    let totalDuration = 0;
    let countForAvg = 0;
    
    reservations.forEach(res => {
      if (res.start_time && res.end_time) {
        const start = new Date(res.start_time);
        const end = new Date(res.end_time);
        const durationHours = (end - start) / (1000 * 60 * 60);
        
        if (!isNaN(durationHours) && durationHours > 0) {
          totalDuration += durationHours;
          countForAvg++;
        }
      }
    });
    
    const avgDuration = countForAvg > 0 ? parseFloat((totalDuration / countForAvg).toFixed(1)) : 0;
    
    // Return compiled report data
    res.json({
      reservations,
      statusDistribution,
      revenueByPlaybox,
      popularTimeSlots,
      summary: {
        totalReservations,
        totalRevenue,
        completionRate,
        avgDuration
      }
    });
  } catch (error) {
    console.error('Error generating Playbox report:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
// Add to server/src/controllers/reportController.js

// Get PlayStation report data
exports.getPlayStationReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Validate parameters
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start and end dates are required' });
    }
    
    // Convert to Date objects for validation
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }
    
    // Get device statistics
    const deviceStats = await sequelize.query(`
      SELECT 
        d.device_type,
        COUNT(d.device_id) as count,
        SUM(CASE WHEN d.status = 'Available' THEN 1 ELSE 0 END) as available,
        SUM(CASE WHEN d.status = 'In Use' THEN 1 ELSE 0 END) as in_use,
        SUM(CASE WHEN d.status = 'Maintenance' THEN 1 ELSE 0 END) as maintenance
      FROM devices d
      WHERE d.device_type LIKE 'PS%'
      GROUP BY d.device_type
      ORDER BY d.device_type
    `, {
      type: sequelize.QueryTypes.SELECT
    });
    
    // Get device revenue
    const deviceRevenue = await sequelize.query(`
      SELECT 
        d.device_type,
        SUM(t.amount) as revenue
      FROM transactions t
      JOIN rental_sessions rs ON t.reference_id = rs.session_id AND t.type = 'Rental'
      JOIN devices d ON rs.device_id = d.device_id
      WHERE t.transaction_time BETWEEN :startDate AND :endDate
      GROUP BY d.device_type
      ORDER BY revenue DESC
    `, {
      replacements: { startDate, endDate },
      type: sequelize.QueryTypes.SELECT
    });
    
    // Get sessions by device type
    const sessionsByDeviceType = await sequelize.query(`
      SELECT 
        d.device_type,
        COUNT(rs.session_id) as count,
        SUM(TIMESTAMPDIFF(HOUR, rs.start_time, 
          IFNULL(rs.actual_end_time, rs.end_time))) as total_hours
      FROM rental_sessions rs
      JOIN devices d ON rs.device_id = d.device_id
      WHERE rs.start_time BETWEEN :startDate AND :endDate
      GROUP BY d.device_type
      ORDER BY count DESC
    `, {
      replacements: { startDate, endDate },
      type: sequelize.QueryTypes.SELECT
    });
    
    // Get popular devices
    const popularDevices = await sequelize.query(`
      SELECT 
        d.device_id,
        d.device_name,
        d.device_type,
        COUNT(rs.session_id) as session_count,
        SUM(TIMESTAMPDIFF(HOUR, rs.start_time, 
          IFNULL(rs.actual_end_time, rs.end_time))) as total_hours
      FROM rental_sessions rs
      JOIN devices d ON rs.device_id = d.device_id
      WHERE rs.start_time BETWEEN :startDate AND :endDate
      GROUP BY d.device_id, d.device_name, d.device_type
      ORDER BY session_count DESC
      LIMIT 5
    `, {
      replacements: { startDate, endDate },
      type: sequelize.QueryTypes.SELECT
    });
    
    // Get usage by hour
    const usageByHour = await sequelize.query(`
      SELECT 
        HOUR(rs.start_time) as hour,
        CONCAT(HOUR(rs.start_time), ':00') as hour_label,
        COUNT(rs.session_id) as count
      FROM rental_sessions rs
      WHERE rs.start_time BETWEEN :startDate AND :endDate
      GROUP BY HOUR(rs.start_time), hour_label
      ORDER BY hour
    `, {
      replacements: { startDate, endDate },
      type: sequelize.QueryTypes.SELECT
    }).then(results => results.map(r => ({ hour: r.hour_label, count: r.count })));
    
    // Get usage by day
    const usageByDay = await sequelize.query(`
      SELECT 
        DATE(rs.start_time) as date,
        COUNT(rs.session_id) as session_count
      FROM rental_sessions rs
      WHERE rs.start_time BETWEEN :startDate AND :endDate
      GROUP BY DATE(rs.start_time)
      ORDER BY date
    `, {
      replacements: { startDate, endDate },
      type: sequelize.QueryTypes.SELECT
    });
    
    // Calculate summary statistics
    const totalSessions = sessionsByDeviceType.reduce((sum, item) => sum + parseInt(item.count), 0);
    const totalRevenue = deviceRevenue.reduce((sum, item) => sum + parseInt(item.revenue || 0), 0);
    const totalHours = sessionsByDeviceType.reduce((sum, item) => sum + parseInt(item.total_hours || 0), 0);
    const averageSessionLength = totalSessions > 0 ? (totalHours / totalSessions) : 0;
    
    // Calculate utilization rate (simplified)
    const totalDevices = deviceStats.reduce((sum, item) => sum + parseInt(item.count), 0);
    const totalAvailableHours = (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60);
    const utilizationRate = totalDevices > 0 ? 
      ((totalHours / (totalDevices * totalAvailableHours)) * 100) : 0;
    
    res.json({
      deviceStats,
      deviceRevenue,
      sessionsByDeviceType,
      popularDevices,
      usageByHour,
      usageByDay,
      summary: {
        totalSessions,
        totalRevenue,
        totalHours,
        averageSessionLength: parseFloat(averageSessionLength.toFixed(1)),
        utilizationRate: parseFloat(utilizationRate.toFixed(1))
      }
    });
    
  } catch (error) {
    console.error('Error generating PlayStation report:', error);
    res.status(500).json({ 
      message: 'Failed to generate PlayStation report', 
      error: error.message 
    });
  }
};

// server/src/controllers/reportController.js
// Add this function to your existing reportController.js file

// Get Food & Beverage report data
exports.getFoodBeverageReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Validate parameters
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Tanggal mulai dan akhir diperlukan' });
    }
    
    // Validate date format
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Format tanggal tidak valid' });
    }
    
    // Get sales by category
    const categorySalesQuery = `
      SELECT 
        fi.category AS name,
        SUM(oi.subtotal) AS value
      FROM food_orders fo
      JOIN order_items oi ON fo.order_id = oi.order_id
      JOIN food_items fi ON oi.item_id = fi.item_id
      WHERE fo.order_time BETWEEN ? AND ?
        AND fo.status != 'Cancelled'
      GROUP BY fi.category
      ORDER BY value DESC
    `;
    
    const categorySales = await sequelize.query(categorySalesQuery, {
      replacements: [startDate, endDate],
      type: sequelize.QueryTypes.SELECT
    });
    
    // Get top selling items
    const topItemsQuery = `
      SELECT 
        fi.name,
        fi.category,
        SUM(oi.quantity) AS quantity,
        SUM(oi.subtotal) AS revenue
      FROM food_orders fo
      JOIN order_items oi ON fo.order_id = oi.order_id
      JOIN food_items fi ON oi.item_id = fi.item_id
      WHERE fo.order_time BETWEEN ? AND ?
        AND fo.status != 'Cancelled'
      GROUP BY fi.item_id, fi.name, fi.category
      ORDER BY revenue DESC
      LIMIT 10
    `;
    
    const topItems = await sequelize.query(topItemsQuery, {
      replacements: [startDate, endDate],
      type: sequelize.QueryTypes.SELECT
    });
    
    // Get monthly sales data
    const monthlySalesQuery = `
      SELECT 
        DATE_FORMAT(fo.order_time, '%Y-%m') AS month_date,
        DATE_FORMAT(fo.order_time, '%b %Y') AS month,
        MAX(CASE WHEN fi.category = 'Food' THEN sales ELSE 0 END) AS Food,
        MAX(CASE WHEN fi.category = 'Drink' THEN sales ELSE 0 END) AS Drink,
        MAX(CASE WHEN fi.category = 'Snack' THEN sales ELSE 0 END) AS Snack
      FROM (
        SELECT 
          DATE_FORMAT(fo.order_time, '%Y-%m') AS month,
          fi.category,
          SUM(oi.subtotal) AS sales
        FROM food_orders fo
        JOIN order_items oi ON fo.order_id = oi.order_id
        JOIN food_items fi ON oi.item_id = fi.item_id
        WHERE fo.order_time BETWEEN ? AND ?
          AND fo.status != 'Cancelled'
        GROUP BY DATE_FORMAT(fo.order_time, '%Y-%m'), fi.category
      ) AS sales_data
      JOIN food_orders fo ON DATE_FORMAT(fo.order_time, '%Y-%m') = sales_data.month
      JOIN order_items oi ON fo.order_id = oi.order_id
      JOIN food_items fi ON oi.item_id = fi.item_id
      GROUP BY month_date, month
      ORDER BY month_date
    `;
    
    const monthlySales = await sequelize.query(monthlySalesQuery, {
      replacements: [startDate, endDate],
      type: sequelize.QueryTypes.SELECT
    });
    
    // Get stock status data
    const stockStatusQuery = `
      SELECT
        CASE
          WHEN stock_quantity <= 5 THEN 'Stok Kritis'
          WHEN stock_quantity <= 10 THEN 'Stok Rendah'
          ELSE 'Stok Mencukupi'
        END AS name,
        COUNT(*) AS value
      FROM food_items
      WHERE is_available = true
      GROUP BY name
    `;
    
    const stockStatus = await sequelize.query(stockStatusQuery, {
      type: sequelize.QueryTypes.SELECT
    });
    
    // Get low stock items
    const lowStockItemsQuery = `
      SELECT 
        item_id,
        name,
        category,
        stock_quantity,
        10 as min_stock
      FROM food_items
      WHERE stock_quantity <= 10
        AND is_available = true
      ORDER BY stock_quantity ASC
    `;
    
    const lowStockItems = await sequelize.query(lowStockItemsQuery, {
      type: sequelize.QueryTypes.SELECT
    });
    
    // Get inventory summary
    const inventorySummaryQuery = `
      SELECT
        COUNT(*) as totalItems,
        SUM(CASE WHEN category = 'Food' THEN 1 ELSE 0 END) as foodCount,
        SUM(CASE WHEN category = 'Drink' THEN 1 ELSE 0 END) as drinkCount,
        SUM(CASE WHEN category = 'Snack' THEN 1 ELSE 0 END) as snackCount,
        SUM(CASE WHEN stock_quantity <= 5 THEN 1 ELSE 0 END) as criticalCount,
        SUM(CASE WHEN stock_quantity > 5 AND stock_quantity <= 10 THEN 1 ELSE 0 END) as lowCount
      FROM food_items
      WHERE is_available = true
    `;
    
    const inventorySummaryResult = await sequelize.query(inventorySummaryQuery, {
      type: sequelize.QueryTypes.SELECT
    });
    
    // Calculate summary
    const totalSalesQuery = `
      SELECT SUM(total_amount) as total
      FROM food_orders
      WHERE order_time BETWEEN ? AND ?
        AND status != 'Cancelled'
    `;
    
    const totalSalesResult = await sequelize.query(totalSalesQuery, {
      replacements: [startDate, endDate],
      type: sequelize.QueryTypes.SELECT
    });
    
    const totalItemsQuery = `
      SELECT SUM(oi.quantity) as total
      FROM food_orders fo
      JOIN order_items oi ON fo.order_id = oi.order_id
      WHERE fo.order_time BETWEEN ? AND ?
        AND fo.status != 'Cancelled'
    `;
    
    const totalItemsResult = await sequelize.query(totalItemsQuery, {
      replacements: [startDate, endDate],
      type: sequelize.QueryTypes.SELECT
    });
    
    const orderCountQuery = `
      SELECT COUNT(*) as count
      FROM food_orders
      WHERE order_time BETWEEN ? AND ?
        AND status != 'Cancelled'
    `;
    
    const orderCountResult = await sequelize.query(orderCountQuery, {
      replacements: [startDate, endDate],
      type: sequelize.QueryTypes.SELECT
    });
    
    // Calculate average order value
    const totalSales = totalSalesResult[0]?.total || 0;
    const orderCount = orderCountResult[0]?.count || 0;
    const avgOrderValue = orderCount > 0 ? totalSales / orderCount : 0;
    
    // Get top category
    const topCategory = categorySales.length > 0 ? categorySales[0].name : '';
    
    // Prepare response data
    const reportData = {
      categorySales,
      topItems,
      monthlySales,
      stockStatus,
      lowStockItems,
      inventorySummary: inventorySummaryResult[0] || {
        totalItems: 0,
        foodCount: 0,
        drinkCount: 0,
        snackCount: 0,
        criticalCount: 0,
        lowCount: 0
      },
      summary: {
        totalSales,
        totalItems: totalItemsResult[0]?.total || 0,
        avgOrderValue,
        topCategory
      }
    };
    
    res.json(reportData);
  } catch (error) {
    console.error('Error generating Food & Beverage report:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// server/src/controllers/reportController.js
// Add this function to your existing reportController.js file

// Get Stock Alert System report data
exports.getStockAlerts = async (req, res) => {
  try {
    // Get critical stock items (stock <= 5)
    const criticalItemsQuery = `
      SELECT 
        item_id,
        name,
        category,
        stock_quantity,
        10 as min_stock,
        is_available,
        (
          SELECT DATE_FORMAT(fo.order_time, '%Y-%m-%d')
          FROM food_orders fo
          JOIN order_items oi ON fo.order_id = oi.order_id
          WHERE oi.item_id = fi.item_id
          ORDER BY fo.order_time DESC
          LIMIT 1
        ) as last_sold
      FROM food_items fi
      WHERE stock_quantity <= 5
        AND is_available = true
      ORDER BY stock_quantity ASC
    `;
    
    const criticalItems = await sequelize.query(criticalItemsQuery, {
      type: sequelize.QueryTypes.SELECT
    });
    
    // Get low stock items (stock > 5 and <= 10)
    const lowItemsQuery = `
      SELECT 
        item_id,
        name,
        category,
        stock_quantity,
        10 as min_stock,
        is_available,
        (
          SELECT DATE_FORMAT(fo.order_time, '%Y-%m-%d')
          FROM food_orders fo
          JOIN order_items oi ON fo.order_id = oi.order_id
          WHERE oi.item_id = fi.item_id
          ORDER BY fo.order_time DESC
          LIMIT 1
        ) as last_sold
      FROM food_items fi
      WHERE stock_quantity > 5 
        AND stock_quantity <= 10
        AND is_available = true
      ORDER BY stock_quantity ASC
    `;
    
    const lowItems = await sequelize.query(lowItemsQuery, {
      type: sequelize.QueryTypes.SELECT
    });
    
    // Get recent transactions for low stock items
    const recentTransactionsQuery = `
      SELECT 
        fi.name as item_name,
        oi.quantity,
        fo.order_time as transaction_time
      FROM food_orders fo
      JOIN order_items oi ON fo.order_id = oi.order_id
      JOIN food_items fi ON oi.item_id = fi.item_id
      WHERE fi.stock_quantity <= 10
        AND fi.is_available = true
        AND fo.status != 'Cancelled'
      ORDER BY fo.order_time DESC
      LIMIT 10
    `;
    
    const recentTransactions = await sequelize.query(recentTransactionsQuery, {
      type: sequelize.QueryTypes.SELECT
    });
    
    // Get inventory summary
    const inventorySummaryQuery = `
      SELECT 
        COUNT(*) as totalItems,
        SUM(CASE WHEN stock_quantity <= 5 THEN 1 ELSE 0 END) as criticalCount,
        SUM(CASE WHEN stock_quantity > 5 AND stock_quantity <= 10 THEN 1 ELSE 0 END) as lowCount,
        SUM(CASE WHEN stock_quantity > 10 THEN 1 ELSE 0 END) as sufficientCount,
        (SUM(CASE WHEN stock_quantity <= 5 THEN 1 ELSE 0 END) / COUNT(*)) * 100 as stockoutPercentage
      FROM food_items
      WHERE is_available = true
    `;
    
    const inventorySummaryResult = await sequelize.query(inventorySummaryQuery, {
      type: sequelize.QueryTypes.SELECT
    });
    
    // Prepare response data
    const stockAlerts = {
      criticalItems,
      lowItems,
      recentTransactions,
      summary: inventorySummaryResult[0] || {
        totalItems: 0,
        criticalCount: 0,
        lowCount: 0,
        sufficientCount: 0,
        stockoutPercentage: 0
      }
    };
    
    res.json(stockAlerts);
  } catch (error) {
    console.error('Error generating stock alerts report:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};