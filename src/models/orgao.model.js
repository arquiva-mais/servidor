const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Orgao = sequelize.define('Orgao', {
  nome: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  cnpj: {
    type: DataTypes.STRING(18),
    allowNull: false,
    unique: true,
    validate: {
      len: [14, 18]
    }
  },
  tipo: {
    type: DataTypes.ENUM('PREFEITURA', 'SECRETARIA', 'DEPARTAMENTO'),
    allowNull: false,
    defaultValue: 'PREFEITURA'
  },
  endereco: DataTypes.STRING,
  telefone: DataTypes.STRING,
  email: DataTypes.STRING,
  responsavel: DataTypes.STRING,
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  observacoes: DataTypes.TEXT
}, {
  tableName: 'orgaos',
  timestamps: true
});

module.exports = Orgao;