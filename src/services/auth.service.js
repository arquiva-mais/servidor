const Usuario = require('../models/usuario.model');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth.middleware');

async function registrarUsuario(dados) {
  const { nome, email, senha, role } = dados;

  const usuarioExiste = await Usuario.findOne({ where: { email } });
  if (usuarioExiste) {
    throw new Error('Email já cadastrado');
  }

  const usuario = await Usuario.create({
    nome,
    email,
    senha,
    role: role || 'user'
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
      role: usuario.role
    },
    token
  };
}

async function loginUsuario(email, senha) {
  const usuario = await Usuario.findOne({ where: { email, ativo: true } });

  if (!usuario || !(await usuario.validarSenha(senha))) {
    throw new Error('Credenciais inválidas');
  }

  const token = jwt.sign(
    { id: usuario.id,nome: usuario.nome, email: usuario.email, role: usuario.role },
    JWT_SECRET,
    { expiresIn: '30min' }
  );

  return {
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      role: usuario.role
    },
    token
  };
}

async function listarUsuarios() {
  return Usuario.findAll({
    attributes: ['id', 'nome', 'email', 'role', 'ativo', 'createdAt'],
    order: [['createdAt', 'DESC']]
  });
}

module.exports = { registrarUsuario, loginUsuario, listarUsuarios };