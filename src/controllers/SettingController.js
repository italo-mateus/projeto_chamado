const Setting = require('../models/Setting');

/**
 * SettingController - Controlador de configurações do sistema
 * Gerencia leitura e atualização das configurações globais
 */
class SettingController {
  /**
   * Retorna configurações atuais
   * GET /api/settings
   * @param {Object} req - Requisição Express
   * @param {Object} res - Resposta Express
   */
  static getSettings(req, res) {
    return res.json(Setting.get());
  }

  /**
   * Atualiza configurações
   * PUT /api/settings
   * @param {Object} req - Requisição Express
   * @param {Object} res - Resposta Express
   */
  static updateSettings(req, res) {
    const updated = Setting.update(req.body);
    return res.json({
      message: 'Configurações atualizadas com sucesso!',
      settings: updated
    });
  }
}

module.exports = SettingController;