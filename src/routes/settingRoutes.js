const express = require('express');
const SettingController = require('../controllers/SettingController');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

// GET /api/settings - Retorna configurações (público)
router.get('/', SettingController.getSettings);

// PUT /api/settings - Atualiza configurações (requer Admin)
router.put('/', authenticateToken, requireAdmin, SettingController.updateSettings);

module.exports = router;