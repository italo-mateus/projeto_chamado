const jwt = require('jsonwebtoken');

// Chave secreta para assinatura dos tokens JWT
const JWT_SECRET = process.env.JWT_SECRET || 'resolveos-super-secret-key-2026';

/**
 * Middleware de autenticação obrigatória
 * Verifica se o token JWT é válido e anexa o usuário à requisição
 * @param {Object} req - Requisição Express
 * @param {Object} res - Resposta Express
 * @param {Function} next - Próximo middleware
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Formato: "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ error: 'Acesso não autorizado. Por favor faça login.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Sessão expirada ou inválida.' });
    }
    req.user = user;
    next();
  });
}

/**
 * Middleware de autenticação opcional
 * Tenta validar token se presente, mas não bloqueia se ausente
 * @param {Object} req - Requisição Express
 * @param {Object} res - Resposta Express
 * @param {Function} next - Próximo middleware
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token) {
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (!err) req.user = user;
      next();
    });
  } else {
    next();
  }
}

/**
 * Middleware que exige role de Admin
 * Bloqueia acesso se usuário não for admin
 * @param {Object} req - Requisição Express
 * @param {Object} res - Resposta Express
 * @param {Function} next - Próximo middleware
 */
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso restrito: Requer privilégios de Admin.' });
  }
  next();
}

module.exports = {
  JWT_SECRET,
  authenticateToken,
  optionalAuth,
  requireAdmin
};