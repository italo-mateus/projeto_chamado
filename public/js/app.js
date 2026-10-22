// Main Application Controller for ResolveOS
const App = {
  user: null,
  currentTab: 'todos',
  currentPage: 1,
  currentSearch: '',
  currentPriority: 'todas',
  currentStatus: 'todos',
  currentDateFilter: 'recentes',
  currentTicketId: null,
  ticketsData: [],

  init(user) {
    this.user = user;
    this.setupUserProfile();
    this.setupViewPermissions();
    this.loadTickets();
    this.loadNotifications();
    this.loadAttendants();
    this.loadClients();
  },

setupUserProfile() {
    if (!this.user) return;
 
    // Sidebar Profile
    const userNameEl = document.getElementById('sidebarUserName');
    const userRoleEl = document.getElementById('sidebarUserRole');
    const userAvatarEl = document.getElementById('sidebarUserAvatar');
    const adminBadgeEl = document.getElementById('sidebarAdminBadge');
 
    if (userNameEl) userNameEl.textContent = this.user.name;
    if (userRoleEl) userRoleEl.textContent = this.user.roleLabel || this.user.role;
    if (userAvatarEl && this.user.avatar) userAvatarEl.src = this.user.avatar;
 
    const isAdmin = this.user.role === 'admin';
    if (adminBadgeEl) {
      if (isAdmin) {
        adminBadgeEl.classList.remove('hidden');
      } else {
        adminBadgeEl.classList.add('hidden');
      }
    }
 
    // Modal Profile
    const profileName = document.getElementById('userProfileName');
    const profileBadge = document.getElementById('userProfileBadge');
    const profileEmail = document.getElementById('userProfileEmail');
    const profileDept = document.getElementById('userProfileDept');
    const profilePerms = document.getElementById('userProfilePerms');
    const profileAvatar = document.getElementById('userProfileAvatar');
 
    if (profileName) profileName.textContent = this.user.name;
    if (profileEmail) profileEmail.textContent = this.user.email;
    if (profileDept) profileDept.textContent = this.user.department || 'Geral';
    if (profileAvatar && this.user.avatar) profileAvatar.src = this.user.avatar;
 
    if (profileBadge) {
      profileBadge.textContent = this.user.roleLabel || this.user.role;
      if (isAdmin) {
        profileBadge.className = 'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 mt-1';
      } else {
        profileBadge.className = 'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-700 text-slate-300 mt-1';
      }
    }
 
    if (profilePerms) {
      profilePerms.textContent = isAdmin ? 'Controle Total do Sistema (Admin)' : 'Acesso Padrão';
    }
 
    // New Ticket Modal Requester prefill
    const reqInput = document.getElementById('newTicketRequester');
    if (reqInput) reqInput.value = this.user.name;
  },

setupViewPermissions() {
    const isAdmin = this.user && this.user.role === 'admin';
    const banner = document.getElementById('superAdminBanner');
    const btnDeleteModal = document.getElementById('btnDeleteTicketModal');
    const navGerenciamento = document.getElementById('nav-gerenciamento');
    const navGerenciamentoDropdown = document.getElementById('nav-gerenciamento-dropdown');

    if (banner) {
      if (isAdmin) {
        banner.classList.remove('hidden');
      } else {
        banner.classList.add('hidden');
      }
    }

    if (btnDeleteModal) {
      if (isAdmin) {
        btnDeleteModal.classList.remove('hidden');
      } else {
        btnDeleteModal.classList.add('hidden');
      }
    }

    if (navGerenciamento) {
      if (isAdmin) {
        navGerenciamento.classList.remove('hidden');
      } else {
        navGerenciamento.classList.add('hidden');
      }
    }

    if (navGerenciamentoDropdown) {
      if (isAdmin) {
        navGerenciamentoDropdown.classList.remove('hidden');
      } else {
        navGerenciamentoDropdown.classList.add('hidden');
      }
    }
  },

  // View Navigation
  navigate(viewName) {
    // Hide all views
    const views = ['chamados', 'gerenciamento', 'perfil'];
    views.forEach(v => {
      const el = document.getElementById(`view${v.charAt(0).toUpperCase() + v.slice(1)}`);
      if (el) el.classList.add('hidden');

      const navBtn = document.getElementById(`nav-${v}`);
      if (navBtn) {
        navBtn.className = 'sidebar-item w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-dark-card transition-all';
      }
    });

    // Show selected view
    const currentView = document.getElementById(`view${viewName.charAt(0).toUpperCase() + viewName.slice(1)}`);
    if (currentView) currentView.classList.remove('hidden');

    const activeNav = document.getElementById(`nav-${viewName}`);
    if (activeNav) {
      activeNav.className = 'sidebar-item active w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium text-white bg-blue-600 shadow-md shadow-blue-600/30 transition-all';
    }

    // Refresh subview data
    if (viewName === 'chamados') {
      this.loadTickets();
    } else if (viewName === 'gerenciamento') {
      this.loadUserManagementTable();
    } else if (viewName === 'perfil') {
      this.loadMyProfileView();
    }

    lucide.createIcons();
  },

loadMyProfileView() {
    if (!this.user) return;
    const nameInput = document.getElementById('myProfileName');
    const emailInput = document.getElementById('myProfileEmail');
    const deptInput = document.getElementById('myProfileDept');
    const phoneInput = document.getElementById('myProfilePhone');
 
    if (nameInput) nameInput.value = this.user.name || '';
    if (emailInput) emailInput.value = this.user.email || '';
    if (deptInput) deptInput.value = this.user.department || '';
    if (phoneInput) phoneInput.value = this.user.phone || '';
 
    const cardAvatar = document.getElementById('profileCardAvatar');
    const cardName = document.getElementById('profileCardName');
    const cardRole = document.getElementById('profileCardRoleLabel');
    const cardEmail = document.getElementById('profileCardEmail');
    const cardDept = document.getElementById('profileCardDept');
    const cardPerms = document.getElementById('profileCardPerms');
 
    if (cardAvatar && this.user.avatar) cardAvatar.src = this.user.avatar;
    if (cardName) cardName.textContent = this.user.name;
    if (cardRole) cardRole.textContent = this.user.roleLabel || this.user.role;
    if (cardEmail) cardEmail.textContent = this.user.email;
    if (cardDept) cardDept.textContent = this.user.department || 'Geral';
    if (cardPerms) cardPerms.textContent = this.user.role === 'admin' ? 'Acesso Irrestrito (Admin)' : 'Acesso Padrão';
    lucide.createIcons();
  },

  async handleSaveMyProfile(event) {
    event.preventDefault();
    if (!this.user) return;

    const name = document.getElementById('myProfileName').value.trim();
    const email = document.getElementById('myProfileEmail').value.trim();
    const department = document.getElementById('myProfileDept').value.trim();
    const phone = document.getElementById('myProfilePhone').value.trim();

    try {
      const res = await API.updateUser(this.user.id, { name, email, department, phone });
      this.user = { ...this.user, ...res.user };
      this.setupUserProfile();
      this.loadMyProfileView();
      this.toast('Dados do perfil atualizados com sucesso!', 'success');
    } catch (err) {
      this.toast(err.message || 'Erro ao atualizar perfil', 'error');
    }
  },

  async handleChangeMyPassword(event) {
    event.preventDefault();
    if (!this.user) return;

    const newPass = document.getElementById('myNewPassword').value;
    const confirmPass = document.getElementById('myConfirmPassword').value;

    if (newPass.length < 3) {
      this.toast('A senha deve conter no mínimo 3 caracteres', 'error');
      return;
    }

    if (newPass !== confirmPass) {
      this.toast('A confirmação da senha não confere', 'error');
      return;
    }

    try {
      await API.updateUser(this.user.id, { newPassword: newPass });
      document.getElementById('myNewPassword').value = '';
      document.getElementById('myConfirmPassword').value = '';
      this.toast('Senha alterada com sucesso!', 'success');
    } catch (err) {
      this.toast(err.message || 'Erro ao alterar senha', 'error');
    }
  },

  // Filter Tabs
  setTab(tab) {
    this.currentTab = tab;
    this.currentPage = 1;

    ['todos', 'meus', 'nao_atribuidos', 'aguardando'].forEach(t => {
      const tabEl = document.getElementById(`tabFilter-${t}`);
      if (tabEl) {
        if (t === tab) {
          tabEl.className = 'filter-tab active pb-2 border-b-2 border-blue-500 text-blue-400 whitespace-nowrap transition';
        } else {
          tabEl.className = 'filter-tab pb-2 border-b-2 border-transparent text-slate-400 hover:text-slate-200 whitespace-nowrap transition';
        }
      }
    });

    this.loadTickets();
  },

  handleSearch(query) {
    this.currentSearch = query;
    this.currentPage = 1;
    this.debounce(() => this.loadTickets(), 250)();
  },

  debounce(func, wait) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  },

  handleFilterChange() {
    this.currentPriority = document.getElementById('filterPriority').value;
    this.currentStatus = document.getElementById('filterStatus').value;
    this.currentDateFilter = document.getElementById('filterDate').value;
    this.currentPage = 1;
    this.loadTickets();
  },

  // Tickets Data Loader
  async loadTickets() {
    const tableBody = document.getElementById('ticketsTableBody');
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" class="py-8 text-center text-slate-500 text-sm">
          <div class="inline-flex items-center gap-2">
            <svg class="animate-spin h-5 w-5 text-blue-500" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            <span>Carregando chamados...</span>
          </div>
        </td>
      </tr>
    `;

    try {
      const data = await API.getTickets({
        tab: this.currentTab,
        priority: this.currentPriority,
        status: this.currentStatus,
        search: this.currentSearch,
        page: this.currentPage,
        limit: 10
      });

      this.ticketsData = data.tickets;

      // Update metric cards
      document.getElementById('statTotalTickets').textContent = data.metrics.total !== undefined ? data.metrics.total : 0;
      document.getElementById('statOpenTickets').textContent = data.metrics.open !== undefined ? data.metrics.open : 0;
      document.getElementById('statInProgressTickets').textContent = data.metrics.inProgress !== undefined ? data.metrics.inProgress : 0;
      document.getElementById('statResolvedTickets').textContent = data.metrics.resolvedToday !== undefined ? data.metrics.resolvedToday : 0;

      // Render table rows
      this.renderTicketsTable(data.tickets);

      // Render pagination
      this.renderPagination(data.pagination);

    } catch (err) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" class="py-8 text-center text-rose-400 text-sm">
            Erro ao carregar chamados. Verifique sua conexão.
          </td>
        </tr>
      `;
    }
  },

  renderTicketsTable(tickets) {
    const tableBody = document.getElementById('ticketsTableBody');

    if (!tickets || tickets.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" class="py-12 text-center text-slate-400">
            <i data-lucide="inbox" class="w-8 h-8 mx-auto text-slate-500 mb-2"></i>
            <p class="font-medium text-sm">Nenhum chamado encontrado para os filtros selecionados.</p>
            <p class="text-xs text-slate-500 mt-1">Tente ajustar a busca ou limpar os filtros de prioridade e status.</p>
          </td>
        </tr>
      `;
      lucide.createIcons();
      return;
    }

    const priorityBadgeClass = {
      'CRÍTICA': 'badge-priority-critica',
      'ALTA': 'badge-priority-alta',
      'MÉDIA': 'badge-priority-media',
      'BAIXA': 'badge-priority-baixa'
    };

    const statusBadgeClass = {
      'Em Aberto': 'badge-status-aberto',
      'Em Progresso': 'badge-status-progresso',
      'Resolvido': 'badge-status-resolvido',
      'Aguardando Resposta': 'badge-status-aguardando'
    };

    let html = '';
    tickets.forEach(ticket => {
      const pClass = priorityBadgeClass[ticket.priority] || 'badge-priority-media';
      const sClass = statusBadgeClass[ticket.status] || 'badge-status-aberto';

      const assignedLabel = ticket.assignedTo
        ? `<span class="text-slate-200 font-medium">${ticket.assignedTo}</span>`
        : `<span class="text-slate-400">Sem Atendente</span>`;

      html += `
        <tr class="ticket-row border-b border-dark-border/40 hover:bg-dark-cardHover/70 transition-colors">
          <!-- ID -->
          <td class="py-4 px-6 font-mono text-xs font-semibold text-slate-300">
            #${ticket.idNumber}
          </td>

          <!-- Assunto e Solicitante (Template Match) -->
          <td class="py-4 px-6 max-w-md">
            <div class="font-semibold text-sm text-slate-100 hover:text-blue-400 cursor-pointer transition-colors line-clamp-1" onclick="App.openTicketDetails('${ticket.id}')">
              ${ticket.subject}
            </div>
            <div class="text-xs text-slate-400 mt-0.5">
              ${ticket.requesterName} <span class="text-slate-500">(${ticket.department || 'Geral'})</span>
            </div>
          </td>

          <!-- Prioridade -->
          <td class="py-4 px-6">
            <span class="${pClass}">${ticket.priority}</span>
          </td>

          <!-- Status -->
          <td class="py-4 px-6">
            <span class="${sClass}">${ticket.status}</span>
          </td>

          <!-- Responsável -->
          <td class="py-4 px-6 text-xs">
            ${assignedLabel}
          </td>

          <!-- Atualizado -->
          <td class="py-4 px-6 text-xs text-slate-400 whitespace-nowrap">
            ${ticket.updatedAgo || 'Há pouco'}
          </td>

          <!-- Ações (Eye, Pencil, More Dots) -->
          <td class="py-4 px-6 text-right whitespace-nowrap">
            <div class="inline-flex items-center gap-1.5">
              <button onclick="App.openTicketDetails('${ticket.id}')" title="Visualizar detalhes" class="action-icon-btn">
                <i data-lucide="eye" class="w-3.5 h-3.5"></i>
              </button>
              <button onclick="App.openEditTicketModal('${ticket.id}')" title="Editar chamado" class="action-icon-btn">
                <i data-lucide="edit-2" class="w-3.5 h-3.5"></i>
              </button>
              <div class="relative inline-block text-left">
                <button onclick="App.toggleRowActionMenu('${ticket.id}')" title="Mais opções" class="action-icon-btn">
                  <i data-lucide="more-horizontal" class="w-3.5 h-3.5"></i>
                </button>
                <div id="rowMenu-${ticket.id}" class="hidden absolute right-0 mt-1 w-44 bg-dark-card border border-dark-border rounded-xl shadow-2xl p-1 z-30 text-xs text-left">
                  <button onclick="App.quickAssignToMe('${ticket.id}')" class="w-full px-3 py-1.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg flex items-center gap-2">
                    <i data-lucide="user-check" class="w-3.5 h-3.5 text-blue-400"></i>
                    <span>Atribuir a mim</span>
                  </button>
                  <button onclick="App.quickResolve('${ticket.id}')" class="w-full px-3 py-1.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg flex items-center gap-2">
                    <i data-lucide="check" class="w-3.5 h-3.5 text-emerald-400"></i>
                    <span>Resolver chamado</span>
                  </button>
                  ${(this.user && this.user.role === 'admin') ? `
                    <div class="border-t border-dark-border my-1"></div>
                    <button onclick="App.quickDeleteTicket('${ticket.id}')" class="w-full px-3 py-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg flex items-center gap-2">
                      <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                      <span>Excluir (Admin)</span>
                    </button>
                  ` : ''}
                </div>
              </div>
            </div>
          </td>
        </tr>
      `;
    });

    tableBody.innerHTML = html;
    lucide.createIcons();
  },

  renderPagination(pagination) {
    const infoEl = document.getElementById('paginationInfo');
    const controlsEl = document.getElementById('paginationControls');

    if (!infoEl || !controlsEl) return;

    infoEl.textContent = `Exibindo ${pagination.displayStart}-${pagination.displayEnd} de ${pagination.total} chamados`;

    let html = '';

    // Previous Button
    const prevDisabled = pagination.page <= 1;
    html += `
      <button onclick="App.goToPage(${pagination.page - 1})" ${prevDisabled ? 'disabled' : ''}
        class="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold ${prevDisabled ? 'opacity-40 cursor-not-allowed bg-dark-input text-slate-500' : 'bg-dark-card hover:bg-dark-cardHover border border-dark-border text-slate-300'}">
        <i data-lucide="chevron-left" class="w-4 h-4"></i>
      </button>
    `;

    // Numeric Pages (e.g. 1, 2, 3)
    const totalPages = pagination.totalPages;
    for (let p = 1; p <= Math.min(totalPages, 5); p++) {
      const isActive = p === pagination.page;
      html += `
        <button onclick="App.goToPage(${p})"
          class="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${isActive ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'bg-dark-card hover:bg-dark-cardHover border border-dark-border text-slate-300'}">
          ${p}
        </button>
      `;
    }

    // Next Button
    const nextDisabled = pagination.page >= pagination.totalPages;
    html += `
      <button onclick="App.goToPage(${pagination.page + 1})" ${nextDisabled ? 'disabled' : ''}
        class="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold ${nextDisabled ? 'opacity-40 cursor-not-allowed bg-dark-input text-slate-500' : 'bg-dark-card hover:bg-dark-cardHover border border-dark-border text-slate-300'}">
        <i data-lucide="chevron-right" class="w-4 h-4"></i>
      </button>
    `;

    controlsEl.innerHTML = html;
    lucide.createIcons();
  },

  goToPage(page) {
    if (page < 1) return;
    this.currentPage = page;
    this.loadTickets();
  },

  toggleRowActionMenu(ticketId) {
    const menu = document.getElementById(`rowMenu-${ticketId}`);
    if (!menu) return;
    const isHidden = menu.classList.contains('hidden');
    // Hide all open menus first
    document.querySelectorAll('[id^="rowMenu-"]').forEach(m => m.classList.add('hidden'));
    if (isHidden) {
      menu.classList.remove('hidden');
    }
  },

  // Modals Management
  openModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.remove('hidden');
    lucide.createIcons();
  },

  closeModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.add('hidden');
  },

  openNewTicketModal() {
    this.openModal('modalNewTicket');
    const req = document.getElementById('newTicketRequester');
    if (req && this.user) req.value = this.user.name;
  },

  async handleCreateTicketSubmit(event) {
    event.preventDefault();

    const subject = document.getElementById('newTicketSubject').value.trim();
    const priority = document.getElementById('newTicketPriority').value;
    const category = document.getElementById('newTicketCategory').value;
    const requesterName = document.getElementById('newTicketRequester').value.trim();
    const department = document.getElementById('newTicketDepartment').value;
    const assignedTo = document.getElementById('newTicketAssignee').value || null;
    const description = document.getElementById('newTicketDescription').value.trim();

    try {
      const data = await API.createTicket({
        subject,
        priority,
        category,
        requesterName,
        department,
        assignedTo,
        description
      });

      this.closeModal('modalNewTicket');
      this.toast(`Chamado #${data.ticket.idNumber} criado com sucesso!`, 'success');
      // Reset form
      document.getElementById('newTicketSubject').value = '';
      document.getElementById('newTicketDescription').value = '';
      this.loadTickets();
      this.loadNotifications();
    } catch (err) {
      this.toast(err.message || 'Erro ao criar chamado', 'error');
    }
  },

  // Ticket Details Modal
  async openTicketDetails(ticketId) {
    this.currentTicketId = ticketId;
    this.openModal('modalTicketDetails');

    try {
      const ticket = await API.getTicket(ticketId);

      document.getElementById('detailTicketId').textContent = `#${ticket.idNumber}`;
      document.getElementById('detailTicketSubject').textContent = ticket.subject;
      document.getElementById('detailTicketRequester').textContent = `${ticket.requesterName} (${ticket.department})`;
      document.getElementById('detailTicketCreatedAgo').textContent = `Aberto ${ticket.createdAgo}`;
      document.getElementById('detailTicketDescription').textContent = ticket.description || 'Sem descrição fornecida.';

      // Priority and Status Badges
      const prioEl = document.getElementById('detailTicketPriority');
      prioEl.textContent = ticket.priority;
      prioEl.className = `text-xs font-bold px-2.5 py-0.5 rounded-full ${
        ticket.priority === 'CRÍTICA' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
        ticket.priority === 'ALTA' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
        ticket.priority === 'MÉDIA' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
        'bg-slate-700 text-slate-300'
      }`;

      const statusEl = document.getElementById('detailTicketStatus');
      statusEl.textContent = ticket.status;
      statusEl.className = `text-xs font-semibold px-2.5 py-0.5 rounded-full ${
        ticket.status === 'Em Aberto' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
        ticket.status === 'Em Progresso' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
        ticket.status === 'Resolvido' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
        'bg-amber-500/20 text-amber-300 border border-amber-500/30'
      }`;

      // Dropdowns
      document.getElementById('detailChangeStatus').value = ticket.status;
      document.getElementById('detailChangeAssignee').value = ticket.assignedTo || '';

      // Comments List
      this.renderTicketComments(ticket.comments || []);

      lucide.createIcons();
    } catch (err) {
      this.toast('Erro ao buscar dados do chamado', 'error');
    }
  },

  renderTicketComments(comments) {
    const list = document.getElementById('detailCommentsList');
    document.getElementById('detailCommentsCount').textContent = `${comments.length} interaç${comments.length === 1 ? 'ão' : 'ões'}`;

    if (!comments || comments.length === 0) {
      list.innerHTML = `<div class="text-xs text-slate-500 text-center py-4">Nenhuma interação registrada ainda.</div>`;
      return;
    }

    let html = '';
    comments.forEach(c => {
      const isAudit = c.authorRole === 'Audit';
      if (isAudit) {
        html += `
          <div class="flex items-center gap-2 text-[11px] text-slate-500 py-1 px-3 bg-slate-900/40 rounded-lg border border-dark-border/40">
            <i data-lucide="info" class="w-3.5 h-3.5 text-blue-400 flex-shrink-0"></i>
            <span>${c.content}</span>
            <span class="ml-auto text-slate-600">${new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        `;
      } else {
        html += `
          <div class="p-3.5 rounded-xl bg-dark-bg/80 border border-dark-border text-xs space-y-1.5">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="font-bold text-slate-200">${c.author}</span>
                <span class="px-1.5 py-0.2 rounded text-[10px] bg-blue-500/10 text-blue-400 font-semibold">${c.authorRole || 'Atendente'}</span>
              </div>
              <span class="text-slate-500 text-[11px]">${new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <p class="text-slate-300 leading-relaxed">${c.content}</p>
          </div>
        `;
      }
    });

    list.innerHTML = html;
    lucide.createIcons();
  },

  async handleUpdateTicketStatus(newStatus) {
    if (!this.currentTicketId) return;
    try {
      await API.updateTicket(this.currentTicketId, { status: newStatus });
      this.toast(`Status atualizado para: ${newStatus}`, 'success');
      this.openTicketDetails(this.currentTicketId);
      this.loadTickets();
    } catch (err) {
      this.toast('Erro ao atualizar status', 'error');
    }
  },

  async handleUpdateTicketAssignee(newAssignee) {
    if (!this.currentTicketId) return;
    try {
      await API.updateTicket(this.currentTicketId, { assignedTo: newAssignee || null });
      this.toast(`Responsável alterado para: ${newAssignee || 'Sem Atendente'}`, 'success');
      this.openTicketDetails(this.currentTicketId);
      this.loadTickets();
    } catch (err) {
      this.toast('Erro ao alterar responsável', 'error');
    }
  },

  async handleAddComment(event) {
    event.preventDefault();
    if (!this.currentTicketId) return;

    const textarea = document.getElementById('commentReplyText');
    const content = textarea.value.trim();
    if (!content) return;

    try {
      await API.addComment(this.currentTicketId, { content });
      textarea.value = '';
      this.toast('Comentário enviado!', 'success');
      this.openTicketDetails(this.currentTicketId);
    } catch (err) {
      this.toast('Erro ao enviar mensagem', 'error');
    }
  },

  async handleDeleteCurrentTicket() {
    if (!this.currentTicketId) return;

    if (!confirm('Tem certeza de que deseja excluir permanentemente este chamado?')) {
      return;
    }

    try {
      await API.deleteTicket(this.currentTicketId);
      this.closeModal('modalTicketDetails');
      this.toast('Chamado excluído com sucesso.', 'info');
      this.loadTickets();
    } catch (err) {
      this.toast(err.message || 'Erro ao excluir chamado', 'error');
    }
  },

  // Quick Edit Modal
  async openEditTicketModal(ticketId) {
    this.openModal('modalEditTicket');
    try {
      const ticket = await API.getTicket(ticketId);
      document.getElementById('editTicketId').value = ticket.id;
      document.getElementById('editTicketSubject').value = ticket.subject;
      document.getElementById('editTicketPriority').value = ticket.priority;
      document.getElementById('editTicketStatus').value = ticket.status;
      document.getElementById('editTicketAssignee').value = ticket.assignedTo || '';
    } catch (err) {
      this.toast('Erro ao abrir edição', 'error');
    }
  },

  async handleSaveEditTicket(event) {
    event.preventDefault();
    const id = document.getElementById('editTicketId').value;
    const subject = document.getElementById('editTicketSubject').value.trim();
    const priority = document.getElementById('editTicketPriority').value;
    const status = document.getElementById('editTicketStatus').value;
    const assignedTo = document.getElementById('editTicketAssignee').value || null;

    try {
      await API.updateTicket(id, { subject, priority, status, assignedTo });
      this.closeModal('modalEditTicket');
      this.toast('Chamado atualizado com sucesso!', 'success');
      this.loadTickets();
    } catch (err) {
      this.toast('Erro ao salvar alterações', 'error');
    }
  },

  // Quick Action Menu Shortcuts
  async quickAssignToMe(ticketId) {
    try {
      const myName = this.user ? this.user.name : 'Mariana Costa';
      await API.updateTicket(ticketId, { assignedTo: myName });
      this.toast(`Chamado atribuído a ${myName}!`, 'success');
      this.loadTickets();
    } catch (err) {
      this.toast('Erro ao atribuir chamado', 'error');
    }
  },

  async quickResolve(ticketId) {
    try {
      await API.updateTicket(ticketId, { status: 'Resolvido' });
      this.toast('Chamado marcado como Resolvido!', 'success');
      this.loadTickets();
    } catch (err) {
      this.toast('Erro ao resolver chamado', 'error');
    }
  },

  async quickDeleteTicket(ticketId) {
    if (!this.user || this.user.role !== 'admin') {
      this.toast('Apenas Admin pode excluir chamados', 'error');
      return;
    }
    if (!confirm('Deseja realmente remover este chamado? (Ação de Admin)')) return;
    try {
      await API.deleteTicket(ticketId);
      this.toast('Chamado excluído!', 'info');
      this.loadTickets();
    } catch (err) {
      this.toast(err.message || 'Erro ao excluir', 'error');
    }
  },

  // Attendants View
async loadAttendants() {
    const grid = document.getElementById('attendantsListGrid');
    if (!grid) return;
 
    try {
      const users = await API.getUsers();
      const attendants = users.filter(u => u.role === 'attendant' || u.role === 'admin');
 
      let html = '';
      attendants.forEach(u => {
        const isAdmin = u.role === 'admin';
        html += `
          <div class="bg-dark-card border border-dark-border rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-600 transition">
            <div class="flex items-start gap-4">
              <img src="${u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256'}"
                class="w-12 h-12 rounded-xl object-cover ring-2 ${isAdmin ? 'ring-blue-500' : 'ring-blue-500'}" />
              <div class="truncate">
                <div class="text-sm font-bold text-white flex items-center gap-1.5 truncate">
                  <span>${u.name}</span>
                  ${isAdmin ? '<span class="px-1.5 py-0.2 bg-blue-500/20 text-blue-300 text-[10px] font-bold rounded">ADMIN</span>' : ''}
                </div>
                <div class="text-xs text-blue-400 mt-0.5">${u.roleLabel || u.role}</div>
                <div class="text-xs text-slate-400 mt-0.5 truncate">${u.department || 'TI'}</div>
              </div>
            </div>
 
            <div class="pt-3 border-t border-dark-border/60 flex items-center justify-between text-xs text-slate-400">
              <span class="flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span> Disponível
              </span>
              <span class="text-slate-300 font-mono">${u.phone || '(11) 98765-4321'}</span>
            </div>
          </div>
        `;
      });
 
      grid.innerHTML = html;
      lucide.createIcons();
    } catch (err) {
      grid.innerHTML = '<div class="text-sm text-slate-400">Erro ao carregar atendentes.</div>';
    }
  },

  openNewAttendantModal() {
    this.openModal('modalNewAttendant');
  },

  async handleCreateUserSubmit(event) {
    event.preventDefault();
    const name = document.getElementById('newUserName').value.trim();
    const email = document.getElementById('newUserEmail').value.trim();
    const role = document.getElementById('newUserRole').value;
    const department = document.getElementById('newUserDepartment').value.trim();
    const password = document.getElementById('newUserPassword').value;

    try {
      await API.createUser({ name, email, role, department, password });
      this.closeModal('modalNewAttendant');
      this.toast(`Novo usuário ${name} adicionado com sucesso!`, 'success');
      this.loadAttendants();
      this.loadUserManagementTable();
    } catch (err) {
      this.toast(err.message || 'Erro ao cadastrar usuário', 'error');
    }
  },

  // Clients View
  async loadClients() {
    const tableBody = document.getElementById('clientsTableBody');
    if (!tableBody) return;

    try {
      const clients = await API.getClients();
      let html = '';
      clients.forEach(c => {
        html += `
          <tr class="hover:bg-dark-cardHover transition">
            <td class="py-3.5 px-6 font-semibold text-slate-200">${c.name}</td>
            <td class="py-3.5 px-6 text-slate-300">${c.department}</td>
            <td class="py-3.5 px-6 text-slate-400 font-mono text-xs">${c.email}</td>
            <td class="py-3.5 px-6 text-slate-400">${c.phone || '-'}</td>
            <td class="py-3.5 px-6 text-slate-400">${c.company || 'Matriz'}</td>
            <td class="py-3.5 px-6 text-center">
              <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400">
                ${c.activeTickets || 0}
              </span>
            </td>
          </tr>
        `;
      });
      tableBody.innerHTML = html;
    } catch (err) {
      tableBody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-slate-400">Erro ao carregar clientes.</td></tr>';
    }
  },

  openNewClientModal() {
    const name = prompt('Nome do novo cliente:');
    if (!name) return;
    const email = prompt('E-mail do cliente:');
    if (!email) return;
    const department = prompt('Departamento (RH, Financeiro, Vendas, etc.):') || 'Geral';

    API.createClient({ name, email, department, phone: '', company: 'Matriz' })
      .then(() => {
        this.toast('Cliente cadastrado com sucesso!', 'success');
        this.loadClients();
      })
      .catch(err => this.toast(err.message || 'Erro ao cadastrar cliente', 'error'));
  },

  // User Management Table in Settings (Super Admin)
async loadUserManagementTable() {
    const tableBody = document.getElementById('userManagementTableBody');
    if (!tableBody) return;
 
    try {
      const users = await API.getUsers();
      let html = '';
      users.forEach(u => {
        const isCurrent = this.user && this.user.id === u.id;
        const isMasterAdmin = u.username === 'admin';
 
        html += `
          <tr class="hover:bg-dark-cardHover/50 transition">
            <td class="py-3 px-4">
              <div class="font-semibold text-slate-200">${u.name}</div>
              <div class="text-xs text-slate-400 font-mono">@${u.username}</div>
            </td>
            <td class="py-3 px-4 text-xs font-mono text-slate-300">${u.email}</td>
            <td class="py-3 px-4 text-xs text-slate-300">${u.department || '-'}</td>
            <td class="py-3 px-4">
              <select onchange="App.handleRoleChange('${u.id}', this.value)" ${isMasterAdmin ? 'disabled' : ''}
                class="bg-dark-input border border-dark-border text-xs rounded-lg px-2 py-1 text-slate-200">
                <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Admin</option>
                <option value="attendant" ${u.role === 'attendant' ? 'selected' : ''}>Atendente</option>
              </select>
            </td>
            <td class="py-3 px-4">
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${u.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}">
                ${u.status === 'active' ? 'Ativo' : 'Inativo'}
              </span>
            </td>
            <td class="py-3 px-4 text-right">
              <div class="inline-flex items-center gap-2">
                <button onclick="App.handleResetUserPassword('${u.id}', '${u.name}')" title="Redefinir senha" class="p-1.5 text-blue-400 hover:text-white bg-blue-500/10 hover:bg-blue-600 rounded-lg text-xs font-medium">
                  Nova Senha
                </button>
                ${!isMasterAdmin && !isCurrent ? `
                  <button onclick="App.handleDeleteUser('${u.id}', '${u.name}')" title="Excluir usuário" class="p-1.5 text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 rounded-lg text-xs">
                    <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                  </button>
                ` : ''}
              </div>
            </td>
          </tr>
        `;
      });
      tableBody.innerHTML = html;
      lucide.createIcons();
    } catch (err) {
      tableBody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-slate-400">Erro ao carregar lista de usuários.</td></tr>';
    }
  },

  async handleRoleChange(userId, newRole) {
    try {
      await API.updateUser(userId, { role: newRole });
      this.toast('Nível de acesso alterado com sucesso!', 'success');
      this.loadUserManagementTable();
      this.loadAttendants();
    } catch (err) {
      this.toast('Erro ao alterar cargo', 'error');
    }
  },

  async handleResetUserPassword(userId, userName) {
    const newPass = prompt(`Digite a nova senha para ${userName}:`, '123456');
    if (!newPass) return;
    try {
      await API.updateUser(userId, { newPassword: newPass });
      this.toast(`Senha de ${userName} alterada para: ${newPass}`, 'success');
    } catch (err) {
      this.toast('Erro ao alterar senha', 'error');
    }
  },

  async handleDeleteUser(userId, userName) {
    if (!confirm(`Deseja realmente excluir o usuário ${userName}? Esta ação não pode ser desfeita.`)) return;
    try {
      await API.deleteUser(userId);
      this.toast(`Usuário ${userName} excluído.`, 'info');
      this.loadUserManagementTable();
      this.loadAttendants();
    } catch (err) {
      this.toast(err.message || 'Erro ao excluir usuário', 'error');
    }
  },

  async handleSaveSettings(event) {
    event.preventDefault();
    const companyName = document.getElementById('setOrgName').value;
    const supportEmail = document.getElementById('setSupportEmail').value;
    const slaHighHours = Number(document.getElementById('setSlaHigh').value);
    const slaMediumHours = Number(document.getElementById('setSlaMedium').value);
    const slaLowHours = Number(document.getElementById('setSlaLow').value);

    try {
      await API.updateSettings({
        companyName,
        supportEmail,
        slaHighHours,
        slaMediumHours,
        slaLowHours
      });
      this.toast('Configurações salvas com sucesso!', 'success');
    } catch (err) {
      this.toast('Erro ao atualizar configurações', 'error');
    }
  },

  // Export CSV
  async exportTicketsCSV() {
    try {
      const data = await API.getTickets({ limit: 1000 });
      const tickets = data.tickets;

      let csv = '\uFEFFID;Assunto;Solicitante;Departamento;Prioridade;Status;Responsavel;CriadoEm\r\n';
      tickets.forEach(t => {
        const cleanSubject = `"${(t.subject || '').replace(/"/g, '""')}"`;
        const cleanReq = `"${(t.requesterName || '').replace(/"/g, '""')}"`;
        const cleanDept = `"${(t.department || '').replace(/"/g, '""')}"`;
        const cleanAssigned = `"${(t.assignedTo || 'Sem Atendente').replace(/"/g, '""')}"`;
        csv += `#${t.idNumber};${cleanSubject};${cleanReq};${cleanDept};${t.priority};${t.status};${cleanAssigned};${t.createdAt}\r\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `ResolveOS_Chamados_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      this.toast('Exportação CSV gerada com sucesso!', 'success');
    } catch (err) {
      this.toast('Erro ao exportar chamados', 'error');
    }
  },

  // Notifications
  async loadNotifications() {
    try {
      const notifications = await API.getNotifications();
      const list = document.getElementById('notificationsList');
      const badge = document.getElementById('notifBadge');

      const unreadCount = notifications.filter(n => !n.read).length;
      if (badge) {
        if (unreadCount > 0) {
          badge.classList.remove('hidden');
        } else {
          badge.classList.add('hidden');
        }
      }

      if (!list) return;

      if (notifications.length === 0) {
        list.innerHTML = '<div class="text-xs text-slate-400 text-center py-4">Sem notificações no momento.</div>';
        return;
      }

      let html = '';
      notifications.forEach(n => {
        html += `
          <div class="p-2.5 rounded-xl ${n.read ? 'bg-dark-bg/40 opacity-70' : 'bg-blue-600/10 border border-blue-500/20'} cursor-pointer hover:bg-slate-700/40 transition" onclick="App.handleNotificationClick('${n.id}', '${n.ticketId}')">
            <div class="flex items-center justify-between text-xs mb-1">
              <span class="font-bold ${n.read ? 'text-slate-300' : 'text-blue-400'}">${n.title}</span>
              <span class="text-[10px] text-slate-500">${n.time}</span>
            </div>
            <p class="text-xs text-slate-300 leading-snug">${n.message}</p>
          </div>
        `;
      });
      list.innerHTML = html;
    } catch (err) {
      // silent
    }
  },

  async handleNotificationClick(notifId, ticketId) {
    try {
      await API.markNotificationRead(notifId);
      document.getElementById('notificationsDropdown').classList.add('hidden');
      this.loadNotifications();
      if (ticketId) {
        this.openTicketDetails(ticketId);
      }
    } catch (err) {
      // silent
    }
  },

  async markAllNotificationsRead() {
    try {
      const notifs = await API.getNotifications();
      for (const n of notifs) {
        if (!n.read) await API.markNotificationRead(n.id);
      }
      this.loadNotifications();
      this.toast('Notificações marcadas como lidas.', 'info');
    } catch (e) {
      // silent
    }
  },

  toggleNotificationDropdown() {
    const el = document.getElementById('notificationsDropdown');
    el.classList.toggle('hidden');
  },

  toggleProfileDropdown() {
    const el = document.getElementById('profileDropdown');
    el.classList.toggle('hidden');
  },

  openUserProfileModal() {
    document.getElementById('profileDropdown').classList.add('hidden');
    this.openModal('modalUserProfile');
  },

  openHelpModal() {
    this.openModal('modalHelp');
  },

  // Toast Notification System
  toast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    const bg = type === 'success' ? 'bg-emerald-600 border-emerald-500' :
               type === 'error' ? 'bg-rose-600 border-rose-500' :
               'bg-blue-600 border-blue-500';

    toast.className = `toast-msg flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-2xl text-xs sm:text-sm font-semibold text-white border ${bg} pointer-events-auto`;
    toast.innerHTML = `
      <span>${message}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
};

// Global click listener to close dropdowns when clicking outside
document.addEventListener('click', (e) => {
  const notifBtn = e.target.closest('[onclick*="toggleNotificationDropdown"]');
  const notifDropdown = document.getElementById('notificationsDropdown');
  if (notifDropdown && !notifDropdown.contains(e.target) && !notifBtn) {
    notifDropdown.classList.add('hidden');
  }

  const profileBtn = e.target.closest('[onclick*="toggleProfileDropdown"]');
  const profileDropdown = document.getElementById('profileDropdown');
  if (profileDropdown && !profileDropdown.contains(e.target) && !profileBtn) {
    profileDropdown.classList.add('hidden');
  }

  // Row menus
  if (!e.target.closest('.action-icon-btn') && !e.target.closest('[id^="rowMenu-"]')) {
    document.querySelectorAll('[id^="rowMenu-"]').forEach(m => m.classList.add('hidden'));
  }
});

