
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CustomerIdentity = sequelize.define('CustomerIdentity', {
  identity_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  reservation_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  identity_type: {
    type: DataTypes.ENUM('KTP', 'SIM', 'Passport', 'Kartu Pelajar', 'Lainnya'),
    allowNull: false,
    defaultValue: 'KTP'
  },
  identity_number: {
    type: DataTypes.STRING,
    allowNull: true
  },
  identity_file_url: {
    type: DataTypes.STRING,
    allowNull: false
  },
  expiry_date: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Tanggal saat file identitas akan otomatis dihapus'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'customer_identities',
  timestamps: true
});

module.exports = CustomerIdentity;