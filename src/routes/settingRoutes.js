const express = require('express');
const SettingController = require('../controllers/SettingController');
const { authenticateToken, requireSuperAdmin } = require('../middlewares/auth');

const router = express.Router();

// GET /api/settings - Retorna configurações (público)
router.get('/', SettingController.getSettings);

// PUT /api/settings - Atualiza configurações (requer Super Admin)
router.put('/', authenticateToken, requireSuperAdmin, SettingController.updateSettings);

module.exports = router;