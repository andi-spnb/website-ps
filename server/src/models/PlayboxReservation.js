const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PlayboxReservation = sequelize.define('PlayboxReservation', {
  reservation_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  playbox_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  customer_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  customer_phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  customer_email: {
    type: DataTypes.STRING,
    allowNull: true
  },
  booking_code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  delivery_address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  start_time: {
    type: DataTypes.DATE,
    allowNull: false
  },
  end_time: {
    type: DataTypes.DATE,
    allowNull: false
  },
  actual_end_time: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Confirmed', 'In Preparation', 'In Transit', 'In Use', 'Returning', 'Completed', 'Cancelled'),
    defaultValue: 'Pending'
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
    type: DataTypes.ENUM('Pending', 'Down Payment', 'Paid', 'Cancelled'),
    defaultValue: 'Pending'
  },
  staff_id: {
    type: DataTypes.INTEGER,
    allowNull: true // Diisi ketika dikonfirmasi oleh staff
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'playbox_reservations',
  timestamps: true
});

module.exports = PlayboxReservation;