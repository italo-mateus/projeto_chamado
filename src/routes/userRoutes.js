const express = require('express');
const UserController = require('../controllers/UserController');
const { authenticateToken, requireSuperAdmin, optionalAuth } = require('../middlewares/auth');

const router = express.Router();

// GET /api/users - Lista todos os usuários
router.get('/', optionalAuth, UserController.getUsers);

// POST /api/users - Cria novo usuário (requer Super Admin)
router.post('/', authenticateToken, requireSuperAdmin, UserController.createUser);

// PUT /api/users/:id - Atualiza usuário (próprio usuário ou Super Admin)
router.put('/:id', authenticateToken, UserController.updateUser);

// DELETE /api/users/:id - Exclui usuário (requer Super Admin)
router.delete('/:id', authenticateToken, requireSuperAdmin, UserController.deleteUser);

module.exports = router;