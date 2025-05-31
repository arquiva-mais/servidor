const express = require('express');
const router = express.Router();
const orgaoController = require('../controllers/orgao.controller');
const { verificarToken, verificarRole } = require('../middleware/auth.middleware');
// TODO: Depois descomentar essa linha abaixo para deixar a rota mais segura
//router.use(verificarToken);

//TODO: Adicionar verificação de role na rota de post para deixar mais restrito
router.get('/', orgaoController.listar);
router.get('/:id', orgaoController.buscarPorId);
router.post('/', orgaoController.criar);
router.put('/:id', verificarRole(['admin']), orgaoController.atualizar);

module.exports = router;