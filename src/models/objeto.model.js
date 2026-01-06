const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Objeto = sequelize.define('Objeto', {
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
  tableName: 'objetos',
  timestamps: true
});

module.exports = Objeto;
