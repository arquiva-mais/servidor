'use strict';

/**
 * Enum de Roles de Usuário com Sistema Hierárquico de Pesos
 * Quanto maior o peso, mais permissões o usuário possui.
 * 
 * Níveis:
 * - TRAMITADOR (1): Visualiza e tramita setor
 * - EDITOR (2): Cadastra e Edita dados completos
 * - MODERADOR (3): Exclui (soft delete) e Atribui
 * - GESTOR (4): Prioriza e gerencia
 * - ADMIN (99): Gestão total
 */
const UserRole = Object.freeze({
  TRAMITADOR: 'tramitador',
  EDITOR: 'editor',
  MODERADOR: 'moderador',
  GESTOR: 'gestor',
  ADMIN: 'admin',

  // Métodos utilitários
  values: () => ['tramitador', 'editor', 'moderador', 'gestor', 'admin'],
  keys: () => ['TRAMITADOR', 'EDITOR', 'MODERADOR', 'GESTOR', 'ADMIN'],
  isValid: (value) => UserRole.values().includes(value),
  getLabel: (value) => {
    const labels = {
      'tramitador': 'Tramitador',
      'editor': 'Editor',
      'moderador': 'Moderador',
      'gestor': 'Gestor',
      'admin': 'Administrador'
    };
    return labels[value] || value;
  }
});

/**
 * Pesos hierárquicos para cada role
 * Regra: user.weight >= requiredRole.weight = acesso permitido
 */
const RoleWeights = Object.freeze({
  [UserRole.TRAMITADOR]: 1,  // Visualiza e tramita setor
  [UserRole.EDITOR]: 2,      // Cadastra e Edita dados completos
  [UserRole.MODERADOR]: 3,   // Exclui (soft delete) e Atribui
  [UserRole.GESTOR]: 4,      // Prioriza e gerencia
  [UserRole.ADMIN]: 99       // Gestão total
});

/**
 * Obtém o peso de uma role
 * @param {string} role - Role do usuário
 * @returns {number} - Peso da role (0 se inválida)
 */
const getRoleWeight = (role) => {
  return RoleWeights[role] || 0;
};

/**
 * Verifica se uma role tem permissão mínima
 * @param {string} userRole - Role do usuário
 * @param {string} requiredRole - Role mínima requerida
 * @returns {boolean}
 */
const hasMinRole = (userRole, requiredRole) => {
  const userWeight = getRoleWeight(userRole);
  const requiredWeight = getRoleWeight(requiredRole);
  return userWeight >= requiredWeight;
};

/**
 * Mapeia roles antigas para novas (migração)
 * @param {string} oldRole - Role antiga
 * @returns {string} - Nova role
 */
const migrateRole = (oldRole) => {
  const migration = {
    'admin': UserRole.ADMIN,
    'user': UserRole.EDITOR,
    // Migração dos nomes antigos para novos
    'operador': UserRole.TRAMITADOR,
    'tecnico': UserRole.EDITOR,
    'gestor': UserRole.MODERADOR,
    'diretor': UserRole.GESTOR
  };
  return migration[oldRole] || UserRole.TRAMITADOR;
};

module.exports = {
  UserRole,
  RoleWeights,
  getRoleWeight,
  hasMinRole,
  migrateRole
};
