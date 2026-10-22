const User = require('../models/User');
 
/**
 * UserController - Controlador de gerenciamento de usuários
 * Gerencia listagem, criação, atualização e exclusão de usuários
 */
class UserController {
  /**
   * Lista todos os usuários
   * GET /api/users
   * @param {Object} req - Requisição Express
   * @param {Object} res - Resposta Express
   */
  static getUsers(req, res) {
    return res.json(User.findAll());
  }
 
  /**
   * Cria novo usuário (apenas Admin)
   * POST /api/users
   * @param {Object} req - Requisição Express
   * @param {Object} res - Resposta Express
   */
  static createUser(req, res) {
    const { name, email, username, password, role, department, phone } = req.body;
 
    // Verifica permissão: apenas Admin
    const isAdmin = req.user && req.user.role === 'admin';
    if (!isAdmin) {
      return res.status(403).json({ error: 'Acesso restrito: Apenas Admin pode criar usuários.' });
    }
 
    // Valida campos obrigatórios
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nome, E-mail e Senha são obrigatórios.' });
    }
 
    // Verifica se email já existe
    const existing = User.findByUsernameOrEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'E-mail já cadastrado.' });
    }
 
    // Cria usuário com role padrão 'attendant'
    const newUser = User.create({
      name,
      email,
      username,
      password,
      role: role || 'attendant',
      department: department || 'Suporte Geral',
      phone: phone || ''
    });
 
    return res.status(201).json({
      message: 'Usuário cadastrado com sucesso!',
      user: newUser
    });
  }
 
  /**
   * Atualiza usuário existente
   * PUT /api/users/:id
   * @param {Object} req - Requisição Express
   * @param {Object} res - Resposta Express
   */
  static updateUser(req, res) {
    // Verifica permissão: próprio usuário ou Admin
    const isSelf = req.user && req.user.id === req.params.id;
    const isAdmin = req.user && req.user.role === 'admin';
 
    if (!isSelf && !isAdmin) {
      return res.status(403).json({ error: 'Você não tem permissão para alterar este usuário.' });
    }
 
    const updates = { ...req.body };
 
    // Impede não-admins de alterar role
    if (!isAdmin && updates.role) {
      delete updates.role;
    }
 
    // Impede não-admins de redefinir senha de outros usuários
    if (!isAdmin && !isSelf && updates.newPassword) {
      delete updates.newPassword;
    }
 
    const updated = User.update(req.params.id, updates);
    if (!updated) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }
 
    return res.json({
      message: 'Usuário atualizado com sucesso!',
      user: updated
    });
  }
 
  /**
   * Remove usuário (apenas Admin)
   * DELETE /api/users/:id
   * @param {Object} req - Requisição Express
   * @param {Object} res - Resposta Express
   */
  static deleteUser(req, res) {
    const isAdmin = req.user && req.user.role === 'admin';
    if (!isAdmin) {
      return res.status(403).json({ error: 'Acesso restrito: Apenas Admin pode excluir usuários.' });
    }
 
    // Impede auto-exclusão
    if (req.user && req.user.id === req.params.id) {
      return res.status(400).json({ error: 'Não é possível excluir o próprio usuário logado.' });
    }
 
    const success = User.delete(req.params.id);
    if (!success) {
      return res.status(400).json({ error: 'Não foi possível excluir o usuário ou o usuário é o Admin mestre.' });
    }
 
    return res.json({ message: 'Usuário removido com sucesso!' });
  }
}
 
module.exports = UserController;