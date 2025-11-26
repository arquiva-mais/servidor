const express = require('express');
const router = express.Router();
const RateLimit = require('express-rate-limit');
const controllerProcessos = require('../controllers/processo.controller');
const { verificarToken, verificarRole } = require('../middleware/auth.middleware');

// Apply rate limiter: max 100 requests per 15 minutes per IP
const limiter = RateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

router.use(limiter);
router.use(verificarToken)

router.get('/', controllerProcessos.listar);
router.get('/listar-todos', controllerProcessos.listarTodosPorOrgao)
router.get('/listar-por-id', controllerProcessos.listarPorId)
router.post('/', verificarRole(['admin']), controllerProcessos.criar);
router.put('/:id', verificarRole(['admin', 'user']) ,controllerProcessos.atualizar);
router.delete('/:id', verificarRole(['admin']), controllerProcessos.deletar);

module.exports = router;
