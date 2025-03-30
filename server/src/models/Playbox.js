const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Playbox = sequelize.define('Playbox', {
  playbox_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  playbox_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  tv_size: {
    type: DataTypes.STRING,
    allowNull: false
  },
  ps4_model: {
    type: DataTypes.STRING,
    allowNull: false
  },
  controllers_count: {
    type: DataTypes.INTEGER,
    defaultValue: 2
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  image_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('Available', 'In Use', 'Maintenance', 'In Transit'),
    defaultValue: 'Available'
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  added_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'playboxes',
  timestamps: true
});

module.exports = Playbox;