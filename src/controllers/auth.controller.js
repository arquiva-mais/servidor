const authService = require('../services/auth.service');
const { UserRole } = require('../enums/userRole.enum');

exports.registrar = async (req, res) => {
  try {
    const { nome, email, senha, role, orgao_id } = req.body;

    // Validar role se fornecida
    if (role && !UserRole.isValid(role)) {
      return res.status(400).json({ 
        error: 'Role inválida',
        valid_roles: UserRole.values()
      });
    }

    // Admin não pode criar outro Admin diretamente (segurança extra)
    if (role === UserRole.ADMIN && req.usuario.role !== UserRole.ADMIN) {
      return res.status(403).json({ 
        error: 'Apenas administradores podem criar outros administradores' 
      });
    }

    const resultado = await authService.registrarUsuario({
      nome,
      email,
      senha,
      role: role || UserRole.TRAMITADOR, // Default: TRAMITADOR
      orgao_id: orgao_id || req.usuario.orgao_id
    });

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      usuario: {
        id: resultado.usuario.id,
        nome: resultado.usuario.nome,
        email: resultado.usuario.email,
        role: resultado.usuario.role
      }
    });
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
    const { role, ativo, orgao_id } = req.query;

    // Filtrar por órgão do usuário logado (exceto ADMIN que vê todos)
    const filtros = {
      orgao_id: req.usuario.role === UserRole.ADMIN 
        ? (orgao_id || undefined) 
        : req.usuario.orgao_id
    };

    if (role) filtros.role = role;
    if (ativo !== undefined) filtros.ativo = ativo === 'true';

    const usuarios = await authService.listarUsuarios(filtros);
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar usuários' });
  }
};

exports.atualizarUsuario = async (req, res) => {
  try {
    const usuarioId = parseInt(req.params.id);
    const { role } = req.body;

    // Validar role se fornecida
    if (role && !UserRole.isValid(role)) {
      return res.status(400).json({ 
        error: 'Role inválida',
        valid_roles: UserRole.values()
      });
    }

    const usuarioAtualizado = await authService.atualizarUsuario(usuarioId, req.body);
    res.json(usuarioAtualizado);
  } catch (error) {
    if (error.message === 'Usuário não encontrado') {
      return res.status(404).json({ error: error.message });
    }
    res.status(400).json({ error: error.message });
  }
};

/**
 * Desativar usuário (soft delete)
 * Requer: ADMIN
 */
exports.desativarUsuario = async (req, res) => {
  try {
    const usuarioId = parseInt(req.params.id);

    // Impedir auto-desativação
    if (usuarioId === req.usuario.id) {
      return res.status(400).json({ 
        error: 'Não é possível desativar seu próprio usuário' 
      });
    }

    const usuario = await authService.atualizarUsuario(usuarioId, { ativo: false });
    res.json({ 
      message: 'Usuário desativado com sucesso',
      usuario 
    });
  } catch (error) {
    if (error.message === 'Usuário não encontrado') {
      return res.status(404).json({ error: error.message });
    }
    res.status(400).json({ error: error.message });
  }
};

/**
 * Reset de senha administrativo (override)
 * Requer: ADMIN
 * Altera a senha de qualquer usuário sem precisar da senha antiga
 */
exports.resetSenhaAdmin = async (req, res) => {
  try {
    const usuarioId = parseInt(req.params.id);
    const { password, senha } = req.body;
    
    // Aceitar tanto 'password' quanto 'senha'
    const novaSenha = password || senha;

    // Validação do DTO
    if (!novaSenha) {
      return res.status(400).json({ 
        error: 'Senha é obrigatória',
        code: 'PASSWORD_REQUIRED'
      });
    }

    if (novaSenha.length < 6) {
      return res.status(400).json({ 
        error: 'Senha deve ter no mínimo 6 caracteres',
        code: 'PASSWORD_TOO_SHORT'
      });
    }

    const resultado = await authService.resetSenhaAdmin(usuarioId, novaSenha);
    
    res.json(resultado);
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