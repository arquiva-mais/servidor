const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');
const { UserRole } = require('../enums/userRole.enum');

const Usuario = sequelize.define('Usuario', {
  nome: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  senha: { type: DataTypes.STRING, allowNull: false },
  role: {
    type: DataTypes.ENUM(...UserRole.values()),
    defaultValue: UserRole.TRAMITADOR,
    allowNull: false,
    validate: {
      isIn: {
        args: [UserRole.values()],
        msg: 'Role inválida. Valores permitidos: ' + UserRole.values().join(', ')
      }
    }
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
    if (!senha || !this.senha) {
      return false;
    }
    return await bcrypt.compare(senha, this.senha);
  } catch (error) {
    return false;
  }
};

module.exports = Usuario;