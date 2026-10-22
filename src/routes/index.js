const express = require('express');
const authRoutes = require('./authRoutes');
const ticketRoutes = require('./ticketRoutes');
const userRoutes = require('./userRoutes');
const settingRoutes = require('./settingRoutes');
const TicketController = require('../controllers/TicketController');
const { optionalAuth } = require('../middlewares/auth');

const router = express.Router();

// Rotas de autenticação
router.use('/auth', authRoutes);

// Rotas de chamados
router.use('/tickets', ticketRoutes);

// Rotas de usuários
router.use('/users', userRoutes);

// Rotas de configurações
router.use('/settings', settingRoutes);

// Rotas de notificações
router.get('/notifications', optionalAuth, TicketController.getNotifications);
router.put('/notifications/:id/read', TicketController.markNotificationRead);

module.exports = router;