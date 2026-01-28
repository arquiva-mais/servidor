'use strict';

const { UserRole, getRoleWeight, hasMinRole } = require('../enums/userRole.enum');

/**
 * Middleware factory que verifica se o usuário tem a role mínima requerida
 * Implementa lógica hierárquica: se user.weight >= required.weight, permite acesso
 * 
 * @param {string} requiredRole - Role mínima requerida (do enum UserRole)
 * @returns {Function} Middleware Express
 * 
 * @example
 * // Permite EDITOR e superiores (MODERADOR, GESTOR, ADMIN)
 * router.post('/', minRole(UserRole.EDITOR), controller.criar);
 */
const minRole = (requiredRole) => {
  return (req, res, next) => {
    try {
      // Verifica se o usuário está autenticado
      if (!req.usuario) {
        return res.status(401).json({
          error: 'Não autenticado',
          code: 'NOT_AUTHENTICATED'
        });
      }

      const userRole = req.usuario.role;

      // Verifica se a role do usuário é válida
      if (!UserRole.isValid(userRole)) {
        console.warn(`[RolesMiddleware] Role inválida detectada: ${userRole} para usuário ${req.usuario.id}`);
        return res.status(403).json({
          error: 'Role de usuário inválida',
          code: 'INVALID_ROLE'
        });
      }

      // Verifica se a role requerida é válida
      if (!UserRole.isValid(requiredRole)) {
        console.error(`[RolesMiddleware] Role requerida inválida na configuração: ${requiredRole}`);
        return res.status(500).json({
          error: 'Erro de configuração de permissões',
          code: 'INVALID_REQUIRED_ROLE'
        });
      }

      // Lógica hierárquica: verifica se o peso do usuário é >= peso requerido
      if (!hasMinRole(userRole, requiredRole)) {
        const userWeight = getRoleWeight(userRole);
        const requiredWeight = getRoleWeight(requiredRole);

        console.warn(
          `[RolesMiddleware] Acesso negado: Usuário ${req.usuario.id} (${userRole}, peso ${userWeight}) ` +
          `tentou acessar rota que requer ${requiredRole} (peso ${requiredWeight})`
        );

        return res.status(403).json({
          error: 'Permissão insuficiente',
          code: 'INSUFFICIENT_PERMISSION',
          required: requiredRole,
          current: userRole
        });
      }

      // Adiciona informações úteis ao request para uso posterior
      req.userRoleWeight = getRoleWeight(userRole);
      req.requiredRoleWeight = getRoleWeight(requiredRole);

      next();
    } catch (error) {
      console.error('[RolesMiddleware] Erro inesperado:', error);
      return res.status(500).json({
        error: 'Erro interno de autorização',
        code: 'AUTH_INTERNAL_ERROR'
      });
    }
  };
};

/**
 * Middleware que verifica se o usuário tem uma das roles específicas (sem hierarquia)
 * Útil para casos onde apenas roles específicas devem ter acesso
 * 
 * @param {string[]} allowedRoles - Array de roles permitidas
 * @returns {Function} Middleware Express
 */
const exactRoles = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({
        error: 'Não autenticado',
        code: 'NOT_AUTHENTICATED'
      });
    }

    if (!allowedRoles.includes(req.usuario.role)) {
      return res.status(403).json({
        error: 'Acesso restrito a roles específicas',
        code: 'ROLE_NOT_ALLOWED',
        allowed: allowedRoles,
        current: req.usuario.role
      });
    }

    next();
  };
};

/**
 * Middleware que verifica se é ADMIN (atalho comum)
 */
const adminOnly = minRole(UserRole.ADMIN);

/**
 * Middleware que verifica se é pelo menos GESTOR (Nível 4)
 */
const gestorOrAbove = minRole(UserRole.GESTOR);

/**
 * Middleware que verifica se é pelo menos MODERADOR (Nível 3)
 */
const moderadorOrAbove = minRole(UserRole.MODERADOR);

/**
 * Middleware que verifica se é pelo menos EDITOR (Nível 2)
 */
const editorOrAbove = minRole(UserRole.EDITOR);

/**
 * Middleware que verifica se é pelo menos TRAMITADOR (qualquer autenticado válido)
 */
const tramitadorOrAbove = minRole(UserRole.TRAMITADOR);

module.exports = {
  minRole,
  exactRoles,
  adminOnly,
  gestorOrAbove,
  moderadorOrAbove,
  editorOrAbove,
  tramitadorOrAbove
};
