const Ticket = require('../models/Ticket');

/**
 * TicketController - Controlador de gerenciamento de chamados
 * Gerencia listagem, criação, atualização, exclusão e comentários de chamados
 */
class TicketController {
  /**
   * Lista chamados com filtros e paginação
   * GET /api/tickets
   * @param {Object} req - Requisição Express
   * @param {Object} res - Resposta Express
   */
  static getTickets(req, res) {
    try {
      const result = Ticket.findAll(req.query, req.user);
      return res.json(result);
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao carregar chamados.' });
    }
  }

  /**
   * Busca chamado por ID
   * GET /api/tickets/:id
   * @param {Object} req - Requisição Express
   * @param {Object} res - Resposta Express
   */
  static getTicketById(req, res) {
    const ticket = Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'Chamado não encontrado.' });
    }
    return res.json(ticket);
  }

  /**
   * Cria novo chamado
   * POST /api/tickets
   * @param {Object} req - Requisição Express
   * @param {Object} res - Resposta Express
   */
  static createTicket(req, res) {
    const { subject, description, priority, category, department, requesterName, assignedTo } = req.body;

    // Valida assunto obrigatório
    if (!subject || !subject.trim()) {
      return res.status(400).json({ error: 'O assunto do chamado é obrigatório.' });
    }

    // Define solicitante e departamento baseado no usuário logado
    const requester = requesterName || (req.user ? req.user.name : 'Usuário');
    const dept = department || (req.user ? req.user.department : 'Geral');

    const newTicket = Ticket.create({
      subject: subject.trim(),
      description: description ? description.trim() : '',
      priority: priority || 'MÉDIA',
      category: category || 'Suporte Geral',
      department: dept,
      requesterName: requester,
      assignedTo: assignedTo || null
    });

    return res.status(201).json({
      message: 'Chamado aberto com sucesso!',
      ticket: newTicket
    });
  }

  /**
   * Atualiza chamado existente
   * PUT /api/tickets/:id
   * @param {Object} req - Requisição Express
   * @param {Object} res - Resposta Express
   */
  static updateTicket(req, res) {
    const modifiedBy = req.user ? req.user.name : 'Sistema';
    const updated = Ticket.update(req.params.id, req.body, modifiedBy);

    if (!updated) {
      return res.status(404).json({ error: 'Chamado não encontrado.' });
    }

    return res.json({
      message: 'Chamado atualizado com sucesso!',
      ticket: updated
    });
  }

  /**
   * Remove chamado (apenas Super Admin)
   * DELETE /api/tickets/:id
   * @param {Object} req - Requisição Express
   * @param {Object} res - Resposta Express
   */
  static deleteTicket(req, res) {
    // Apenas Super Admin pode excluir chamados
    if (req.user && req.user.role !== 'superadmin' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Apenas Super Administradores podem excluir chamados.' });
    }

    const success = Ticket.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Chamado não encontrado.' });
    }

    return res.json({ message: 'Chamado excluído com sucesso!' });
  }

  /**
   * Adiciona comentário ao chamado
   * POST /api/tickets/:id/comments
   * @param {Object} req - Requisição Express
   * @param {Object} res - Resposta Express
   */
  static addComment(req, res) {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Conteúdo da mensagem não pode ser vazio.' });
    }

    // Define autor baseado no usuário logado
    const author = req.user ? req.user.name : (req.body.author || 'Atendente');
    const authorRole = req.user ? (req.user.roleLabel || req.user.role) : 'Suporte';

    const comment = Ticket.addComment(req.params.id, {
      author,
      authorRole,
      content: content.trim()
    });

    if (!comment) {
      return res.status(404).json({ error: 'Chamado não encontrado.' });
    }

    return res.status(201).json({
      message: 'Comentário adicionado com sucesso!',
      comment
    });
  }

  /**
   * Lista notificações
   * GET /api/notifications
   * @param {Object} req - Requisição Express
   * @param {Object} res - Resposta Express
   */
  static getNotifications(req, res) {
    return res.json(Ticket.getNotifications());
  }

  /**
   * Marca notificação como lida
   * PUT /api/notifications/:id/read
   * @param {Object} req - Requisição Express
   * @param {Object} res - Resposta Express
   */
  static markNotificationRead(req, res) {
    const notif = Ticket.markNotificationRead(req.params.id);
    return res.json({ success: true, notif });
  }
}

module.exports = TicketController;