const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RentalSession = sequelize.define('RentalSession', {
  session_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  device_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true // Null jika bukan member
  },
  staff_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  start_time: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  end_time: {
    type: DataTypes.DATE,
    allowNull: false
  },
  actual_end_time: {
    type: DataTypes.DATE,
    allowNull: true // Filled when session is ended
  },
  status: {
    type: DataTypes.ENUM('Active', 'Completed', 'Cancelled'),
    defaultValue: 'Active'
  },
  total_amount: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  payment_method: {
    type: DataTypes.STRING,
    allowNull: true
  },
  payment_status: {
    type: DataTypes.ENUM('Pending', 'Paid', 'Cancelled'),
    defaultValue: 'Pending'
  }
}, {
  tableName: 'rental_sessions',
  timestamps: true
});

module.exports = RentalSession;