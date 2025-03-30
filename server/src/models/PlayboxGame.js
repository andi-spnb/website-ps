const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PlayboxGame = sequelize.define('PlayboxGame', {
  playbox_game_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  playbox_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  game_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  game_image_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true
  },
  max_players: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  is_featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_installed: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'playbox_games',
  timestamps: true
});

module.exports = PlayboxGame;