const { PlayboxPricing, sequelize } = require('../models');
const { Op } = require('sequelize');

// Mendapatkan semua data harga Playbox
exports.getAllPricing = async (req, res) => {
  try {
    console.log("Fetching all pricing data");
    const pricing = await PlayboxPricing.findAll({
      order: [['is_active', 'DESC'], ['name', 'ASC']]
    });
    
    console.log(`Retrieved ${pricing.length} pricing items`);
    res.json(pricing);
  } catch (error) {
    console.error('Error fetching playbox pricing:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mendapatkan data harga Playbox yang aktif
exports.getActivePricing = async (req, res) => {
  try {
    console.log("Fetching active pricing data");
    const pricing = await PlayboxPricing.findAll({
      where: { is_active: true },
      order: [['name', 'ASC']]
    });
    
    console.log(`Retrieved ${pricing.length} active pricing items`);
    res.json(pricing);
  } catch (error) {
    console.error('Error fetching active playbox pricing:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mendapatkan data harga Playbox berdasarkan ID
exports.getPricingById = async (req, res) => {
  try {
    console.log(`Fetching pricing with ID: ${req.params.id}`);
    const pricing = await PlayboxPricing.findByPk(req.params.id);
    
    if (!pricing) {
      console.log(`Pricing with ID ${req.params.id} not found`);
      return res.status(404).json({ message: 'Data harga tidak ditemukan' });
    }
    
    res.json(pricing);
  } catch (error) {
    console.error('Error fetching playbox pricing by ID:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
exports.createPricing = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    console.log("Received request to create new pricing:", req.body);
    
    const { 
      name, 
      base_price, 
      hourly_rate, 
      min_hours, 
      delivery_fee, 
      weekend_surcharge, 
      deposit_amount,
      package_12h_price,
      package_24h_price,
      is_active,
      // Field baru untuk paket tetap
      is_fixed_package,
      fixed_start_time,
      fixed_end_time
    } = req.body;
    
    // Hitung durasi tetap jika ini adalah paket tetap
    let fixed_duration = null;
    if (is_fixed_package && fixed_start_time && fixed_end_time) {
      // Konversi waktu ke menit untuk menghitung durasi
      const startParts = fixed_start_time.split(':').map(Number);
      const endParts = fixed_end_time.split(':').map(Number);
      
      let startMinutes = startParts[0] * 60 + startParts[1];
      let endMinutes = endParts[0] * 60 + endParts[1];
      
      // Jika waktu akhir lebih kecil dari waktu mulai, berarti melewati tengah malam
      if (endMinutes < startMinutes) {
        endMinutes += 24 * 60; // Tambah 24 jam dalam menit
      }
      
      fixed_duration = Math.round((endMinutes - startMinutes) / 60);
    }
    
    // Validasi data
    if (!name || base_price === undefined || hourly_rate === undefined) {
      console.log("Validation failed: missing required fields");
      await transaction.rollback();
      return res.status(400).json({ message: 'Nama, harga dasar, dan tarif per jam wajib diisi' });
    }
    
    // Validasi tambahan untuk paket tetap
    if (is_fixed_package && (!fixed_start_time || !fixed_end_time)) {
      console.log("Validation failed: fixed package missing time details");
      await transaction.rollback();
      return res.status(400).json({ message: 'Paket tetap harus diisi dengan waktu mulai dan selesai' });
    }
    
    // Buat data harga baru
    const newPricing = await PlayboxPricing.create({
      name,
      base_price: parseFloat(base_price),
      hourly_rate: parseFloat(hourly_rate),
      min_hours: min_hours !== undefined ? parseInt(min_hours) : 3,
      delivery_fee: delivery_fee !== undefined ? parseFloat(delivery_fee) : 0,
      weekend_surcharge: weekend_surcharge !== undefined ? parseFloat(weekend_surcharge) : 0,
      deposit_amount: deposit_amount !== undefined ? parseFloat(deposit_amount) : 0,
      package_12h_price: package_12h_price !== undefined ? parseFloat(package_12h_price) : null,
      package_24h_price: package_24h_price !== undefined ? parseFloat(package_24h_price) : null,
      is_active: is_active !== undefined ? is_active : true,
      // Field baru untuk paket tetap
      is_fixed_package: is_fixed_package || false,
      fixed_start_time: fixed_start_time || null,
      fixed_end_time: fixed_end_time || null,
      fixed_duration: fixed_duration
    }, { transaction });
    
    console.log("Successfully created new pricing with ID:", newPricing.price_id);
    
    await transaction.commit();
    
    res.status(201).json({
      message: 'Data harga Playbox berhasil dibuat',
      pricing: newPricing
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating playbox pricing:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
exports.updatePricing = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    console.log(`Received request to update pricing ID: ${req.params.id}`, req.body);
    
    const { 
      name, 
      base_price, 
      hourly_rate, 
      min_hours, 
      delivery_fee, 
      weekend_surcharge, 
      deposit_amount,
      package_12h_price,
      package_24h_price,
      description, 
      is_active,
      // Field baru untuk paket tetap
      is_fixed_package,
      fixed_start_time,
      fixed_end_time
    } = req.body;
    
    const pricing = await PlayboxPricing.findByPk(req.params.id, { transaction });
    
    if (!pricing) {
      console.log(`Pricing with ID ${req.params.id} not found`);
      await transaction.rollback();
      return res.status(404).json({ message: 'Data harga tidak ditemukan' });
    }
    
    // Hitung durasi tetap jika ini adalah paket tetap
    let fixed_duration = null;
    if (is_fixed_package && fixed_start_time && fixed_end_time) {
      // Konversi waktu ke menit untuk menghitung durasi
      const startParts = fixed_start_time.split(':').map(Number);
      const endParts = fixed_end_time.split(':').map(Number);
      
      let startMinutes = startParts[0] * 60 + startParts[1];
      let endMinutes = endParts[0] * 60 + endParts[1];
      
      // Jika waktu akhir lebih kecil dari waktu mulai, berarti melewati tengah malam
      if (endMinutes < startMinutes) {
        endMinutes += 24 * 60; // Tambah 24 jam dalam menit
      }
      
      fixed_duration = Math.round((endMinutes - startMinutes) / 60);
    }
    
    // Update data
    await pricing.update({
      name: name !== undefined ? name : pricing.name,
      base_price: base_price !== undefined ? parseFloat(base_price) : pricing.base_price,
      hourly_rate: hourly_rate !== undefined ? parseFloat(hourly_rate) : pricing.hourly_rate,
      min_hours: min_hours !== undefined ? parseInt(min_hours) : pricing.min_hours,
      delivery_fee: delivery_fee !== undefined ? parseFloat(delivery_fee) : pricing.delivery_fee,
      weekend_surcharge: weekend_surcharge !== undefined ? parseFloat(weekend_surcharge) : pricing.weekend_surcharge,
      deposit_amount: deposit_amount !== undefined ? parseFloat(deposit_amount) : pricing.deposit_amount,
      package_12h_price: package_12h_price !== undefined ? parseFloat(package_12h_price) : pricing.package_12h_price,
      package_24h_price: package_24h_price !== undefined ? parseFloat(package_24h_price) : pricing.package_24h_price,
      description: description !== undefined ? description : pricing.description,
      is_active: is_active !== undefined ? is_active : pricing.is_active,
      // Field baru untuk paket tetap
      is_fixed_package: is_fixed_package !== undefined ? is_fixed_package : pricing.is_fixed_package,
      fixed_start_time: fixed_start_time !== undefined ? fixed_start_time : pricing.fixed_start_time,
      fixed_end_time: fixed_end_time !== undefined ? fixed_end_time : pricing.fixed_end_time,
      fixed_duration: fixed_duration !== null ? fixed_duration : pricing.fixed_duration
    }, { transaction });
    
    console.log(`Successfully updated pricing ID: ${pricing.price_id}`);
    
    await transaction.commit();
    
    res.json({
      message: 'Data harga Playbox berhasil diperbarui',
      pricing: pricing
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error updating playbox pricing:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
// Delete data harga Playbox
exports.deletePricing = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    console.log(`Received request to delete pricing ID: ${req.params.id}`);
    
    const pricing = await PlayboxPricing.findByPk(req.params.id, { transaction });
    
    if (!pricing) {
      console.log(`Pricing with ID ${req.params.id} not found`);
      await transaction.rollback();
      return res.status(404).json({ message: 'Data harga tidak ditemukan' });
    }
    
    // Hapus data
    await pricing.destroy({ transaction });
    
    console.log(`Successfully deleted pricing ID: ${req.params.id}`);
    
    await transaction.commit();
    
    res.json({ 
      message: 'Data harga Playbox berhasil dihapus' 
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error deleting playbox pricing:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Toggle status aktif data harga
exports.toggleActiveStatus = async (req, res) => {
  try {
    console.log(`Toggling active status for pricing ID: ${req.params.id}`);
    
    const pricing = await PlayboxPricing.findByPk(req.params.id);
    
    if (!pricing) {
      console.log(`Pricing with ID ${req.params.id} not found`);
      return res.status(404).json({ message: 'Data harga tidak ditemukan' });
    }
    
    // Toggle status aktif
    const newStatus = !pricing.is_active;
    await pricing.update({ is_active: newStatus });
    
    console.log(`Successfully updated status to ${newStatus} for pricing ID: ${pricing.price_id}`);
    
    res.json({
      message: `Status harga ${pricing.name} diubah menjadi ${newStatus ? 'aktif' : 'tidak aktif'}`,
      pricing: pricing
    });
  } catch (error) {
    console.error('Error toggling playbox pricing status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};