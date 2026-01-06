const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Setor = sequelize.define('Setor', {
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
  tableName: 'setores',
  timestamps: true
});

module.exports = Setor;
