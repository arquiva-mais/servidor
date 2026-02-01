const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notificacao = sequelize.define('Notificacao', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  mensagem: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  lida: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'notificacoes',
  timestamps: false, // Usamos apenas created_at manualmente
  underscored: true
});

module.exports = Notificacao;
