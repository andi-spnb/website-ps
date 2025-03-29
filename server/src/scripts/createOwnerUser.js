const bcrypt = require('bcrypt');
const { Staff } = require('../models');
const sequelize = require('../config/database');

async function createOwnerUser() {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('Koneksi database berhasil.');
    
    // Define owner user details
    const ownerData = {
      name: 'Admin Owner 1',
      role: 'Owner',
      username: 'andispnb',
      password_hash: 'spnb123', // Password akan di-hash melalui hook model
      status: 'Active'
    };
    
    // Check if owner already exists
    const existingOwner = await Staff.findOne({
      where: { username: ownerData.username }
    });
    
    if (existingOwner) {
      console.log('User owner sudah ada.');
      return;
    }
    
    // Create the owner user
    const ownerUser = await Staff.create(ownerData);
    
    console.log('User owner berhasil dibuat:', {
      staff_id: ownerUser.staff_id,
      name: ownerUser.name,
      role: ownerUser.role,
      username: ownerUser.username
    });
    
    console.log('Silakan login dengan:');
    console.log('Username:', ownerData.username);
    console.log('Password:', ownerData.password_hash);
    
  } catch (error) {
    console.error('Error membuat user owner:', error);
  } finally {
    // Close the database connection
    await sequelize.close();
    process.exit(0);
  }
}

// Execute the function
createOwnerUser();