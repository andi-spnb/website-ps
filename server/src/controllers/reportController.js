const { 
    Transaction, 
    RentalSession, 
    Device, 
    FoodOrder, 
    Staff, 
    sequelize 
  } = require('../models');
  const { Op } = require('sequelize');
  
  // Get daily sales
  exports.getDailySales = async (req, res) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      // Get today's sales
      const todaySales = await Transaction.sum('amount', {
        where: {
          transaction_time: {
            [Op.gte]: today
          }
        }
      });
      
      // Get today's rental sales
      const todayRentalSales = await Transaction.sum('amount', {
        where: {
          type: 'Rental',
          transaction_time: {
            [Op.gte]: today
          }
        }
      });
      
      // Get today's food sales
      const todayFoodSales = await Transaction.sum('amount', {
        where: {
          type: 'Food',
          transaction_time: {
            [Op.gte]: today
          }
        }
      });
      
      // Get yesterday's sales
      const yesterdaySales = await Transaction.sum('amount', {
        where: {
          transaction_time: {
            [Op.gte]: yesterday,
            [Op.lt]: today
          }
        }
      });
      
      // Calculate percent change
      const percentChange = yesterdaySales 
        ? Math.round(((todaySales - yesterdaySales) / yesterdaySales) * 100 * 100) / 100
        : 0;
      
      res.json({
        todaySales: todaySales || 0,
        todayRentalSales: todayRentalSales || 0,
        todayFoodSales: todayFoodSales || 0,
        yesterday: yesterdaySales || 0,
        percentChange
      });
    } catch (error) {
      console.error('Error getting daily sales:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
  
  // Get recent transactions
  exports.getRecentTransactions = async (req, res) => {
    try {
      const { limit = 5 } = req.query;
      
      const transactions = await Transaction.findAll({
        order: [['transaction_time', 'DESC']],
        limit: parseInt(limit)
      });
      
      // Enrich with reference data
      const enrichedTransactions = await Promise.all(
        transactions.map(async transaction => {
          let reference = {};
          if (transaction.type === 'Rental' && transaction.reference_id) {
            const session = await RentalSession.findByPk(transaction.reference_id, {
              include: [{ model: Device, attributes: ['device_name', 'device_type'] }]
            });
            if (session && session.Device) {
              reference = {
                device_name: session.Device.device_name,
                device_type: session.Device.device_type
              };
            }
          } else if (transaction.type === 'Food' && transaction.reference_id) {
            const order = await FoodOrder.findByPk(transaction.reference_id);
            if (order) {
              // Simplify for demo
              reference = {
                items: ['Makanan', 'Minuman'] // Placeholder
              };
            }
          }
          
          return {
            ...transaction.toJSON(),
            reference
          };
        })
      );
      
      res.json(enrichedTransactions);
    } catch (error) {
      console.error('Error getting recent transactions:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
  
  // Get sales report
  exports.getSalesReport = async (req, res) => {
    try {
      const { startDate, endDate, groupBy = 'day' } = req.query;
      
      let start = startDate ? new Date(startDate) : new Date();
      start.setHours(0, 0, 0, 0);
      if (!startDate) {
        start.setDate(start.getDate() - 6); // Last 7 days by default
      }
      
      const end = endDate ? new Date(endDate) : new Date();
      end.setHours(23, 59, 59, 999);
      
      let format, interval;
      if (groupBy === 'month') {
        format = "DATE_FORMAT(transaction_time, '%Y-%m')";
        interval = "MONTH";
      } else {
        format = "DATE(transaction_time)";
        interval = "DAY";
      }
      
      // Mock data structure
      const mockData = [];
      
      if (groupBy === 'month') {
        // Generate 6 months of data
        for (let i = 5; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          mockData.push({
            date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
            label: date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }),
            rentalSales: Math.floor(Math.random() * 3000000) + 2000000,
            foodSales: Math.floor(Math.random() * 1500000) + 1000000
          });
        }
      } else {
        // Generate daily data
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          mockData.push({
            date: date.toISOString().split('T')[0],
            label: date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
            rentalSales: Math.floor(Math.random() * 700000) + 500000,
            foodSales: Math.floor(Math.random() * 300000) + 200000
          });
        }
      }
      
      res.json(mockData);
    } catch (error) {
      console.error('Error getting sales report:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
  
  // Get rental usage report
  exports.getRentalUsageReport = async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      // Mock data
      const byPS = [
        { name: 'PS3', usage: 125, hours: 250 },
        { name: 'PS4', usage: 320, hours: 640 },
        { name: 'PS5', usage: 210, hours: 420 }
      ];
      
      const byHour = [];
      for (let i = 8; i <= 23; i++) {
        byHour.push({
          hour: `${i}:00`,
          count: Math.floor(Math.random() * 30) + 10
        });
      }
      
      res.json({
        byPS,
        byHour
      });
    } catch (error) {
      console.error('Error getting rental usage report:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };