const express = require('express');
const router = express.Router();
const RateLimit = require('express-rate-limit');
const controllerProcessos = require('../controllers/processo.controller');
const { verificarToken } = require('../middleware/auth.middleware');
const { minRole } = require('../middleware/roles.middleware');
const { UserRole } = require('../enums/userRole.enum');

// Apply rate limiter: max 100 requests per 15 minutes per IP
const limiter = RateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

router.use(limiter);
router.use(verificarToken);

// ============================================================
// NÍVEL 1 - TRAMITADOR (e superiores): Leitura e Tramitação
// ============================================================

// GET /processos - Listar processos
router.get('/', minRole(UserRole.TRAMITADOR), controllerProcessos.listar);

// GET /processos/listar-todos - Listar todos por órgão
router.get('/listar-todos', minRole(UserRole.TRAMITADOR), controllerProcessos.listarTodosPorOrgao);

// GET /processos/listar-por-id - Buscar por ID
router.get('/listar-por-id', minRole(UserRole.TRAMITADOR), controllerProcessos.listarPorId);

// PATCH /processos/:id/setor - Tramitar (atualizar setor)
router.patch('/:id/setor', minRole(UserRole.TRAMITADOR), controllerProcessos.atualizarSetor);

// ============================================================
// NÍVEL 2 - EDITOR (e superiores): Criar e Editar
// ============================================================

// POST /processos - Criar novo processo
router.post('/', minRole(UserRole.EDITOR), controllerProcessos.criar);

// PUT /processos/:id - Edição completa
router.put('/:id', minRole(UserRole.EDITOR), controllerProcessos.atualizar);

// ============================================================
// NÍVEL 3 - MODERADOR (e superiores): Excluir e Atribuir
// ============================================================

// DELETE /processos/:id - Soft delete (arquivar)
router.delete('/:id', minRole(UserRole.MODERADOR), controllerProcessos.deletar);

// GET /processos/usuarios-atribuicao - Lista usuários para atribuição
router.get('/usuarios-atribuicao', minRole(UserRole.MODERADOR), controllerProcessos.listarUsuariosParaAtribuicao);

// PATCH /processos/:id/atribuir - Atribuir responsável
router.patch('/:id/atribuir', minRole(UserRole.MODERADOR), controllerProcessos.atribuirResponsavel);

// ============================================================
// NÍVEL 4 - GESTOR (e superiores): Priorizar
// ============================================================

// PATCH /processos/:id/prioridade - Definir prioridade (placeholder)
router.patch('/:id/prioridade', minRole(UserRole.GESTOR), controllerProcessos.definirPrioridade);

module.exports = router;
