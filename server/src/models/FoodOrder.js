const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FoodOrder = sequelize.define('FoodOrder', {
  order_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  session_id: {
    type: DataTypes.INTEGER,
    allowNull: true // Bisa null jika order makanan tidak terkait dengan rental
  },
  staff_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  order_time: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  total_amount: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Preparing', 'Delivered', 'Cancelled'),
    defaultValue: 'Preparing'
  }
}, {
  tableName: 'food_orders',
  timestamps: true
});

module.exports = FoodOrder;