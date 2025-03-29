const express = require('express');
const cors = require('cors');
// const path = require('path'); // Komentar atau hapus baris ini
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

// Hapus kode berikut pada lingkungan development
// // Static files
// app.use(express.static(path.join(__dirname, '../../client/build')));
//
// // Serve React app
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '../../client/build', 'index.html'));
// });

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Terjadi kesalahan pada server', error: err.message });
});

app.listen(PORT, () => {
  console.log(`Server berjalan pada port ${PORT}`);
});

module.exports = app;