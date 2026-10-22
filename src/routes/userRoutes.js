const express = require('express');
const UserController = require('../controllers/UserController');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middlewares/auth');

const router = express.Router();

// GET /api/users - Lista todos os usuários
router.get('/', optionalAuth, UserController.getUsers);

// POST /api/users - Cria novo usuário (requer Admin)
router.post('/', authenticateToken, requireAdmin, UserController.createUser);

// PUT /api/users/:id - Atualiza usuário (próprio usuário ou Admin)
router.put('/:id', authenticateToken, UserController.updateUser);

// DELETE /api/users/:id - Exclui usuário (requer Admin)
router.delete('/:id', authenticateToken, requireAdmin, UserController.deleteUser);

module.exports = router;