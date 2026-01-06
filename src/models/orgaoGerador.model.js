const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrgaoGerador = sequelize.define('OrgaoGerador', {
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
  tableName: 'orgaos_geradores',
  timestamps: true
});

module.exports = OrgaoGerador;
