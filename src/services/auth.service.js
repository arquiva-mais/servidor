const Usuario = require('../models/usuario.model');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth.middleware');
const { UserRole } = require('../enums/userRole.enum');

async function registrarUsuario(dados) {
  const { nome, email, senha, role, orgao_id } = dados;

  const usuarioExiste = await Usuario.findOne({ where: { email } });
  if (usuarioExiste) {
    throw new Error('Email já cadastrado');
  }

  // Validar role
  const roleValida = role && UserRole.isValid(role) ? role : UserRole.TRAMITADOR;

  const usuario = await Usuario.create({
    nome,
    email,
    senha,
    role: roleValida,
    orgao_id
  });

  const token = jwt.sign(
    { id: usuario.id, nome: usuario.nome, email: usuario.email, role: usuario.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      role: usuario.role,
      orgao_id: usuario.orgao_id
    },
    token
  };
}

async function generateTokens(userId, email, role) {
  const { JWT_SECRET } = require('../middleware/auth.middleware');
  
  const accessToken = jwt.sign(
    { id: userId, email, role },
    JWT_SECRET, 
    { expiresIn: '15m' } 
  );

  const refreshToken = jwt.sign(
    { id: userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || 'seu-jwt-refresh-secret',
    { expiresIn: '7d' }
  );
  
  return { accessToken, refreshToken };
}

async function loginUsuario(email, senha) {
  // Forçar carregar o campo senha explicitamente
  const usuario = await Usuario.findOne({ 
    where: { email, ativo: true },
    attributes: ['id', 'nome', 'email', 'senha', 'role', 'orgao_id', 'ativo', 'refresh_token', 'refresh_token_expires']
  });

  if (!usuario || !(await usuario.validarSenha(senha))) {
    throw new Error('Credenciais inválidas');
  }

  const { accessToken, refreshToken } = await generateTokens(
    usuario.id,
    usuario.email,
    usuario.role
  );

  const refreshTokenExpires = new Date();
  refreshTokenExpires.setDate(refreshTokenExpires.getDate() + 7);

  await usuario.update({
    refresh_token: refreshToken,
    refresh_token_expires: refreshTokenExpires
  });

  return {
    user: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      role: usuario.role
    },
    accessToken,
    refreshToken
  };
}

async function refreshToken(refreshToken) {
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const usuario = await Usuario.findOne({
      where: {
        id: decoded.id,
        refresh_token: refreshToken,
        refresh_token_expires: {
          [require('sequelize').Op.gt]: new Date()
        }
      }
    });

    if (!usuario) {
      throw new Error('Refresh token inválido');
    }

    const { accessToken, refreshToken: newRefreshToken } = await generateTokens(
      usuario.id,
      usuario.email,
      usuario.role
    );

    // Atualizar refresh token no banco
    const refreshTokenExpires = new Date();
    refreshTokenExpires.setDate(refreshTokenExpires.getDate() + 7);

    await usuario.update({
      refresh_token: newRefreshToken,
      refresh_token_expires: refreshTokenExpires
    });

    return {
      accessToken,
      refreshToken: newRefreshToken
    };
  } catch (error) {
    throw new Error('Refresh token inválido');
  }
}

async function logout(userId) {
  await Usuario.update(
    {
      refresh_token: null,
      refresh_token_expires: null
    },
    { where: { id: userId } }
  );
}

async function listarUsuarios(filtros = {}) {
  const where = {};
  
  if (filtros.orgao_id) where.orgao_id = filtros.orgao_id;
  if (filtros.role) where.role = filtros.role;
  if (filtros.ativo !== undefined) where.ativo = filtros.ativo;

  return Usuario.findAll({
    where,
    attributes: ['id', 'nome', 'email', 'role', 'orgao_id', 'ativo', 'createdAt'],
    order: [['createdAt', 'DESC']]
  });
}

async function atualizarUsuario(usuarioId, dados) {
  const usuario = await Usuario.findByPk(usuarioId);
  
  if (!usuario) {
    throw new Error('Usuário não encontrado');
  }

  const camposPermitidos = {};
  
  if (dados.nome) camposPermitidos.nome = dados.nome;
  if (dados.email) {
    const emailExiste = await Usuario.findOne({ 
      where: { 
        email: dados.email,
        id: { [require('sequelize').Op.ne]: usuarioId }
      } 
    });
    if (emailExiste) {
      throw new Error('Email já está em uso');
    }
    camposPermitidos.email = dados.email;
  }
  if (dados.role) {
    // Validar role antes de atualizar
    if (!UserRole.isValid(dados.role)) {
      throw new Error('Role inválida. Valores permitidos: ' + UserRole.values().join(', '));
    }
    camposPermitidos.role = dados.role;
  }
  if (dados.orgao_id !== undefined) camposPermitidos.orgao_id = dados.orgao_id;
  if (typeof dados.ativo === 'boolean') camposPermitidos.ativo = dados.ativo;

  await usuario.update(camposPermitidos);

  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    role: usuario.role,
    orgao_id: usuario.orgao_id,
    ativo: usuario.ativo
  };
}

/**
 * Reset de senha administrativo (override)
 * Altera a senha de qualquer usuário sem validar a senha antiga
 * 
 * @param {number} usuarioId - ID do usuário
 * @param {string} novaSenha - Nova senha (será hasheada automaticamente pelo hook do model)
 * @returns {Object} Mensagem de sucesso
 */
async function resetSenhaAdmin(usuarioId, novaSenha) {
  const bcrypt = require('bcryptjs');
  
  const usuario = await Usuario.findByPk(usuarioId);
  if (!usuario) {
    throw new Error('Usuário não encontrado');
  }

  // Gerar hash da nova senha
  const senhaHash = await bcrypt.hash(novaSenha, 10);

  // Update direto para evitar o hook beforeUpdate (que faria hash duplo)
  await Usuario.update(
    { senha: senhaHash },
    { where: { id: usuarioId }, individualHooks: false }
  );

  return {
    message: `Senha alterada com sucesso para o usuário ${usuario.nome}`,
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email
    }
  };
}


module.exports = { registrarUsuario, loginUsuario, listarUsuarios, atualizarUsuario, refreshToken, logout, resetSenhaAdmin };