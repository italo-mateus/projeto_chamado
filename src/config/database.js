const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

// Caminho do arquivo do banco de dados SQLite
const DB_DIR = path.join(__dirname, '..', '..', 'data');
const DB_FILE = path.join(DB_DIR, 'database.sqlite');

// Garante que o diretório de dados existe
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Instancia o banco de dados SQLite
const db = new Database(DB_FILE);

// Habilita chaves estrangeiras
db.pragma('foreign_keys = ON');

/**
 * Inicializa as tabelas do banco de dados
 * Cria a estrutura necessária se não existir
 */
function inicializarTabelas() {
  // Tabela de usuários
  db.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'client',
      roleLabel TEXT,
      department TEXT,
      phone TEXT,
      avatar TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      createdAt TEXT NOT NULL,
      updatedAt TEXT
    )
  `);

  // Tabela de chamados (tickets)
  db.exec(`
    CREATE TABLE IF NOT EXISTS chamados (
      id TEXT PRIMARY KEY,
      idNumber INTEGER NOT NULL UNIQUE,
      subject TEXT NOT NULL,
      requesterName TEXT NOT NULL,
      department TEXT,
      priority TEXT NOT NULL DEFAULT 'MÉDIA',
      status TEXT NOT NULL DEFAULT 'Em Aberto',
      assignedTo TEXT,
      category TEXT,
      description TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    )
  `);

  // Tabela de comentários dos chamados
  db.exec(`
    CREATE TABLE IF NOT EXISTS comentarios (
      id TEXT PRIMARY KEY,
      chamadoId TEXT NOT NULL,
      author TEXT NOT NULL,
      authorRole TEXT,
      content TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (chamadoId) REFERENCES chamados(id) ON DELETE CASCADE
    )
  `);

  // Tabela de configurações do sistema
  db.exec(`
    CREATE TABLE IF NOT EXISTS configuracoes (
      chave TEXT PRIMARY KEY,
      valor TEXT NOT NULL
    )
  `);

  // Tabela de notificações
  db.exec(`
    CREATE TABLE IF NOT EXISTS notificacoes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      time TEXT,
      read INTEGER NOT NULL DEFAULT 0,
      ticketId TEXT,
      createdAt TEXT NOT NULL
    )
  `);

  // Tabela de clientes
  db.exec(`
    CREATE TABLE IF NOT EXISTS clientes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      department TEXT,
      phone TEXT,
      company TEXT,
      activeTickets INTEGER NOT NULL DEFAULT 0
    )
  `);
}

/**
 * Gera os dados iniciais para popular o banco
 * @returns {Object} Objeto com arrays de dados iniciais
 */
function obterDadosIniciais() {
  const salt = bcrypt.genSaltSync(10);
  const adminPasswordHash = bcrypt.hashSync('123', salt);
  const attendantPasswordHash = bcrypt.hashSync('123456', salt);

  const usuarios = [
    {
      id: 'usr_admin',
      username: 'admin',
      name: 'Carlos Silva',
      email: 'admin@resolveos.com',
      password: adminPasswordHash,
      role: 'admin',
      roleLabel: 'Admin',
      department: 'Tecnologia da Informação',
      phone: '(11) 98765-4321',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256',
      status: 'active',
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString()
    },
    {
      id: 'usr_mariana',
      username: 'mariana.costa',
      name: 'Mariana Costa',
      email: 'mariana@resolveos.com',
      password: attendantPasswordHash,
      role: 'attendant',
      roleLabel: 'Atendente',
      department: 'Suporte Técnico',
      phone: '(11) 97654-3210',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=256',
      status: 'active',
      createdAt: new Date(Date.now() - 25 * 86400000).toISOString()
    },
    {
      id: 'usr_felipe',
      username: 'felipe.melo',
      name: 'Felipe Melo',
      email: 'felipe@resolveos.com',
      password: attendantPasswordHash,
      role: 'attendant',
      roleLabel: 'Atendente',
      department: 'Redes e Infra',
      phone: '(11) 96543-2109',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256',
      status: 'active',
      createdAt: new Date(Date.now() - 20 * 86400000).toISOString()
    }
  ];

  const clientes = [
    { id: 'cli_1', name: 'Ana Souza', email: 'ana.souza@empresa.com', department: 'RH', phone: '(11) 95432-1098', company: 'Matriz São Paulo', activeTickets: 1 },
    { id: 'cli_2', name: 'João Silva', email: 'joao.silva@empresa.com', department: 'Financeiro', phone: '(11) 94321-0987', company: 'Matriz São Paulo', activeTickets: 1 },
    { id: 'cli_3', name: 'Lucas Lima', email: 'lucas.lima@empresa.com', department: 'Vendas', phone: '(11) 93210-9876', company: 'Filial Sul', activeTickets: 1 },
    { id: 'cli_4', name: 'Clara Melo', email: 'clara.melo@empresa.com', department: 'Marketing', phone: '(11) 92109-8765', company: 'Matriz São Paulo', activeTickets: 0 },
    { id: 'cli_5', name: 'Roberto Dias', email: 'roberto.dias@empresa.com', department: 'Logística', phone: '(11) 91098-7654', company: 'Filial Campinas', activeTickets: 1 },
    { id: 'cli_6', name: 'Beatriz Santos', email: 'beatriz.santos@empresa.com', department: 'Jurídico', phone: '(11) 90987-6543', company: 'Matriz São Paulo', activeTickets: 0 },
    { id: 'cli_7', name: 'Marcos Oliveira', email: 'marcos.oliveira@empresa.com', department: 'Engenharia', phone: '(11) 99876-5432', company: 'Filial RJ', activeTickets: 2 }
  ];

  const now = Date.now();

  // Apenas 3 chamados iniciais essenciais
  const chamados = [
    {
      id: 'TICK-1001',
      idNumber: 1001,
      subject: 'Erro no acesso ao sistema financeiro',
      requesterName: 'Ana Souza',
      department: 'RH',
      priority: 'ALTA',
      status: 'Em Aberto',
      assignedTo: null,
      category: 'Sistemas Internos',
      description: 'Ao tentar realizar o login no ERP financeiro, a tela trava com o erro 502 Bad Gateway. Necessito de liberação urgente para envio da folha.',
      createdAt: new Date(now - 52 * 60 * 1000).toISOString(),
      updatedAt: new Date(now - 12 * 60 * 1000).toISOString()
    },
    {
      id: 'TICK-1002',
      idNumber: 1002,
      subject: 'Instalação de certificado digital',
      requesterName: 'João Silva',
      department: 'Financeiro',
      priority: 'MÉDIA',
      status: 'Em Progresso',
      assignedTo: 'Mariana Costa',
      category: 'Certificados & Segurança',
      description: 'Novo token A3 da Certisign precisa ser instalado na máquina 04 do departamento fiscal para emissão de notas de serviço.',
      createdAt: new Date(now - 85 * 60 * 1000).toISOString(),
      updatedAt: new Date(now - 45 * 60 * 1000).toISOString()
    },
    {
      id: 'TICK-1003',
      idNumber: 1003,
      subject: 'Configuração de e-mail corporativo',
      requesterName: 'Clara Melo',
      department: 'Marketing',
      priority: 'BAIXA',
      status: 'Resolvido',
      assignedTo: 'Mariana Costa',
      category: 'E-mail & Colaboração',
      description: 'Solicito auxílio para configurar a nova conta de e-mail marketing no Microsoft Outlook desktop.',
      createdAt: new Date(now - 160 * 60 * 1000).toISOString(),
      updatedAt: new Date(now - 120 * 60 * 1000).toISOString()
    }
  ];

  const configuracoes = {
    companyName: 'ResolveOS Enterprise',
    supportEmail: 'suporte@resolveos.com',
    slaHighHours: 2,
    slaMediumHours: 8,
    slaLowHours: 24,
    allowPublicRegistration: true,
    autoAssignTickets: false,
    theme: 'dark'
  };

  const notificacoes = [
    {
      id: 'notif_1',
      title: 'Novo chamado aberto',
      message: 'Ana Souza abriu o chamado #1001 (Erro no acesso ao sistema financeiro)',
      time: 'Há 12 min',
      read: 0,
      ticketId: 'TICK-1001',
      createdAt: new Date(now - 12 * 60 * 1000).toISOString()
    },
    {
      id: 'notif_2',
      title: 'Chamado atribuído',
      message: 'Você foi atribuído ao chamado #1002 por Carlos Silva',
      time: 'Há 5 horas',
      read: 0,
      ticketId: 'TICK-1002',
      createdAt: new Date(now - 5 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'notif_3',
      title: 'Chamado resolvido',
      message: 'Mariana Costa resolveu o chamado #1003',
      time: 'Há 2 horas',
      read: 1,
      ticketId: 'TICK-1003',
      createdAt: new Date(now - 2 * 60 * 60 * 1000).toISOString()
    }
  ];

  return {
    usuarios,
    clientes,
    chamados,
    configuracoes,
    notificacoes
  };
}

/**
 * Popula o banco com dados iniciais se estiver vazio
 */
function popularDadosIniciais() {
  const usuarioCount = db.prepare('SELECT COUNT(*) as count FROM usuarios').get().count;
  
  if (usuarioCount === 0) {
    console.log('🌱 Inicializando banco de dados SQLite com dados padrão e Super Admin (admin / 123)...');
    
    const dados = obterDadosIniciais();
    
    // Insere usuários
    const insertUsuario = db.prepare(`
      INSERT INTO usuarios (id, username, name, email, password, role, roleLabel, department, phone, avatar, status, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    for (const u of dados.usuarios) {
      insertUsuario.run(u.id, u.username, u.name, u.email, u.password, u.role, u.roleLabel, u.department, u.phone, u.avatar, u.status, u.createdAt);
    }

    // Insere clientes
    const insertCliente = db.prepare(`
      INSERT INTO clientes (id, name, email, department, phone, company, activeTickets)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    for (const c of dados.clientes) {
      insertCliente.run(c.id, c.name, c.email, c.department, c.phone, c.company, c.activeTickets);
    }

    // Insere chamados
    const insertChamado = db.prepare(`
      INSERT INTO chamados (id, idNumber, subject, requesterName, department, priority, status, assignedTo, category, description, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    for (const c of dados.chamados) {
      insertChamado.run(c.id, c.idNumber, c.subject, c.requesterName, c.department, c.priority, c.status, c.assignedTo, c.category, c.description, c.createdAt, c.updatedAt);
    }

    // Insere comentários iniciais para cada chamado
    const insertComentario = db.prepare(`
      INSERT INTO comentarios (id, chamadoId, author, authorRole, content, createdAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    for (const c of dados.chamados) {
      insertComentario.run(`cmt_${c.idNumber}_1`, c.id, c.requesterName, 'Solicitante', c.description || 'Chamado registrado no sistema.', c.createdAt);
      
      if (c.assignedTo) {
        insertComentario.run(`cmt_${c.idNumber}_2`, c.id, c.assignedTo, 'Atendente', 'Chamado assumido. Em análise pela equipe técnica.', c.updatedAt);
      }
    }

    // Insere configurações
    const insertConfig = db.prepare(`
      INSERT OR REPLACE INTO configuracoes (chave, valor) VALUES (?, ?)
    `);
    
    for (const [chave, valor] of Object.entries(dados.configuracoes)) {
      insertConfig.run(chave, JSON.stringify(valor));
    }

    // Insere notificações
    const insertNotificacao = db.prepare(`
      INSERT INTO notificacoes (id, title, message, time, read, ticketId, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    for (const n of dados.notificacoes) {
      insertNotificacao.run(n.id, n.title, n.message, n.time, n.read, n.ticketId, n.createdAt);
    }
    
    console.log('✅ Banco de dados SQLite inicializado com sucesso!');
  } else {
    // Garante que o usuário admin existe
    garantirUsuarioAdmin();
  }
}

/**
 * Garante que o usuário admin mestre existe
 */
function garantirUsuarioAdmin() {
  const admin = db.prepare('SELECT * FROM usuarios WHERE username = ? OR role = ?').get('admin', 'admin');
  const salt = bcrypt.genSaltSync(10);
  const adminPasswordHash = bcrypt.hashSync('123', salt);

  if (!admin) {
    db.prepare(`
      INSERT INTO usuarios (id, username, name, email, password, role, roleLabel, department, phone, avatar, status, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run('usr_admin', 'admin', 'Carlos Silva', 'admin@resolveos.com', adminPasswordHash, 'admin', 'Admin', 'Tecnologia da Informação', '(11) 98765-4321', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256', 'active', new Date().toISOString());
  }
}

// Inicializa tabelas e dados
inicializarTabelas();
popularDadosIniciais();

/**
 * Classe Database - Interface para operações no banco SQLite
 * Mantém compatibilidade com a API anterior baseada em JSON
 */
class DatabaseSQLite {
  constructor() {
    this.db = db;
  }

  // ==================== USUÁRIOS ====================

  /**
   * Retorna todos os usuários (sem senha)
   * @returns {Array} Lista de usuários
   */
  getUsers() {
    const rows = this.db.prepare('SELECT id, username, name, email, role, roleLabel, department, phone, avatar, status, createdAt, updatedAt FROM usuarios').all();
    return rows;
  }

  /**
   * Busca usuário por ID
   * @param {string} id - ID do usuário
   * @returns {Object|null} Usuário encontrado ou null
   */
  getUserById(id) {
    return this.db.prepare('SELECT * FROM usuarios WHERE id = ?').get(id);
  }

  /**
   * Busca usuário por username ou email
   * @param {string} identifier - Username ou email
   * @returns {Object|null} Usuário encontrado ou null
   */
  getUserByUsernameOrEmail(identifier) {
    const term = identifier.toLowerCase().trim();
    return this.db.prepare('SELECT * FROM usuarios WHERE LOWER(username) = ? OR LOWER(email) = ?').get(term, term);
  }

  /**
   * Cria novo usuário
   * @param {Object} userData - Dados do usuário
   * @returns {Object} Usuário criado
   */
  createUser(userData) {
    const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    
    const stmt = this.db.prepare(`
      INSERT INTO usuarios (id, username, name, email, password, role, roleLabel, department, phone, avatar, status, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      id,
      userData.username || userData.email.split('@')[0],
      userData.name,
      userData.email,
      userData.password,
      userData.role || 'client',
      userData.roleLabel || 'Cliente',
      userData.department || 'Geral',
      userData.phone || '',
      userData.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userData.name)}&backgroundColor=2563eb`,
      'active',
      now
    );
    
    return this.getUserById(id);
  }

  /**
   * Atualiza usuário
   * @param {string} id - ID do usuário
   * @param {Object} updates - Campos a atualizar
   * @returns {Object|null} Usuário atualizado ou null
   */
  updateUser(id, updates) {
    const usuario = this.getUserById(id);
    if (!usuario) return null;

    const campos = [];
    const valores = [];

    for (const [chave, valor] of Object.entries(updates)) {
      if (chave !== 'id' && chave !== 'createdAt' && chave !== 'password') {
        campos.push(`${chave} = ?`);
        valores.push(valor);
      }
    }

    if (updates.password) {
      campos.push('password = ?');
      valores.push(updates.password);
    }

    if (campos.length === 0) return usuario;

    campos.push('updatedAt = ?');
    valores.push(new Date().toISOString());
    valores.push(id);

    this.db.prepare(`UPDATE usuarios SET ${campos.join(', ')} WHERE id = ?`).run(...valores);
    return this.getUserById(id);
  }

  /**
   * Remove usuário
   * @param {string} id - ID do usuário
   * @returns {boolean} Sucesso da operação
   */
  deleteUser(id) {
    const usuario = this.getUserById(id);
    if (!usuario) return false;
    if (usuario.username === 'admin') return false; // Protege admin mestre

    const result = this.db.prepare('DELETE FROM usuarios WHERE id = ?').run(id);
    return result.changes > 0;
  }

  // ==================== CHAMADOS ====================

  /**
   * Retorna todos os chamados com paginação e filtros
   * @param {Object} query - Parâmetros de filtro e paginação
   * @param {Object} currentUser - Usuário atual
   * @returns {Object} Resultado com chamados, métricas e paginação
   */
  getTickets(query = {}, currentUser = null) {
    let sql = 'SELECT * FROM chamados';
    const params = [];
    const conditions = [];

    // Filtro de aba
    const tab = query.tab || 'todos';
    if (tab === 'meus' && currentUser) {
      conditions.push('(assignedTo = ? OR requesterName = ?)');
      params.push(currentUser.name, currentUser.name);
    } else if (tab === 'nao_atribuidos') {
      conditions.push('(assignedTo IS NULL OR assignedTo = ?)');
      params.push('Sem Atendente');
    } else if (tab === 'aguardando') {
      conditions.push('status = ?');
      params.push('Aguardando Resposta');
    }

    // Filtro de prioridade
    if (query.priority && query.priority !== 'todas' && query.priority !== 'Todos') {
      conditions.push('LOWER(priority) = ?');
      params.push(query.priority.toLowerCase());
    }

    // Filtro de status
    if (query.status && query.status !== 'todos' && query.status !== 'Todos') {
      conditions.push('LOWER(status) = ?');
      params.push(query.status.toLowerCase());
    }

    // Filtro de busca
    if (query.search && query.search.trim() !== '') {
      const q = `%${query.search.trim().toLowerCase()}%`;
      conditions.push(`(
        CAST(idNumber AS TEXT) LIKE ? OR
        LOWER(subject) LIKE ? OR
        LOWER(requesterName) LIKE ? OR
        LOWER(department) LIKE ? OR
        LOWER(assignedTo) LIKE ? OR
        LOWER(description) LIKE ?
      )`);
      for (let i = 0; i < 6; i++) params.push(q);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    // Ordenação: mais recentes primeiro
    sql += ' ORDER BY updatedAt DESC';

    // Conta total para paginação
    const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as total');
    const totalFiltered = this.db.prepare(countSql).get(...params).total;

    // Paginação
    const pageNum = parseInt(query.page, 10) || 1;
    const limitNum = parseInt(query.limit, 10) || 10;
    const totalPages = Math.ceil(totalFiltered / limitNum) || 1;
    const startIndex = (pageNum - 1) * limitNum;

    sql += ' LIMIT ? OFFSET ?';
    params.push(limitNum, startIndex);

    const rows = this.db.prepare(sql).all(...params);

    // Busca comentários para cada chamado
    const chamadosComComentarios = rows.map(t => {
      const comentarios = this.db.prepare('SELECT * FROM comentarios WHERE chamadoId = ? ORDER BY createdAt ASC').all(t.id);
      return { ...t, comments: comentarios };
    });

    // Métricas gerais (sem filtros)
    const metricas = {
      total: this.db.prepare('SELECT COUNT(*) as count FROM chamados').get().count,
      open: this.db.prepare("SELECT COUNT(*) as count FROM chamados WHERE status = 'Em Aberto'").get().count,
      inProgress: this.db.prepare("SELECT COUNT(*) as count FROM chamados WHERE status = 'Em Progresso'").get().count,
      resolvedToday: this.db.prepare(`
        SELECT COUNT(*) as count FROM chamados 
        WHERE status = 'Resolvido' 
        AND datetime(updatedAt) >= datetime('now', '-24 hours')
      `).get().count
    };

    // Formata tempo relativo
    const formatTimeAgo = (dateString) => {
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
    };

    const ticketsFormatados = chamadosComComentarios.map(t => ({
      ...t,
      updatedAgo: formatTimeAgo(t.updatedAt || t.createdAt),
      createdAgo: formatTimeAgo(t.createdAt)
    }));

    return {
      tickets: ticketsFormatados,
      metrics: metricas,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalFiltered,
        totalPages,
        displayStart: totalFiltered > 0 ? startIndex + 1 : 0,
        displayEnd: Math.min(startIndex + limitNum, totalFiltered)
      }
    };
  }

  /**
   * Busca chamado por ID
   * @param {string} id - ID do chamado
   * @returns {Object|null} Chamado encontrado ou null
   */
  getTicketById(id) {
    const ticket = this.db.prepare('SELECT * FROM chamados WHERE id = ? OR CAST(idNumber AS TEXT) = ?').get(id, id);
    if (!ticket) return null;

    const comentarios = this.db.prepare('SELECT * FROM comentarios WHERE chamadoId = ? ORDER BY createdAt ASC').all(ticket.id);
    
    const formatTimeAgo = (dateString) => {
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
    };

    return {
      ...ticket,
      comments: comentarios,
      updatedAgo: formatTimeAgo(ticket.updatedAt || ticket.createdAt),
      createdAgo: formatTimeAgo(ticket.createdAt)
    };
  }

  /**
   * Cria novo chamado
   * @param {Object} ticketData - Dados do chamado
   * @returns {Object} Chamado criado
   */
  createTicket(ticketData) {
    const highestId = this.db.prepare('SELECT MAX(idNumber) as maxId FROM chamados').get().maxId || 1000;
    const idNumber = highestId + 1;
    const now = new Date().toISOString();

    const newTicket = {
      id: `TICK-${idNumber}`,
      idNumber,
      subject: ticketData.subject,
      requesterName: ticketData.requesterName,
      department: ticketData.department || 'Geral',
      priority: ticketData.priority || 'MÉDIA',
      status: ticketData.status || 'Em Aberto',
      assignedTo: ticketData.assignedTo || null,
      category: ticketData.category || 'Suporte Geral',
      description: ticketData.description || '',
      createdAt: now,
      updatedAt: now
    };

    this.db.prepare(`
      INSERT INTO chamados (id, idNumber, subject, requesterName, department, priority, status, assignedTo, category, description, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      newTicket.id, newTicket.idNumber, newTicket.subject, newTicket.requesterName,
      newTicket.department, newTicket.priority, newTicket.status, newTicket.assignedTo,
      newTicket.category, newTicket.description, newTicket.createdAt, newTicket.updatedAt
    );

    // Comentário inicial
    this.db.prepare(`
      INSERT INTO comentarios (id, chamadoId, author, authorRole, content, createdAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(`cmt_${idNumber}_1`, newTicket.id, ticketData.requesterName, 'Solicitante', ticketData.description || 'Chamado registrado no sistema.', now);

    // Notificação
    this.db.prepare(`
      INSERT INTO notificacoes (id, title, message, time, read, ticketId, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(`notif_${Date.now()}`, 'Novo chamado aberto', `${ticketData.requesterName} abriu o chamado #${idNumber} (${ticketData.subject})`, 'Agora mesmo', 0, newTicket.id, now);

    return { ...newTicket, updatedAgo: 'Agora mesmo', comments: [] };
  }

  /**
   * Atualiza chamado
   * @param {string} id - ID do chamado
   * @param {Object} updates - Campos a atualizar
   * @param {string} modifiedBy - Autor da modificação
   * @returns {Object|null} Chamado atualizado ou null
   */
  updateTicket(id, updates, modifiedBy = 'Administrador') {
    const ticket = this.getTicketById(id);
    if (!ticket) return null;

    const now = new Date().toISOString();
    const campos = [];
    const valores = [];

    // Comentário de auditoria para mudança de status
    if (updates.status && updates.status !== ticket.status) {
      this.db.prepare(`
        INSERT INTO comentarios (id, chamadoId, author, authorRole, content, createdAt)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(`cmt_${Date.now()}`, id, modifiedBy, 'Audit', `Status alterado de "${ticket.status}" para "${updates.status}".`, now);
    }

    // Comentário de auditoria para mudança de responsável
    if (updates.assignedTo !== undefined && updates.assignedTo !== ticket.assignedTo) {
      this.db.prepare(`
        INSERT INTO comentarios (id, chamadoId, author, authorRole, content, createdAt)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(`cmt_${Date.now()}`, id, modifiedBy, 'Audit', `Responsável alterado para: ${updates.assignedTo || 'Sem Atendente'}.`, now);
    }

    for (const [chave, valor] of Object.entries(updates)) {
      if (chave !== 'id' && chave !== 'idNumber' && chave !== 'createdAt' && chave !== 'comments') {
        campos.push(`${chave} = ?`);
        valores.push(valor);
      }
    }

    if (campos.length > 0) {
      campos.push('updatedAt = ?');
      valores.push(now);
      valores.push(id);

      this.db.prepare(`UPDATE chamados SET ${campos.join(', ')} WHERE id = ?`).run(...valores);
    }

    return this.getTicketById(id);
  }

  /**
   * Adiciona comentário ao chamado
   * @param {string} id - ID do chamado
   * @param {Object} commentData - Dados do comentário
   * @returns {Object|null} Comentário criado ou null
   */
  addTicketComment(id, commentData) {
    const ticket = this.getTicketById(id);
    if (!ticket) return null;

    const now = new Date().toISOString();
    const comment = {
      id: `cmt_${Date.now()}`,
      author: commentData.author,
      authorRole: commentData.authorRole || 'Atendente',
      content: commentData.content,
      createdAt: now
    };

    this.db.prepare(`
      INSERT INTO comentarios (id, chamadoId, author, authorRole, content, createdAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(comment.id, id, comment.author, comment.authorRole, comment.content, comment.createdAt);

    // Atualiza updatedAt do chamado
    this.db.prepare('UPDATE chamados SET updatedAt = ? WHERE id = ?').run(now, id);

    return comment;
  }

  /**
   * Remove chamado
   * @param {string} id - ID do chamado
   * @returns {boolean} Sucesso da operação
   */
  deleteTicket(id) {
    const result = this.db.prepare('DELETE FROM chamados WHERE id = ? OR CAST(idNumber AS TEXT) = ?').run(id, id);
    return result.changes > 0;
  }

  // ==================== CLIENTES ====================

  /**
   * Retorna todos os clientes
   * @returns {Array} Lista de clientes
   */
  getClients() {
    return this.db.prepare('SELECT * FROM clientes').all();
  }

  /**
   * Cria novo cliente
   * @param {Object} clientData - Dados do cliente
   * @returns {Object} Cliente criado
   */
  createClient(clientData) {
    const newClient = {
      id: `cli_${Date.now()}`,
      ...clientData,
      activeTickets: 0
    };

    this.db.prepare(`
      INSERT INTO clientes (id, name, email, department, phone, company, activeTickets)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(newClient.id, newClient.name, newClient.email, newClient.department, newClient.phone, newClient.company, newClient.activeTickets);

    return newClient;
  }

  // ==================== CONFIGURAÇÕES ====================

  /**
   * Retorna configurações do sistema
   * @returns {Object} Configurações
   */
  getSettings() {
    const rows = this.db.prepare('SELECT chave, valor FROM configuracoes').all();
    const settings = {};
    for (const row of rows) {
      try {
        settings[row.chave] = JSON.parse(row.valor);
      } catch {
        settings[row.chave] = row.valor;
      }
    }
    return {
      companyName: 'ResolveOS Enterprise',
      supportEmail: 'suporte@resolveos.com',
      slaHighHours: 2,
      slaMediumHours: 8,
      slaLowHours: 24,
      ...settings
    };
  }

  /**
   * Atualiza configurações do sistema
   * @param {Object} newSettings - Novas configurações
   * @returns {Object} Configurações atualizadas
   */
  updateSettings(newSettings) {
    const stmt = this.db.prepare('INSERT OR REPLACE INTO configuracoes (chave, valor) VALUES (?, ?)');
    for (const [chave, valor] of Object.entries(newSettings)) {
      stmt.run(chave, JSON.stringify(valor));
    }
    return this.getSettings();
  }

  // ==================== NOTIFICAÇÕES ====================

  /**
   * Retorna todas as notificações
   * @returns {Array} Lista de notificações
   */
  getNotifications() {
    return this.db.prepare('SELECT * FROM notificacoes ORDER BY createdAt DESC').all();
  }

  /**
   * Marca notificação como lida
   * @param {string} id - ID da notificação
   * @returns {Object|null} Notificação atualizada
   */
  markNotificationRead(id) {
    this.db.prepare('UPDATE notificacoes SET read = 1 WHERE id = ?').run(id);
    return this.db.prepare('SELECT * FROM notificacoes WHERE id = ?').get(id);
  }
}

const dbInstance = new DatabaseSQLite();
module.exports = dbInstance;