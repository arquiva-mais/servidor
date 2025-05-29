const express = require('express');
const router = express.Router();
const controllerProcessos = require('../controllers/processo.controller');
const { verificarToken, verificarRole } = require('../middleware/auth.middleware');

router.use(verificarToken)

router.get('/', controllerProcessos.listar);
router.get('/listar-por-id', controllerProcessos.listarPorId)
router.post('/', verificarRole(['admin']), controllerProcessos.criar);
router.put('/:id', verificarRole(['admin', 'user']) ,controllerProcessos.atualizar);
router.delete('/:id', verificarRole(['admin']), controllerProcessos.deletar);

module.exports = router;
