const { Device, RentalSession } = require('../models');
const { Op } = require('sequelize');

// Get all devices
exports.getAllDevices = async (req, res) => {
  try {
    const devices = await Device.findAll({
      order: [['device_name', 'ASC']]
    });
    res.json(devices);
  } catch (error) {
    console.error('Error fetching devices:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get device by ID
exports.getDeviceById = async (req, res) => {
  try {
    const device = await Device.findByPk(req.params.id);
    
    if (!device) {
      return res.status(404).json({ message: 'Perangkat tidak ditemukan' });
    }
    
    res.json(device);
  } catch (error) {
    console.error('Error fetching device:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new device
exports.createDevice = async (req, res) => {
  try {
    const { device_name, device_type, location } = req.body;
    
    const newDevice = await Device.create({
      device_name,
      device_type,
      status: 'Available',
      location,
      added_date: new Date()
    });
    
    res.status(201).json(newDevice);
  } catch (error) {
    console.error('Error creating device:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update a device
exports.updateDevice = async (req, res) => {
  try {
    const { device_name, device_type, status, location } = req.body;
    const device = await Device.findByPk(req.params.id);
    
    if (!device) {
      return res.status(404).json({ message: 'Perangkat tidak ditemukan' });
    }
    
    await device.update({
      device_name,
      device_type,
      status,
      location
    });
    
    res.json(device);
  } catch (error) {
    console.error('Error updating device:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a device
exports.deleteDevice = async (req, res) => {
  try {
    const device = await Device.findByPk(req.params.id);
    
    if (!device) {
      return res.status(404).json({ message: 'Perangkat tidak ditemukan' });
    }
    
    // Check if device has active sessions
    const activeSession = await RentalSession.findOne({
      where: {
        device_id: req.params.id,
        status: 'Active'
      }
    });
    
    if (activeSession) {
      return res.status(400).json({ message: 'Tidak dapat menghapus perangkat yang sedang digunakan' });
    }
    
    await device.destroy();
    
    res.json({ message: 'Perangkat berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting device:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get available devices
exports.getAvailableDevices = async (req, res) => {
  try {
    const devices = await Device.findAll({
      where: {
        status: 'Available'
      },
      order: [['device_name', 'ASC']]
    });
    
    res.json(devices);
  } catch (error) {
    console.error('Error fetching available devices:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update device status
exports.updateDeviceStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const device = await Device.findByPk(req.params.id);
    
    if (!device) {
      return res.status(404).json({ message: 'Perangkat tidak ditemukan' });
    }
    
    // Check if device has active sessions when setting to maintenance
    if (status === 'Maintenance') {
      const activeSession = await RentalSession.findOne({
        where: {
          device_id: req.params.id,
          status: 'Active'
        }
      });
      
      if (activeSession) {
        return res.status(400).json({ message: 'Tidak dapat mengubah status perangkat yang sedang digunakan' });
      }
    }
    
    await device.update({ status });
    
    res.json(device);
  } catch (error) {
    console.error('Error updating device status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};