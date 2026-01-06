const express = require('express');
const router = express.Router();
const controller = require('../controllers/domain.controller');
const auth = require('../middleware/auth.middleware');

// Todas as rotas requerem autenticação
router.use(auth.verificarToken);

// Objects
router.get('/objects', controller.listObjects);
router.post('/objects', controller.createObject);
router.put('/objects/:id', controller.updateObject);
router.delete('/objects/:id', controller.deleteObject);

// Creditors
router.get('/creditors', controller.listCreditors);
router.post('/creditors', controller.createCreditor);
router.put('/creditors/:id', controller.updateCreditor);
router.delete('/creditors/:id', controller.deleteCreditor);

// Bodies (Órgãos Geradores)
router.get('/bodies', controller.listBodies);
router.post('/bodies', controller.createBody);
router.put('/bodies/:id', controller.updateBody);
router.delete('/bodies/:id', controller.deleteBody);

module.exports = router;
