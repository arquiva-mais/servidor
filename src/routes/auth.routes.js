const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verificarToken, verificarRole } = require('../middleware/auth.middleware');
const { authLimiter } = require('../middleware/rateLimiters');

router.post('/registrar', verificarToken, verificarRole(['admin']), authController.registrar);
router.post('/login', authLimiter, authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', verificarToken, authController.logout);
router.get('/perfil', verificarToken, authController.perfil);
router.get('/verify', verificarToken, authController.verify);
router.get('/usuarios', verificarToken, verificarRole(['admin']), authController.listarUsuarios);
router.put('/usuarios/:id', verificarToken, verificarRole(['admin']), authController.atualizarUsuario);


module.exports = router;