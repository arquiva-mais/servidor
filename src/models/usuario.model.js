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
  orgao_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'orgaos',
      key: 'id'
    }
  },
  ativo: { type: DataTypes.BOOLEAN, defaultValue: true },
  refresh_token: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  refresh_token_expires: {
    type: DataTypes.DATE,
    allowNull: true
  }
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

Usuario.prototype.validarSenha = async function (senha) {
  try {
    console.log('validarSenha - senha recebida:', senha);
    console.log('validarSenha - this.senha:', this.senha);
    console.log('validarSenha - tipo this.senha:', typeof this.senha);
    
    if (!senha || !this.senha) {
      console.log('Senha ou hash inválido!');
      return false;
    }
    
    const resultado = await bcrypt.compare(senha, this.senha);
    console.log('Resultado comparação:', resultado);
    return resultado;
  } catch (error) {
    console.log('Erro em validarSenha:', error.message);
    return false;
  }
};

module.exports = Usuario;