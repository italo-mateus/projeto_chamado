// Cliente API para ResolveOS
const API = {
  baseUrl: '/api',

  /**
   * Obtém token de autenticação do armazenamento local
   * @returns {string|null} Token JWT ou null
   */
  getToken() {
    return localStorage.getItem('resolveos_token') || sessionStorage.getItem('resolveos_token');
  },

  /**
   * Armazena token de autenticação
   * @param {string} token - Token JWT
   * @param {boolean} remember - Se deve persistir no localStorage
   */
  setToken(token, remember = true) {
    if (remember) {
      localStorage.setItem('resolveos_token', token);
    } else {
      sessionStorage.setItem('resolveos_token', token);
    }
  },

  /**
   * Remove token de autenticação
   */
  clearToken() {
    localStorage.removeItem('resolveos_token');
    sessionStorage.removeItem('resolveos_token');
  },

  /**
   * Faz requisição HTTP para a API
   * @param {string} endpoint - Endpoint da API
   * @param {Object} options - Opções do fetch
   * @returns {Promise<Object>} Resposta da API
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401 && !endpoint.includes('/auth/login')) {
          // Token expirado ou inválido
          this.clearToken();
          Auth.showAuthScreen();
        }
        throw new Error(data.error || 'Erro ao processar requisição');
      }

      return data;
    } catch (err) {
      console.error(`Erro na API [${options.method || 'GET'}] ${endpoint}:`, err);
      throw err;
    }
  },

  // Endpoints de Autenticação
  /**
   * Realiza login
   * @param {string} identifier - Usuário ou e-mail
   * @param {string} password - Senha
   * @returns {Promise<Object>} Dados do usuário e token
   */
  login(identifier, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password })
    });
  },

  /**
   * Registra novo usuário
   * @param {Object} userData - Dados do usuário
   * @returns {Promise<Object>} Dados do usuário e token
   */
  register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  /**
   * Solicita recuperação de senha
   * @param {string} identifier - Usuário ou e-mail
   * @returns {Promise<Object>} Resultado da solicitação
   */
  forgotPassword(identifier) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ identifier })
    });
  },

  /**
   * Redefine senha
   * @param {Object} payload - Dados para reset
   * @returns {Promise<Object>} Resultado do reset
   */
  resetPassword(payload) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  /**
   * Obtém dados do usuário logado
   * @returns {Promise<Object>} Dados do usuário
   */
  getMe() {
    return this.request('/auth/me');
  },

  // Endpoints de Chamados
  /**
   * Lista chamados com filtros
   * @param {Object} params - Parâmetros de filtro
   * @returns {Promise<Object>} Lista paginada de chamados
   */
  getTickets(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/tickets?${query}`);
  },

  /**
   * Busca chamado por ID
   * @param {string} id - ID do chamado
   * @returns {Promise<Object>} Dados do chamado
   */
  getTicket(id) {
    return this.request(`/tickets/${id}`);
  },

  /**
   * Cria novo chamado
   * @param {Object} ticketData - Dados do chamado
   * @returns {Promise<Object>} Chamado criado
   */
  createTicket(ticketData) {
    return this.request('/tickets', {
      method: 'POST',
      body: JSON.stringify(ticketData)
    });
  },

  /**
   * Atualiza chamado
   * @param {string} id - ID do chamado
   * @param {Object} updates - Campos a atualizar
   * @returns {Promise<Object>} Chamado atualizado
   */
  updateTicket(id, updates) {
    return this.request(`/tickets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  /**
   * Exclui chamado
   * @param {string} id - ID do chamado
   * @returns {Promise<Object>} Resultado da exclusão
   */
  deleteTicket(id) {
    return this.request(`/tickets/${id}`, {
      method: 'DELETE'
    });
  },

  /**
   * Adiciona comentário ao chamado
   * @param {string} ticketId - ID do chamado
   * @param {Object} commentData - Dados do comentário
   * @returns {Promise<Object>} Comentário criado
   */
  addComment(ticketId, commentData) {
    return this.request(`/tickets/${ticketId}/comments`, {
      method: 'POST',
      body: JSON.stringify(commentData)
    });
  },

  // Endpoints de Usuários
  /**
   * Lista todos os usuários
   * @returns {Promise<Array>} Lista de usuários
   */
  getUsers() {
    return this.request('/users');
  },

  /**
   * Cria novo usuário
   * @param {Object} userData - Dados do usuário
   * @returns {Promise<Object>} Usuário criado
   */
  createUser(userData) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  /**
   * Atualiza usuário
   * @param {string} id - ID do usuário
   * @param {Object} updates - Campos a atualizar
   * @returns {Promise<Object>} Usuário atualizado
   */
  updateUser(id, updates) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  /**
   * Exclui usuário
   * @param {string} id - ID do usuário
   * @returns {Promise<Object>} Resultado da exclusão
   */
  deleteUser(id) {
    return this.request(`/users/${id}`, {
      method: 'DELETE'
    });
  },

  // Endpoints de Clientes
  /**
   * Lista clientes
   * @returns {Promise<Array>} Lista de clientes
   */
  getClients() {
    return this.request('/clients');
  },

  /**
   * Cria novo cliente
   * @param {Object} clientData - Dados do cliente
   * @returns {Promise<Object>} Cliente criado
   */
  createClient(clientData) {
    return this.request('/clients', {
      method: 'POST',
      body: JSON.stringify(clientData)
    });
  },

  // Endpoints de Configurações
  /**
   * Obtém configurações do sistema
   * @returns {Promise<Object>} Configurações
   */
  getSettings() {
    return this.request('/settings');
  },

  /**
   * Atualiza configurações do sistema
   * @param {Object} settings - Novas configurações
   * @returns {Promise<Object>} Configurações atualizadas
   */
  updateSettings(settings) {
    return this.request('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  },

  // Endpoints de Notificações
  /**
   * Lista notificações
   * @returns {Promise<Array>} Lista de notificações
   */
  getNotifications() {
    return this.request('/notifications');
  },

  /**
   * Marca notificação como lida
   * @param {string} id - ID da notificação
   * @returns {Promise<Object>} Notificação atualizada
   */
  markNotificationRead(id) {
    return this.request(`/notifications/${id}/read`, {
      method: 'PUT'
    });
  }
};