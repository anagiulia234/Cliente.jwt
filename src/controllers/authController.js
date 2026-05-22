const jwt = require('jsonwebtoken');

// Carregue credenciais do usuário a partir do .env ou valores padrão
const AUTH_USER = process.env.AUTH_USER;
const AUTH_PASSWORD = process.env.AUTH_PASSWORD;

// ============================================================
// FUNÇÃO: login
// ROTA: POST /auth/login
// DESCRIÇÃO: Gera um token JWT para autenticação
// ============================================================
function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ mensagem: 'E-mail e senha são obrigatórios' });
  }

  if (email !== AUTH_USER || password !== AUTH_PASSWORD) {
    return res.status(401).json({ mensagem: 'Credenciais inválidas' });
  }

  const payload = { email };
  const secret = process.env.JWT_SECRET || 'secret_jwt_default';
  const token = jwt.sign(payload, secret, { expiresIn: '2h' });

  res.status(200).json({ token });
}

module.exports = {
  login
};
