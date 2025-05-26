const express = require('express');
const router = express.Router();
const controllerProcessos = require('../controllers/processo.controller');

router.get('/', controllerProcessos.listar);
router.get('/listar-por-id', controllerProcessos.listarPorId)
router.post('/', controllerProcessos.criar);
router.put('/:id', controllerProcessos.atualizar);
router.delete('/:id', controllerProcessos.deletar);

module.exports = router;
