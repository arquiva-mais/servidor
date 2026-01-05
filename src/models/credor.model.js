const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Credor = sequelize.define('Credor', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  }
}, {
  tableName: 'credores',
  timestamps: true
});

module.exports = Credor;
