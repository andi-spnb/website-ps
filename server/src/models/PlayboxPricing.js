const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PlayboxPricing = sequelize.define('PlayboxPricing', {
  price_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  base_price: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  hourly_rate: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  min_hours: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  delivery_fee: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0
  },
  weekend_surcharge: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0
  },
  deposit_amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'playbox_pricing',
  timestamps: true
});

module.exports = PlayboxPricing;