const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Pricing = sequelize.define('Pricing', {
  price_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  device_type: {
    type: DataTypes.ENUM('PS3', 'PS4', 'PS5'),
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  amount_per_hour: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  package_amount: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  package_hours: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  time_condition: {
    type: DataTypes.ENUM('Weekday', 'Weekend', 'Holiday', 'Any'),
    defaultValue: 'Any'
  }
}, {
  tableName: 'pricing',
  timestamps: true
});

module.exports = Pricing;