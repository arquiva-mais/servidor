const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verificarToken } = require('../middleware/auth.middleware');
const { minRole, adminOnly } = require('../middleware/roles.middleware');
const { UserRole } = require('../enums/userRole.enum');
const { authLimiter } = require('../middleware/rateLimiters');

// ============================================================
// ROTAS PÚBLICAS (sem autenticação)
// ============================================================

// POST /auth/login - Login
router.post('/login', authLimiter, authController.login);

// POST /auth/refresh - Refresh token
router.post('/refresh', authController.refresh);

// ============================================================
// ROTAS AUTENTICADAS (qualquer usuário logado)
// ============================================================

// POST /auth/logout - Logout
router.post('/logout', verificarToken, authController.logout);

// GET /auth/perfil - Perfil do usuário atual
router.get('/perfil', verificarToken, authController.perfil);

// GET /auth/verify - Verificar token
router.get('/verify', verificarToken, authController.verify);

// ============================================================
// NÍVEL 3 - MODERADOR: Listar usuários (para selects de atribuição)
// ============================================================

// GET /auth/usuarios - Listar usuários
router.get('/usuarios', verificarToken, minRole(UserRole.MODERADOR), authController.listarUsuarios);

// ============================================================
// NÍVEL 99 - ADMIN: Gestão completa de usuários
// ============================================================

// POST /auth/registrar - Criar novo usuário
router.post('/registrar', verificarToken, adminOnly, authController.registrar);

// PUT /auth/usuarios/:id - Atualizar usuário
router.put('/usuarios/:id', verificarToken, adminOnly, authController.atualizarUsuario);

// PATCH /auth/usuarios/:id/senha - Reset de senha (Admin override)
router.patch('/usuarios/:id/senha', verificarToken, adminOnly, authController.resetSenhaAdmin);

// DELETE /auth/usuarios/:id - Desativar usuário
router.delete('/usuarios/:id', verificarToken, adminOnly, authController.desativarUsuario);

module.exports = router;