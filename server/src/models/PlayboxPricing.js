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
    defaultValue: 3
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
  package_12h_price: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'Harga spesial untuk paket 12 jam'
  },
  package_24h_price: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'Harga spesial untuk paket 24 jam'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
is_fixed_package: {
  type: DataTypes.BOOLEAN,
  defaultValue: false,
  comment: 'Tanda apakah ini paket tetap dengan waktu yang sudah ditentukan'
},
fixed_start_time: {
  type: DataTypes.STRING,
  allowNull: true,
  comment: 'Waktu mulai untuk paket tetap (format: HH:MM)'
},
fixed_end_time: {
  type: DataTypes.STRING,
  allowNull: true,
  comment: 'Waktu selesai untuk paket tetap (format: HH:MM)'
},
fixed_duration: {
  type: DataTypes.INTEGER,
  allowNull: true,
  comment: 'Durasi tetap dalam jam (dihitung otomatis dari waktu mulai dan selesai)'
}
}, {
  tableName: 'playbox_pricing',
  timestamps: true
});

module.exports = PlayboxPricing;