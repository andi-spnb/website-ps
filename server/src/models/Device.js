const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Device = sequelize.define('Device', {
  device_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  device_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  device_type: {
    type: DataTypes.ENUM('PS3', 'PS4', 'PS5'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Available', 'In Use', 'Maintenance'),
    defaultValue: 'Available'
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  added_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'devices',
  timestamps: true
});

module.exports = Device;