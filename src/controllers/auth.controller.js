const authService = require('../services/auth.service');

exports.registrar = async (req, res) => {
  try {
    const resultado = await authService.registrarUsuario(req.body);
    res.status(201).json(resultado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body;
    const resultado = await authService.loginUsuario(email, senha);
    res.json(resultado);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

exports.perfil = async (req, res) => {
  res.json({
    usuario: {
      id: req.usuario.id,
      nome: req.usuario.nome,
      email: req.usuario.email,
      role: req.usuario.role,
      orgao: req.usuario.orgao // Adicionar orgão que vem do middleware
    }
  });
};

exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token obrigatório' });
    }

    const tokens = await authService.refreshToken(refreshToken);

    res.json(tokens);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

exports.logout = async (req, res) => {
  try {
    await authService.logout(req.usuario.id); // Usar req.usuario (não req.user)
    res.json({ message: 'Logout realizado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.listarUsuarios = async (req, res) => {
  try {
    const usuarios = await authService.listarUsuarios();
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar usuários' });
  }
};

// Adicionar método para verificar token
exports.verify = async (req, res) => {
  res.json({
    valid: true,
    user: {
      id: req.usuario.id,
      nome: req.usuario.nome,
      email: req.usuario.email,
      role: req.usuario.role,
      orgao: req.usuario.orgao
    }
  });
};