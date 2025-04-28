
// Back-end
const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const app = express();

const SECRET_KEY = "chave-secreta-do-jwt";
const TOKEN_EXPIRATION_SECONDS = 60 * 60; // 1 hora

app.use(bodyParser.json());

// Simulação de usuários
const users = [
  { username: "admin", password: "123456" }
];

// Login e geração do JWT com expiração
app.post('/auth', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({ error: "Usuário ou senha incorretos" });
  }

  const expiration = Math.floor(Date.now() / 1000) + TOKEN_EXPIRATION_SECONDS;

  const token = jwt.sign(
    { username, exp: expiration },
    SECRET_KEY
  );

  return res.json({ jwt_token: token, exp: expiration });
});

// Validação e uso do token
app.post('/do_SomeAction', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Acesso não autorizado." });

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, SECRET_KEY);

    // Se passou da expiração (verificação redundante, já feita pelo verify)
    if (decoded.exp < Math.floor(Date.now() / 1000)) {
      return res.status(401).json({ error: "Acesso não autorizado." });
    }

    return res.json({ message: `Ação executada por ${decoded.username}` });

  } catch (err) {
    return res.status(401).json({ error: "Acesso não autorizado." });
  }
});

app.listen(3000, () => console.log("Servidor rodando em http://localhost:3000"));


// Front-end
function login(username, password) {
    const data = { username, password };
  
    fetch('http://localhost:3000/auth', {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" }
    })
    .then(response => response.json())
    .then(json => {
      // Armazena o token e sua data de expiração
      localStorage.setItem("token", json.jwt_token);
      localStorage.setItem("token_exp", json.exp); // exp em segundos
      console.log("Login realizado com sucesso!");
    })
    .catch(err => console.error("Erro ao fazer login:", err));
  }
  
  function doAction() {
    const token = localStorage.getItem("token");
    const exp = localStorage.getItem("token_exp");
  
    if (!token || !exp) {
      alert("Você precisa fazer login.");
      window.location.href = "/login.html";
      return;
    }
  
    const now = Math.floor(Date.now() / 1000);
  
    if (now >= parseInt(exp)) {
      alert("Sessão expirada. Faça login novamente.");
      localStorage.clear();
      window.location.href = "/login.html";
      return;
    }
  
    fetch('http://localhost:3000/do_SomeAction', {
      method: "POST",
      body: JSON.stringify(null),
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    })
    .then(response => response.json())
    .then(json => {
      console.log("Resposta da ação:", json);
    })
    .catch(err => console.error("Erro ao executar ação:", err));
  }
  
  