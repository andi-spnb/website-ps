const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const deviceRoutes = require('./routes/deviceRoutes');
const rentalRoutes = require('./routes/rentalRoutes');
const foodRoutes = require('./routes/foodRoutes');
// Tambahkan routes lain yang dibutuhkan

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/food', foodRoutes);
// Tambahkan penggunaan routes lain

// Cek koneksi database
const db = require('./config/database');

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Kenzie Gaming API' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;