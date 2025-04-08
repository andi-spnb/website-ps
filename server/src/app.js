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

// ===== TAMBAHKAN ROUTE PLAYBOX PRICING LANGSUNG DISINI =====
// Data contoh untuk Playbox Pricing
const playboxPricingData = [
  {
    price_id: 101,
    name: 'Paket Standar Playbox',
    base_price: 50000,
    hourly_rate: 10000,
    min_hours: 3,
    delivery_fee: 20000,
    weekend_surcharge: 10000,
    deposit_amount: 300000,
    is_active: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    price_id: 102,
    name: 'Paket Premium Playbox',
    base_price: 70000,
    hourly_rate: 15000,
    min_hours: 3,
    delivery_fee: 0,
    weekend_surcharge: 20000,
    deposit_amount: 500000,
    is_active: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// GET - Dapatkan semua harga Playbox
app.get('/api/playbox-pricing', (req, res) => {
  res.json(playboxPricingData);
});

// GET - Dapatkan harga Playbox berdasarkan ID
app.get('/api/playbox-pricing/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const pricing = playboxPricingData.find(p => p.price_id === id);
  
  if (!pricing) {
    return res.status(404).json({ message: 'Harga Playbox tidak ditemukan' });
  }
  
  res.json(pricing);
});

// POST - Tambah harga Playbox baru
app.post('/api/playbox-pricing', (req, res) => {
  const { name, base_price, hourly_rate, min_hours, delivery_fee, weekend_surcharge, deposit_amount } = req.body;
  
  // Validasi
  if (!name || !base_price || !hourly_rate) {
    return res.status(400).json({ message: 'Nama, harga dasar, dan harga per jam harus diisi' });
  }
  
  // Generate ID baru
  const price_id = playboxPricingData.length > 0 
    ? Math.max(...playboxPricingData.map(p => p.price_id)) + 1 
    : 101;
  
  // Buat data baru
  const newPricing = {
    price_id,
    name,
    base_price: parseFloat(base_price),
    hourly_rate: parseFloat(hourly_rate),
    min_hours: parseInt(min_hours) || 1,
    delivery_fee: parseFloat(delivery_fee) || 0,
    weekend_surcharge: parseFloat(weekend_surcharge) || 0,
    deposit_amount: parseFloat(deposit_amount) || 0,
    is_active: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  // Tambahkan ke array
  playboxPricingData.push(newPricing);
  
  res.status(201).json(newPricing);
});

// PUT - Update harga Playbox
app.put('/api/playbox-pricing/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { name, base_price, hourly_rate, min_hours, delivery_fee, weekend_surcharge, deposit_amount } = req.body;
  
  // Cari index
  const index = playboxPricingData.findIndex(p => p.price_id === id);
  
  if (index === -1) {
    return res.status(404).json({ message: 'Harga Playbox tidak ditemukan' });
  }
  
  // Update data
  playboxPricingData[index] = {
    ...playboxPricingData[index],
    name,
    base_price: parseFloat(base_price),
    hourly_rate: parseFloat(hourly_rate),
    min_hours: parseInt(min_hours) || 1,
    delivery_fee: parseFloat(delivery_fee) || 0,
    weekend_surcharge: parseFloat(weekend_surcharge) || 0,
    deposit_amount: parseFloat(deposit_amount) || 0,
    updatedAt: new Date()
  };
  
  res.json(playboxPricingData[index]);
});

// DELETE - Hapus harga Playbox
app.delete('/api/playbox-pricing/:id', (req, res) => {
  const id = parseInt(req.params.id);
  
  // Cari index
  const index = playboxPricingData.findIndex(p => p.price_id === id);
  
  if (index === -1) {
    return res.status(404).json({ message: 'Harga Playbox tidak ditemukan' });
  }
  
  // Tandai tidak aktif (soft delete)
  playboxPricingData[index].is_active = false;
  playboxPricingData[index].updatedAt = new Date();
  
  res.json({ message: 'Harga Playbox berhasil dihapus' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Terjadi kesalahan pada server', error: err.message });
});

app.listen(PORT, () => {
  console.log(`Server berjalan pada port ${PORT}`);
  // Log semua route yang tersedia
  console.log('Routes tersedia:');
  console.log('- GET /api/playbox-pricing');
  console.log('- GET /api/playbox-pricing/:id');
  console.log('- POST /api/playbox-pricing');
  console.log('- PUT /api/playbox-pricing/:id');
  console.log('- DELETE /api/playbox-pricing/:id');
});

// Fungsi synchronize database
const { sequelize } = require('./models');
const syncDatabase = async () => {
  try {
    // Tidak menggunakan alter yang agresif untuk menghindari error
    await sequelize.sync({ alter: false });
    console.log('Database synchronized successfully');
  } catch (error) {
    console.error('Error synchronizing database:', error);
  }
};

syncDatabase();
module.exports = app;