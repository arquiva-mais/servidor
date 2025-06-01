const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario.model');
const Orgao = require('../models/orgao.model')

const JWT_SECRET = process.env.JWT_SECRET || 'seu-jwt-secret-aqui';

const verificarToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const usuario = await Usuario.findByPk(decoded.id, {
      include: {
        model: Orgao,
        as: 'orgao',
        attributes: ['id', 'nome', 'tipo']
      }
    });

    if (!usuario || !usuario.ativo) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    req.usuario = usuario;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expirado',
        code: 'TOKEN_EXPIRED'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token inválido',
        code: 'INVALID_TOKEN'
      });
    }

    return res.status(401).json({ error: 'Erro de autenticação' });
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

const verificarRefreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token obrigatório' });
    }

    const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
    if (!JWT_REFRESH_SECRET) {
      return res.status(500).json({ error: 'Configuração de refresh token não encontrada' });
    }

    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);

    if (decoded.type !== 'refresh') {
      return res.status(401).json({ error: 'Token inválido' });
    }

    const usuario = await Usuario.findOne({
      where: {
        id: decoded.id,
        refresh_token: refreshToken,
        refresh_token_expires: {
          [require('sequelize').Op.gt]: new Date()
        }
      },
      include: {
        model: Orgao,
        as: 'orgao',
        attributes: ['id', 'nome', 'tipo']
      }
    });

    if (!usuario || !usuario.ativo) {
      return res.status(401).json({ error: 'Refresh token inválido ou expirado' });
    }

    req.usuario = usuario;
    req.refreshToken = refreshToken;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Refresh token expirado',
        code: 'REFRESH_TOKEN_EXPIRED'
      });
    }

    return res.status(401).json({ error: 'Refresh token inválido' });
  }
};

module.exports = { verificarToken, verificarRole, JWT_SECRET, verificarRefreshToken };