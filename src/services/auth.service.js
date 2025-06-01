const Usuario = require('../models/usuario.model');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth.middleware');

async function registrarUsuario(dados) {
  const { nome, email, senha, role, orgao_id } = dados;

  const usuarioExiste = await Usuario.findOne({ where: { email } });
  if (usuarioExiste) {
    throw new Error('Email já cadastrado');
  }

  const usuario = await Usuario.create({
    nome,
    email,
    senha,
    role: role || 'user',
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
  const accessToken = jwt.sign(
    { id: userId, email, role },
    process.env.JWT_SECRET,
    { expiresIn: '40m' }
  );

  const refreshToken = jwt.sign(
    { id: userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
  console.log('Tokens criados: ', accessToken)
  console.log('Tokens criados: ', refreshToken)
  return { accessToken, refreshToken };
}

async function loginUsuario(email, senha) {
  const usuario = await Usuario.findOne({ where: { email, ativo: true } });

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

async function listarUsuarios() {
  return Usuario.findAll({
    attributes: ['id', 'nome', 'email', 'role', 'ativo', 'createdAt'],
    order: [['createdAt', 'DESC']]
  });
}


module.exports = { registrarUsuario, loginUsuario, listarUsuarios, refreshToken, logout };