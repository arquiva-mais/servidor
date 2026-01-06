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
    const { email, senha, password } = req.body;
    // Aceitar tanto 'senha' quanto 'password' para compatibilidade
    const senhaFinal = senha || password;
    const resultado = await authService.loginUsuario(email, senhaFinal);
    
    // Setar o Refresh Token num cookie HttpOnly
    res.cookie('refreshToken', resultado.refreshToken, {
       httpOnly: true,
       secure: process.env.NODE_ENV === 'production', 
       sameSite: 'strict', 
       maxAge: 7 * 24 * 60 * 60 * 1000 // 7 dias
    });

    const { refreshToken, ...responseWithoutRefresh } = resultado;
    res.json(responseWithoutRefresh);
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
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token obrigatório' });
    }

    const tokens = await authService.refreshToken(refreshToken);

    // Rotacionar refresh token
    res.cookie('refreshToken', tokens.refreshToken, {
       httpOnly: true,
       secure: process.env.NODE_ENV === 'production',
       sameSite: 'strict',
       maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ accessToken: tokens.accessToken });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

exports.logout = async (req, res) => {
  try {
    if (req.usuario) {
        await authService.logout(req.usuario.id);
    }
    res.clearCookie('refreshToken'); 
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

exports.atualizarUsuario = async (req, res) => {
  try {
    const usuarioId = parseInt(req.params.id);
    const usuarioAtualizado = await authService.atualizarUsuario(usuarioId, req.body);
    res.json(usuarioAtualizado);
  } catch (error) {
    if (error.message === 'Usuário não encontrado') {
      return res.status(404).json({ error: error.message });
    }
    res.status(400).json({ error: error.message });
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