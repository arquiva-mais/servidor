const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Processo = sequelize.define('Processo', {
  numero_processo: { type: DataTypes.STRING, allowNull: false /*unique: true*/ },
  data_entrada: DataTypes.DATEONLY,
  competencia: {type: DataTypes.STRING, allowNull: false},
  objeto: {type: DataTypes.STRING, allowNull: false},
  interessado: {type: DataTypes.STRING, allowNull: false},
  orgao_gerador: {type: DataTypes.STRING, allowNull: false},
  responsavel: {type: DataTypes.STRING, allowNull: false},
  setor_atual: {type: DataTypes.STRING, allowNull: false},
  descricao: DataTypes.TEXT,
  observacao: DataTypes.TEXT,
  valor_convenio: { type: DataTypes.FLOAT, defaultValue: 0 },
  valor_recurso_proprio: { type: DataTypes.FLOAT, defaultValue: 0 },
  valor_royalties: { type: DataTypes.FLOAT, defaultValue: 0 },
  total: { type: DataTypes.FLOAT, defaultValue: 0 },
  concluido: { type: DataTypes.BOOLEAN, defaultValue: false },
  data_atualizacao: DataTypes.DATE,
  orgao_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'orgaos',
      key: 'id'
    }
  }
}, {
  tableName: 'processos',
  timestamps: true,
});

module.exports = Processo;
