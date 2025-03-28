const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcrypt');

const Staff = sequelize.define('Staff', {
  staff_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('Admin', 'Cashier', 'Owner'),
    allowNull: false
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Active', 'Inactive'),
    defaultValue: 'Active'
  }
}, {
  tableName: 'staff',
  timestamps: true
});

// Hooks for password hashing
Staff.beforeCreate(async (staff) => {
  staff.password_hash = await bcrypt.hash(staff.password_hash, 10);
});

Staff.prototype.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password_hash);
};

module.exports = Staff;