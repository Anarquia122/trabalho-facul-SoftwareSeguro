// para rodar esse programa basta digitar no terminal:
// node MicroAtividade2.js

// Simulação de banco de dados
const database = [
    { username: 'usuario1', password: 'abc123', failedAttempts: 0 },
    { username: 'admin', password: 'adminpass', failedAttempts: 0 },
];

// Configurações
const MIN_PASSWORD_LENGTH = 6;
const MAX_ATTEMPTS = 3;

// Função para verificar se o usuário existe
function userExists(username) {
    return database.some(user => user.username === username);
}

// Função para buscar usuário no "banco"
function findUser(username) {
    return database.find(user => user.username === username);
}

// Função principal de login
function verificarCredenciais(username, password) {
    const user = findUser(username);

    // Se o usuário não existir ou excedeu tentativas
    if (!user || user.failedAttempts >= MAX_ATTEMPTS) {
        return { error: "Usuário ou senha incorretos" };
    }

    // Verifica comprimento mínimo da senha
    if (password.length < MIN_PASSWORD_LENGTH) {
        return { error: `A senha deve conter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.` };
    }

    // Verifica se a senha está correta
    if (user.password !== password) {
        user.failedAttempts += 1;
        return { error: "Usuário ou senha incorretos" };
    }

    // Login bem-sucedido, reseta tentativas
    user.failedAttempts = 0;
    return { success: true };
}

console.log(verificarCredenciais("usuario1", "abc"));        // senha curta
console.log(verificarCredenciais("usuario1", "errada123"));  // senha errada
console.log(verificarCredenciais("usuario1", "errada123"));  // tenta de novo
console.log(verificarCredenciais("usuario1", "abc123"));     // sucesso (se não bloqueado ainda)
