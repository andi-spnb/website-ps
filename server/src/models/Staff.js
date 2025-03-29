// src/models/Staff.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcrypt');

const Staff = sequelize.define('Staff', {
  staff_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('Admin', 'Cashier', 'Owner'),
    allowNull: false
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Active', 'Inactive'),
    defaultValue: 'Active'
  }
}, {
  tableName: 'staff',
  timestamps: true
});

// Method untuk membandingkan password
Staff.prototype.comparePassword = async function(password) {
  try {
    return await bcrypt.compare(password, this.password_hash);
  } catch (error) {
    console.error('Password comparison error:', error);
    return false;
  }
};

// Hook untuk mengenkripsi password sebelum simpan
Staff.beforeCreate(async (staff) => {
  if (staff.password_hash) {
    staff.password_hash = await bcrypt.hash(staff.password_hash, 10);
  }
});

Staff.beforeUpdate(async (staff) => {
  if (staff.changed('password_hash')) {
    staff.password_hash = await bcrypt.hash(staff.password_hash, 10);
  }
});

module.exports = Staff;