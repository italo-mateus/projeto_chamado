const bcrypt = require('bcryptjs');
const dbInstance = require('../config/database');

/**
 * Modelo User - Gerencia operações relacionadas a usuários
 * Utiliza banco de dados SQLite para persistência
 */
class User {
  /**
   * Retorna todos os usuários (sem senha por segurança)
   * @returns {Array} Lista de usuários
   */
  static findAll() {
    const usuarios = dbInstance.getUsers();
    return usuarios.map(u => {
      const { password, ...safeUser } = u;
      return safeUser;
    });
  }

  /**
   * Busca usuário por ID
   * @param {string} id - ID do usuário
   * @returns {Object|null} Usuário encontrado ou null
   */
  static findById(id) {
    return dbInstance.getUserById(id);
  }

  /**
   * Busca usuário por username ou email
   * @param {string} identifier - Username ou email
   * @returns {Object|null} Usuário encontrado ou null
   */
  static findByUsernameOrEmail(identifier) {
    if (!identifier) return null;
    const term = identifier.toLowerCase().trim();
    return dbInstance.getUserByUsernameOrEmail(term);
  }

  /**
   * Gera hash da senha usando bcrypt
   * @param {string} password - Senha em texto plano
   * @returns {string} Hash da senha
   */
  static hashPassword(password) {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
  }

  /**
   * Verifica se a senha corresponde ao hash
   * @param {string} plain - Senha em texto plano
   * @param {string} hashed - Hash armazenado
   * @returns {boolean} True se a senha confere
   */
  static verifyPassword(plain, hashed) {
    return bcrypt.compareSync(plain, hashed);
  }

  /**
   * Cria novo usuário
   * @param {Object} userData - Dados do usuário
   * @returns {Object} Usuário criado (sem senha)
   */
  static create(userData) {
    // Gera hash da senha se não for já um hash
    const hashedPassword = userData.password.startsWith('$2')
      ? userData.password
      : this.hashPassword(userData.password);

    const novoUsuario = dbInstance.createUser({
      name: userData.name,
      email: userData.email,
      username: userData.username || userData.email.split('@')[0],
      password: hashedPassword,
      role: userData.role || 'client',
      roleLabel: userData.roleLabel || (userData.role === 'superadmin' ? 'Super Admin' : userData.role === 'attendant' ? 'Atendente' : 'Cliente'),
      department: userData.department || 'Geral',
      phone: userData.phone || '',
      avatar: userData.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userData.name)}&backgroundColor=2563eb`
    });

    const { password, ...safeUser } = novoUsuario;
    return safeUser;
  }

  /**
   * Atualiza usuário existente
   * @param {string} id - ID do usuário
   * @param {Object} updates - Campos a atualizar
   * @returns {Object|null} Usuário atualizado (sem senha) ou null
   */
  static update(id, updates) {
    // Se houver nova senha, gera hash
    if (updates.newPassword) {
      updates.password = this.hashPassword(updates.newPassword);
      delete updates.newPassword;
    }

    // Atualiza roleLabel se role mudou
    if (updates.role) {
      const labels = {
        superadmin: 'Super Admin',
        supervisor: 'Supervisor',
        attendant: 'Atendente',
        client: 'Cliente'
      };
      updates.roleLabel = labels[updates.role] || updates.role;
    }

    const atualizado = dbInstance.updateUser(id, updates);
    if (!atualizado) return null;

    const { password, ...safeUser } = atualizado;
    return safeUser;
  }

  /**
   * Remove usuário
   * @param {string} id - ID do usuário
   * @returns {boolean} True se removido com sucesso
   */
  static delete(id) {
    // Não permite excluir o admin mestre
    const usuario = dbInstance.getUserById(id);
    if (usuario && usuario.username === 'admin') return false;

    return dbInstance.deleteUser(id);
  }
}

module.exports = User;