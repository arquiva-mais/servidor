const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario.model');

const JWT_SECRET = process.env.JWT_SECRET || 'seu-jwt-secret-aqui';

const verificarToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const usuario = await Usuario.findByPk(decoded.id);

    if (!usuario || !usuario.ativo) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    req.usuario = usuario;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
};

const verificarRole = (rolesPermitidas) => {
  return (req, res, next) => {
    if (!rolesPermitidas.includes(req.usuario.role)) {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    next();
  };
};

module.exports = { verificarToken, verificarRole, JWT_SECRET };