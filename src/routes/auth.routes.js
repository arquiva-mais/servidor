const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verificarToken, verificarRole } = require('../middleware/auth.middleware');

router.post('/registrar', authController.registrar);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', verificarToken, authController.logout);
router.get('/perfil', verificarToken, authController.perfil);
router.get('/verify', verificarToken, authController.verify);
router.get('/usuarios', verificarToken, verificarRole(['admin']), authController.listarUsuarios);


module.exports = router;