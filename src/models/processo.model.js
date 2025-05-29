const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Processo = sequelize.define('Processo', {
  numero_processo: { type: DataTypes.STRING, allowNull: false, unique: true },
  data_entrada: DataTypes.DATEONLY,
  competencia: {type: DataTypes.STRING, allowNull: false},
  objeto: {type: DataTypes.STRING, allowNull: false},
  interessado: DataTypes.STRING,
  orgao_gerador: DataTypes.STRING,
  responsavel: DataTypes.STRING,
  setor_atual: DataTypes.STRING,
  descricao: DataTypes.TEXT,
  observacao: DataTypes.TEXT,
  valor_convenio: { type: DataTypes.FLOAT, defaultValue: 0 },
  valor_recurso_proprio: { type: DataTypes.FLOAT, defaultValue: 0 },
  valor_royalties: { type: DataTypes.FLOAT, defaultValue: 0 },
  total: { type: DataTypes.FLOAT, defaultValue: 0 },
  concluido: { type: DataTypes.BOOLEAN, defaultValue: false },
  data_atualizacao: DataTypes.DATE,
}, {
  tableName: 'processos',
  timestamps: true,
});

module.exports = Processo;
