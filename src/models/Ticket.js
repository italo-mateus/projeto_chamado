const dbInstance = require('../config/database');

/**
 * Formata data para tempo relativo (ex: "Há 5 min", "Há 2 horas", "Ontem")
 * @param {string} dateString - Data em formato ISO
 * @returns {string} Tempo formatado
 */
function formatTimeAgo(dateString) {
  const now = new Date();
  const past = new Date(dateString);
  const diffMinutes = Math.floor((now - past) / (1000 * 60));

  if (diffMinutes < 1) return 'Agora mesmo';
  if (diffMinutes < 60) return `Há ${diffMinutes} min`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `Há ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Ontem';
  return `Há ${diffDays} dias`;
}

/**
 * Modelo Ticket - Gerencia operações relacionadas a chamados
 * Utiliza banco de dados SQLite para persistência
 */
class Ticket {
  /**
   * Retorna chamados com filtros, paginação e métricas
   * @param {Object} query - Parâmetros de filtro e paginação
   * @param {Object} currentUser - Usuário atual logado
   * @returns {Object} Resultado com chamados, métricas e paginação
   */
  static findAll(query = {}, currentUser = null) {
    return dbInstance.getTickets(query, currentUser);
  }

  /**
   * Busca chamado por ID
   * @param {string} id - ID do chamado
   * @returns {Object|null} Chamado encontrado ou null
   */
  static findById(id) {
    return dbInstance.getTicketById(id);
  }

  /**
   * Cria novo chamado
   * @param {Object} ticketData - Dados do chamado
   * @returns {Object} Chamado criado
   */
  static create(ticketData) {
    return dbInstance.createTicket(ticketData);
  }

  /**
   * Atualiza chamado existente
   * @param {string} id - ID do chamado
   * @param {Object} updates - Campos a atualizar
   * @param {string} modifiedBy - Nome de quem fez a alteração
   * @returns {Object|null} Chamado atualizado ou null
   */
  static update(id, updates, modifiedBy = 'Administrador') {
    return dbInstance.updateTicket(id, updates, modifiedBy);
  }

  /**
   * Remove chamado
   * @param {string} id - ID do chamado
   * @returns {boolean} True se removido com sucesso
   */
  static delete(id) {
    return dbInstance.deleteTicket(id);
  }

  /**
   * Adiciona comentário ao chamado
   * @param {string} id - ID do chamado
   * @param {Object} commentData - Dados do comentário
   * @returns {Object|null} Comentário criado ou null
   */
  static addComment(id, commentData) {
    return dbInstance.addTicketComment(id, commentData);
  }

  /**
   * Retorna todas as notificações
   * @returns {Array} Lista de notificações
   */
  static getNotifications() {
    return dbInstance.getNotifications();
  }

  /**
   * Marca notificação como lida
   * @param {string} id - ID da notificação
   * @returns {Object|null} Notificação atualizada
   */
  static markNotificationRead(id) {
    return dbInstance.markNotificationRead(id);
  }
}

module.exports = Ticket;