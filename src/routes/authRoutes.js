const express = require('express');
const AuthController = require('../controllers/AuthController');
const { authenticateToken } = require('../middlewares/auth');

const router = express.Router();

// POST /api/auth/login - Realiza login do usuário
router.post('/login', AuthController.login);

// POST /api/auth/register - Registra novo usuário
router.post('/register', AuthController.register);

// POST /api/auth/forgot-password - Solicita recuperação de senha
router.post('/forgot-password', AuthController.forgotPassword);

// POST /api/auth/reset-password - Redefine senha
router.post('/reset-password', AuthController.resetPassword);

// GET /api/auth/me - Retorna dados do usuário logado (requer autenticação)
router.get('/me', authenticateToken, AuthController.me);

module.exports = router;