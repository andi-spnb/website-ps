const { 
  RentalSession, 
  Device, 
  Transaction, 
  FoodOrder,
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