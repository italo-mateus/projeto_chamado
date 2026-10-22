const express = require('express');
const TicketController = require('../controllers/TicketController');
const { authenticateToken, optionalAuth } = require('../middlewares/auth');

const router = express.Router();

// GET /api/tickets - Lista chamados (autenticação opcional para filtros de usuário)
router.get('/', optionalAuth, TicketController.getTickets);

// POST /api/tickets - Cria novo chamado (autenticação opcional para permitir chamados públicos)
router.post('/', optionalAuth, TicketController.createTicket);

// GET /api/tickets/:id - Busca chamado por ID
router.get('/:id', optionalAuth, TicketController.getTicketById);

// PUT /api/tickets/:id - Atualiza chamado
router.put('/:id', optionalAuth, TicketController.updateTicket);

// DELETE /api/tickets/:id - Exclui chamado (requer autenticação e role superadmin)
router.delete('/:id', authenticateToken, TicketController.deleteTicket);

// POST /api/tickets/:id/comments - Adiciona comentário ao chamado
router.post('/:id/comments', optionalAuth, TicketController.addComment);

module.exports = router;