const dbInstance = require('../config/database');

/**
 * Modelo Setting - Gerencia configurações do sistema
 * Utiliza banco de dados SQLite para persistência
 */
class Setting {
  /**
   * Retorna configurações atuais do sistema
   * @returns {Object} Configurações do sistema
   */
  static get() {
    return dbInstance.getSettings();
  }

  /**
   * Atualiza configurações do sistema
   * @param {Object} newSettings - Novas configurações
   * @returns {Object} Configurações atualizadas
   */
  static update(newSettings) {
    return dbInstance.updateSettings(newSettings);
  }
}

module.exports = Setting;