const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcrypt');

const User = sequelize.define('User', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  membership_id: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  registration_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  reward_points: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  expiry_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('Active', 'Expired', 'Blacklisted'),
    defaultValue: 'Active'
  }
}, {
  tableName: 'users',
  timestamps: true
});

module.exports = User;