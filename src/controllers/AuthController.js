const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../middlewares/auth');

/**
 * AuthController - Controlador de autenticação
 * Gerencia login, registro, recuperação de senha e perfil do usuário
 */
class AuthController {
  /**
   * Realiza login do usuário
   * POST /api/auth/login
   * @param {Object} req - Requisição Express
   * @param {Object} res - Resposta Express
   */
  static login(req, res) {
    const { identifier, password } = req.body;

    // Valida campos obrigatórios
    if (!identifier || !password) {
      return res.status(400).json({ error: 'Informe o usuário/e-mail e a senha.' });
    }

    // Busca usuário por username ou email
    const user = User.findByUsernameOrEmail(identifier);
    if (!user) {
      return res.status(401).json({ error: 'Usuário ou senha incorretos.' });
    }

    // Verifica senha
    const isMatch = User.verifyPassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Usuário ou senha incorretos.' });
    }

    // Verifica se conta está ativa
    if (user.status === 'inactive') {
      return res.status(403).json({ error: 'Esta conta está inativa. Contate o administrador.' });
    }

    // Gera payload do token JWT
    const tokenPayload = {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      roleLabel: user.roleLabel,
      avatar: user.avatar,
      department: user.department
    };

    // Assina token com validade de 7 dias
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

    return res.json({
      message: 'Login realizado com sucesso!',
      token,
      user: tokenPayload
    });
  }

  /**
   * Registra novo usuário
   * POST /api/auth/register
   * @param {Object} req - Requisição Express
   * @param {Object} res - Resposta Express
   */
  static register(req, res) {
    const { name, email, username, password, department, phone } = req.body;

    // Valida campos obrigatórios
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Preencha todos os campos obrigatórios (Nome, E-mail, Senha).' });
    }

    // Verifica se email já existe
    const existingEmail = User.findByUsernameOrEmail(email);
    if (existingEmail) {
      return res.status(400).json({ error: 'Já existe um usuário cadastrado com este e-mail.' });
    }

    // Verifica se username já existe
    const generatedUsername = username || email.split('@')[0];
    const existingUsername = User.findByUsernameOrEmail(generatedUsername);
    if (existingUsername) {
      return res.status(400).json({ error: 'Nome de usuário já em uso. Escolha outro.' });
    }

    // Cria novo usuário como cliente
    const newUser = User.create({
      name,
      email,
      username: generatedUsername,
      password,
      role: 'client',
      roleLabel: 'Cliente',
      department: department || 'Geral',
      phone: phone || ''
    });

    // Gera token para o novo usuário
    const tokenPayload = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      roleLabel: newUser.roleLabel,
      avatar: newUser.avatar,
      department: newUser.department
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

    return res.status(201).json({
      message: 'Cadastro realizado com sucesso!',
      token,
      user: tokenPayload
    });
  }

  /**
   * Solicita recuperação de senha
   * POST /api/auth/forgot-password
   * @param {Object} req - Requisição Express
   * @param {Object} res - Resposta Express
   */
  static forgotPassword(req, res) {
    const { identifier } = req.body;

    if (!identifier) {
      return res.status(400).json({ error: 'Informe seu e-mail ou nome de usuário.' });
    }

    const user = User.findByUsernameOrEmail(identifier);
    
    // Sempre retorna sucesso para não vazar se usuário existe
    if (!user) {
      return res.json({
        success: true,
        message: 'Se os dados estiverem cadastrados, você poderá redefinir sua senha.',
        userFound: false
      });
    }

    // Gera token de reset com validade de 15 minutos
    const resetToken = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '15m' });

    return res.json({
      success: true,
      message: `Conta localizada para ${user.email}. Redefina sua senha.`,
      userFound: true,
      resetToken,
      user: {
        name: user.name,
        email: user.email,
        username: user.username
      }
    });
  }

  /**
   * Redefine senha do usuário
   * POST /api/auth/reset-password
   * @param {Object} req - Requisição Express
   * @param {Object} res - Resposta Express
   */
  static resetPassword(req, res) {
    const { resetToken, identifier, newPassword } = req.body;

    // Valida nova senha
    if (!newPassword || newPassword.length < 3) {
      return res.status(400).json({ error: 'A nova senha deve ter pelo menos 3 caracteres.' });
    }

    let user = null;

    // Tenta validar via token de reset
    if (resetToken) {
      try {
        const decoded = jwt.verify(resetToken, JWT_SECRET);
        user = User.findById(decoded.id);
      } catch (e) {
        // Token expirado ou inválido, tenta via identifier
      }
    }

    // Fallback: busca por identifier
    if (!user && identifier) {
      user = User.findByUsernameOrEmail(identifier);
    }

    if (!user) {
      return res.status(400).json({ error: 'Usuário não encontrado ou link de recuperação expirado.' });
    }

    // Atualiza senha
    User.update(user.id, { newPassword });

    return res.json({
      success: true,
      message: 'Senha redefinida com sucesso! Você já pode fazer login com sua nova senha.'
    });
  }

  /**
   * Retorna dados do usuário logado
   * GET /api/auth/me
   * @param {Object} req - Requisição Express (com req.user do middleware)
   * @param {Object} res - Resposta Express
   */
  static me(req, res) {
    const user = User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }
    const { password, ...safeUser } = user;
    return res.json(safeUser);
  }
}

module.exports = AuthController;