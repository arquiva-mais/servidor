const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const Usuario = sequelize.define('Usuario', {
  nome: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  senha: { type: DataTypes.STRING, allowNull: false },
  role: {
    type: DataTypes.ENUM('admin', 'user'),
    defaultValue: 'user',
    allowNull: false
  },
  ativo: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  tableName: 'usuarios',
  timestamps: true,
  hooks: {
    beforeCreate: async (usuario) => {
      usuario.senha = await bcrypt.hash(usuario.senha, 10);
    },
    beforeUpdate: async (usuario) => {
      if (usuario.changed('senha')) {
        usuario.senha = await bcrypt.hash(usuario.senha, 10);
      }
    }
  }
});

Usuario.prototype.validarSenha = async function(senha) {
  return await bcrypt.compare(senha, this.senha);
};

module.exports = Usuario;