const express = require('express');
const app = express();

// Lista de URLs permitidas (whitelist)
const allowedRedirects = [
  '/pagina1',
  '/pagina2',
  '/home',
];

app.get('/redirect', (req, res) => {
  const rawUrl = req.query.url;

  // Evita CRLF Injection: remove qualquer %0D ou %0A (ou versão decodificada \r\n)
  const cleanedUrl = decodeURIComponent(rawUrl || '').replace(/(\r|\n|%0d|%0a)/gi, '');

  // Validação: só permite redirects dentro do mesmo domínio e para caminhos conhecidos
  if (!allowedRedirects.includes(cleanedUrl)) {
    return res.status(400).send('Redirecionamento não permitido.');
  }

  // Redireciona de forma segura
  res.redirect(cleanedUrl);
});

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
