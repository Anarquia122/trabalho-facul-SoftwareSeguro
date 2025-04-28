const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const app = express();

// Para rodar o programa basta digitar no terminal o seguinte comando:
// node Trabalho.js 

app.use(bodyParser.json());

const JWT_SECRET = 'senha123'; // use variável de ambiente no mundo real
const JWT_EXPIRATION = '1h'; // token expira em 1 hora

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));

const users = [
  { username: 'user', password: 'user123', id: 123, email: 'user@dominio.com', perfil: 'user' },
  { username: 'admin', password: 'admin123', id: 124, email: 'admin@dominio.com', perfil: 'admin' },
  { username: 'colab', password: 'colab123', id: 125, email: 'colab@dominio.com', perfil: 'user' },
];

// Funções auxiliares
function doLogin(credentials) {
  return users.find(user => user.username === credentials.username && user.password === credentials.password);
}

function sanitizeInput(input) {
  return input.replace(/['";]/g, '');
}

// Middlewares

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ message: 'Token não fornecido' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token inválido ou expirado' });
    req.user = user;
    next();
  });
}

function authorizeAdmin(req, res, next) {
  if (req.user.perfil !== 'admin') {
    return res.status(403).json({ message: 'Acesso restrito a administradores' });
  }
  next();
}

// Endpoints

// Login
app.post('/api/auth/login', (req, res) => {
  const credentials = req.body;
  const user = doLogin(credentials);

  if (!user) return res.status(401).json({ message: 'Credenciais inválidas' });

  const payload = {
    id: user.id,
    username: user.username,
    perfil: user.perfil,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION });

  res.json({ token });
});

// Recuperar dados do usuário logado (acessível a todos logados)
app.get('/api/auth/me', authenticateToken, (req, res) => {
  const userData = users.find(u => u.id === req.user.id);
  if (!userData) return res.status(404).json({ message: 'Usuário não encontrado' });

  res.json({ id: userData.id, username: userData.username, email: userData.email, perfil: userData.perfil });
});

// Recuperar todos os usuários (somente admin)
app.get('/api/users', authenticateToken, authorizeAdmin, (req, res) => {
  res.status(200).json({ data: users });
});

// Recuperar contratos (somente admin)
app.get('/api/contracts/:empresa/:inicio', authenticateToken, authorizeAdmin, (req, res) => {
  const empresa = sanitizeInput(req.params.empresa);
  const dtInicio = sanitizeInput(req.params.inicio);

  const result = getContracts(empresa, dtInicio);
  
  if (result && result.length > 0) {
    res.status(200).json({ data: result });
  } else {
    res.status(404).json({ message: 'Dados não encontrados' });
  }
});

// Emulando acesso ao banco de dados (fake)
class Repository {
  execute(query) {
    console.log('Query executada:', query);
    return []; // Em um banco real, retornaria os dados
  }
}

// Buscar contratos (protegendo contra SQL Injection)
function getContracts(empresa, inicio) {
  const repository = new Repository();
  const query = `SELECT * FROM contracts WHERE empresa = '${empresa}' AND data_inicio = '${inicio}'`;
  return repository.execute(query);
}
