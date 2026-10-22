// Auth Controller for ResolveOS
const Auth = {
  currentUser: null,
  pendingResetToken: null,
  pendingResetIdentifier: null,

  async init() {
    const token = API.getToken();
    if (token) {
      try {
        const user = await API.getMe();
        this.currentUser = user;
        this.showAppScreen();
        App.init(user);
        return;
      } catch (e) {
        console.warn('Sessão expirada ou inválida:', e);
        API.clearToken();
      }
    }
    this.showAuthScreen();
  },

  showAuthScreen() {
    document.getElementById('authSection').classList.remove('hidden');
    document.getElementById('appSection').classList.add('hidden');
    this.showTab('login');
    lucide.createIcons();
  },

  showAppScreen() {
    document.getElementById('authSection').classList.add('hidden');
    document.getElementById('appSection').classList.remove('hidden');
    lucide.createIcons();
  },

  showTab(tabName) {
    const btnLogin = document.getElementById('tabBtnLogin');
    const btnRegister = document.getElementById('tabBtnRegister');
    const btnForgot = document.getElementById('tabBtnForgot');

    const formLogin = document.getElementById('formLogin');
    const formRegister = document.getElementById('formRegister');
    const formForgot = document.getElementById('formForgot');

    this.hideAlert();

    // Reset styles
    [btnLogin, btnRegister, btnForgot].forEach(btn => {
      btn.className = 'auth-tab-btn';
    });

    [formLogin, formRegister, formForgot].forEach(f => f.classList.add('hidden'));

    if (tabName === 'login') {
      btnLogin.className = 'auth-tab-btn active';
      formLogin.classList.remove('hidden');
    } else if (tabName === 'register') {
      btnRegister.className = 'auth-tab-btn active';
      formRegister.classList.remove('hidden');
    } else if (tabName === 'forgot') {
      btnForgot.className = 'auth-tab-btn active';
      formForgot.classList.remove('hidden');
      document.getElementById('forgotStep1').classList.remove('hidden');
      document.getElementById('forgotStep2').classList.add('hidden');
    }

    lucide.createIcons();
  },

  showAlert(message, type = 'error') {
    const alertBox = document.getElementById('authAlert');
    alertBox.classList.remove('hidden');

    if (type === 'error') {
      alertBox.className = 'alert-box alert-error';
      alertBox.innerHTML = `<i data-lucide="alert-circle" style="width:16px;height:16px;flex-shrink:0;"></i><span>${message}</span>`;
    } else if (type === 'success') {
      alertBox.className = 'alert-box alert-success';
      alertBox.innerHTML = `<i data-lucide="check-circle-2" style="width:16px;height:16px;flex-shrink:0;"></i><span>${message}</span>`;
    } else {
      alertBox.className = 'alert-box alert-info';
      alertBox.innerHTML = `<i data-lucide="info" style="width:16px;height:16px;flex-shrink:0;"></i><span>${message}</span>`;
    }

    lucide.createIcons();
  },

  hideAlert() {
    const alertBox = document.getElementById('authAlert');
    if (alertBox) alertBox.classList.add('hidden');
  },

  togglePasswordVisibility(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;

    if (input.type === 'password') {
      input.type = 'text';
      btn.innerHTML = '<i data-lucide="eye-off" class="w-4 h-4"></i>';
    } else {
      input.type = 'password';
      btn.innerHTML = '<i data-lucide="eye" class="w-4 h-4"></i>';
    }
    lucide.createIcons();
  },

  fillAdminCredentials() {
    document.getElementById('loginIdentifier').value = 'admin';
    document.getElementById('loginPassword').value = '123';
    this.showAlert('Credenciais do Admin inseridas! Clique em "Acessar o ResolveOS".', 'info');
  },

  async handleLogin(event) {
    event.preventDefault();
    this.hideAlert();

    const identifier = document.getElementById('loginIdentifier').value.trim();
    const password = document.getElementById('loginPassword').value;
    const remember = document.getElementById('loginRemember').checked;
    const btnSubmit = document.getElementById('btnLoginSubmit');

    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<span>Entrando...</span>';

    try {
      const data = await API.login(identifier, password);
      API.setToken(data.token, remember);
      this.currentUser = data.user;
      App.toast(`Bem-vindo de volta, ${data.user.name}!`, 'success');
      this.showAppScreen();
      App.init(data.user);
    } catch (err) {
      this.showAlert(err.message || 'Falha ao autenticar.', 'error');
    } finally {
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = '<span>Acessar o ResolveOS</span><i data-lucide="arrow-right" class="w-4 h-4"></i>';
      lucide.createIcons();
    }
  },

  async handleRegister(event) {
    event.preventDefault();
    this.hideAlert();

    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const department = document.getElementById('regDept').value;
    const phone = document.getElementById('regPhone').value.trim();
    const password = document.getElementById('regPassword').value;
    const btnSubmit = document.getElementById('btnRegisterSubmit');

    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<span>Criando conta...</span>';

    try {
      const data = await API.register({ name, email, department, phone, password });
      API.setToken(data.token, true);
      this.currentUser = data.user;
      App.toast(`Conta criada com sucesso! Olá, ${data.user.name}.`, 'success');
      this.showAppScreen();
      App.init(data.user);
    } catch (err) {
      this.showAlert(err.message || 'Erro ao realizar cadastro.', 'error');
    } finally {
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = '<span>Criar Conta e Acessar</span><i data-lucide="user-plus" class="w-4 h-4"></i>';
      lucide.createIcons();
    }
  },

  async handleForgotPasswordRequest() {
    this.hideAlert();
    const identifier = document.getElementById('forgotIdentifier').value.trim();

    if (!identifier) {
      this.showAlert('Por favor, informe seu e-mail ou nome de usuário.', 'error');
      return;
    }

    try {
      const res = await API.forgotPassword(identifier);
      if (res.userFound) {
        this.pendingResetToken = res.resetToken;
        this.pendingResetIdentifier = identifier;
        document.getElementById('forgotUserInfo').textContent = `Conta localizada: ${res.user.name} (${res.user.email}). Digite sua nova senha abaixo.`;
        document.getElementById('forgotStep1').classList.add('hidden');
        document.getElementById('forgotStep2').classList.remove('hidden');
        lucide.createIcons();
      } else {
        this.showAlert('Se este usuário estiver registrado em nosso sistema, as orientações de redefinição serão processadas.', 'info');
      }
    } catch (err) {
      this.showAlert(err.message || 'Erro ao recuperar senha.', 'error');
    }
  },

  async handleResetPasswordSubmit(event) {
    event.preventDefault();
    this.hideAlert();

    const newPassword = document.getElementById('resetNewPassword').value;

    try {
      const res = await API.resetPassword({
        resetToken: this.pendingResetToken,
        identifier: this.pendingResetIdentifier,
        newPassword
      });

      this.showAlert(res.message, 'success');
      // Autofill in login form
      document.getElementById('loginIdentifier').value = this.pendingResetIdentifier || '';
      document.getElementById('loginPassword').value = newPassword;

      setTimeout(() => {
        this.showTab('login');
        this.showAlert('Sua nova senha já foi preenchida! Clique em Acessar.', 'success');
      }, 1500);
    } catch (err) {
      this.showAlert(err.message || 'Não foi possível redefinir a senha.', 'error');
    }
  },

  logout() {
    API.clearToken();
    this.currentUser = null;
    this.showAuthScreen();
    App.toast('Sessão encerrada com sucesso.', 'info');
  }
};

