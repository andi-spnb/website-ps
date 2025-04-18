const { Pricing, sequelize } = require('../models');
const { Op } = require('sequelize');

exports.getAllPricing = async (req, res) => {
  try {
    console.log("Fetching all PlayStation pricing data");
    const pricing = await Pricing.findAll({
      order: [['name', 'ASC']] 
    });
    
    console.log(`Retrieved ${pricing.length} PlayStation pricing items`);
    res.json(pricing);
  } catch (error) {
    console.error('Error fetching PlayStation pricing:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mendapatkan data harga PlayStation yang aktif
exports.getActivePricing = async (req, res) => {
  try {
    console.log("Fetching active PlayStation pricing data");
    // Hapus filter where untuk is_active
    const pricing = await Pricing.findAll({
      // where: { is_active: true },
      order: [['name', 'ASC']]
    });
    
    console.log(`Retrieved ${pricing.length} active PlayStation pricing items`);
    res.json(pricing);
  } catch (error) {
    console.error('Error fetching active PlayStation pricing:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mendapatkan data harga PlayStation berdasarkan ID
exports.getPricingById = async (req, res) => {
  try {
    console.log(`Fetching PlayStation pricing with ID: ${req.params.id}`);
    const pricing = await Pricing.findByPk(req.params.id);
    
    if (!pricing) {
      console.log(`Pricing with ID ${req.params.id} not found`);
      return res.status(404).json({ message: 'Data harga tidak ditemukan' });
    }
    
    res.json(pricing);
  } catch (error) {
    console.error('Error fetching PlayStation pricing by ID:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Membuat data harga PlayStation baru
exports.createPricing = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    console.log("Received request to create new PlayStation pricing:", req.body);
    
    const { 
      device_type,
      name, 
      amount_per_hour, 
      package_amount, 
      package_hours, 
      time_condition,
      is_active 
    } = req.body;
    
    // Validasi data
    if (!name || !device_type || amount_per_hour === undefined) {
      console.log("Validation failed: missing required fields");
      await transaction.rollback();
      return res.status(400).json({ message: 'Nama, tipe perangkat, dan tarif per jam wajib diisi' });
    }
    
    // Buat data harga baru
    const newPricing = await Pricing.create({
      device_type,
      name,
      amount_per_hour: parseFloat(amount_per_hour),
      package_amount: package_amount ? parseFloat(package_amount) : null,
      package_hours: package_hours ? parseInt(package_hours) : null,
      time_condition: time_condition || 'Any',
      is_active: is_active !== undefined ? is_active : true
    }, { transaction });
    
    console.log("Successfully created new PlayStation pricing with ID:", newPricing.price_id);
    
    await transaction.commit();
    
    res.status(201).json({
      message: 'Data harga PlayStation berhasil dibuat',
      pricing: newPricing
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating PlayStation pricing:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update data harga PlayStation
exports.updatePricing = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    console.log(`Received request to update PlayStation pricing ID: ${req.params.id}`, req.body);
    
    const { 
      device_type,
      name, 
      amount_per_hour, 
      package_amount, 
      package_hours, 
      time_condition,
      is_active 
    } = req.body;
    
    const pricing = await Pricing.findByPk(req.params.id, { transaction });
    
    if (!pricing) {
      console.log(`Pricing with ID ${req.params.id} not found`);
      await transaction.rollback();
      return res.status(404).json({ message: 'Data harga tidak ditemukan' });
    }
    
    // Update data
    await pricing.update({
      device_type: device_type || pricing.device_type,
      name: name || pricing.name,
      amount_per_hour: amount_per_hour !== undefined ? parseFloat(amount_per_hour) : pricing.amount_per_hour,
      package_amount: package_amount !== undefined ? parseFloat(package_amount) : pricing.package_amount,
      package_hours: package_hours !== undefined ? parseInt(package_hours) : pricing.package_hours,
      time_condition: time_condition || pricing.time_condition,
      is_active: is_active !== undefined ? is_active : pricing.is_active
    }, { transaction });
    
    console.log(`Successfully updated PlayStation pricing ID: ${pricing.price_id}`);
    
    await transaction.commit();
    
    res.json({
      message: 'Data harga PlayStation berhasil diperbarui',
      pricing: pricing
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error updating PlayStation pricing:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getPricingByDeviceType = async (req, res) => {
  try {
    const { type } = req.params;
    console.log(`Fetching pricing for device type: ${type}`);
    
    const pricing = await Pricing.findAll({
      where: { device_type: type },
      order: [['name', 'ASC']]
    });
    
    console.log(`Retrieved ${pricing.length} pricing items for ${type}`);
    res.json(pricing);
  } catch (error) {
    console.error('Error fetching pricing by device type:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete data harga PlayStation
exports.deletePricing = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    console.log(`Received request to delete PlayStation pricing ID: ${req.params.id}`);
    
    const pricing = await Pricing.findByPk(req.params.id, { transaction });
    
    if (!pricing) {
      console.log(`Pricing with ID ${req.params.id} not found`);
      await transaction.rollback();
      return res.status(404).json({ message: 'Data harga tidak ditemukan' });
    }
    
    // Hapus data
    await pricing.destroy({ transaction });
    
    console.log(`Successfully deleted PlayStation pricing ID: ${req.params.id}`);
    
    await transaction.commit();
    
    res.json({ 
      message: 'Data harga PlayStation berhasil dihapus' 
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error deleting PlayStation pricing:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Toggle status aktif data harga
exports.toggleActiveStatus = async (req, res) => {
  try {
    console.log(`Toggling active status for PlayStation pricing ID: ${req.params.id}`);
    
    const pricing = await Pricing.findByPk(req.params.id);
    
    if (!pricing) {
      console.log(`Pricing with ID ${req.params.id} not found`);
      return res.status(404).json({ message: 'Data harga tidak ditemukan' });
    }
    
    // Toggle status aktif
    const newStatus = !pricing.is_active;
    await pricing.update({ is_active: newStatus });
    
    console.log(`Successfully updated status to ${newStatus} for PlayStation pricing ID: ${pricing.price_id}`);
    
    res.json({
      message: `Status harga ${pricing.name} diubah menjadi ${newStatus ? 'aktif' : 'tidak aktif'}`,
      pricing: pricing
    });
  } catch (error) {
    console.error('Error toggling PlayStation pricing status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};