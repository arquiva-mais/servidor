const express = require('express');
const router = express.Router();
const RateLimit = require('express-rate-limit');
const notificacaoController = require('../controllers/notificacao.controller');
const { verificarToken } = require('../middleware/auth.middleware');
const { minRole } = require('../middleware/roles.middleware');
const { UserRole } = require('../enums/userRole.enum');

// Apply rate limiter: max 100 requests per minute per IP
const limiter = RateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
});

router.use(limiter);
router.use(verificarToken);

// Todas as rotas requerem autenticação mínima (TRAMITADOR)

// GET /notificacoes - Listar notificações do usuário
router.get('/', minRole(UserRole.TRAMITADOR), notificacaoController.listar);

// PATCH /notificacoes/ler-todas - Marcar todas como lidas (DEVE vir antes de /:id)
router.patch('/ler-todas', minRole(UserRole.TRAMITADOR), notificacaoController.marcarTodasLidas);

// PATCH /notificacoes/:id/ler - Marcar uma específica como lida
router.patch('/:id/ler', minRole(UserRole.TRAMITADOR), notificacaoController.marcarLida);

module.exports = router;
