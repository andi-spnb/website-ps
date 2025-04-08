const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const deviceRoutes = require('./routes/deviceRoutes');
const shiftRoutes = require('./routes/shiftRoutes');
const rentalRoutes = require('./routes/rentalRoutes');
const foodRoutes = require('./routes/foodRoutes');
const reportRoutes = require('./routes/reportRoutes');
const memberRoutes = require('./routes/memberRoutes');
const staffRoutes = require('./routes/staffRoutes');
const playboxRoutes = require('./routes/playboxRoutes');
const pricingRoutes = require('./routes/pricingRoutes');
const playboxPricingRoutes = require('./routes/playboxPricingRoutes');

// Buat instance Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/playbox', playboxRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/playbox-pricing', playboxPricingRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Terjadi kesalahan pada server', error: err.message });
});

app.listen(PORT, () => {
  console.log(`Server berjalan pada port ${PORT}`);
  console.log('Routes tersedia:');
  console.log('- GET /api/playbox-pricing');
  console.log('- GET /api/playbox-pricing/:id');
  console.log('- POST /api/playbox-pricing');
  console.log('- PUT /api/playbox-pricing/:id');
  console.log('- DELETE /api/playbox-pricing/:id');
});

// Fungsi synchronize database
const { sequelize, PlayboxPricing } = require('./models');
const syncDatabase = async () => {
  try {
    // Sinkronisasi database umum
    await sequelize.sync({ alter: false });
    console.log('Database synchronized successfully');
    
    // Pastikan tabel PlayboxPricing telah dibuat
    await PlayboxPricing.sync({ alter: true });
    console.log('PlayboxPricing table synchronized successfully');
  } catch (error) {
    console.error('Error synchronizing database:', error);
  }
};

syncDatabase();
module.exports = app;