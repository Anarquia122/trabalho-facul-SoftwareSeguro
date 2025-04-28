const mysql = require('mysql2/promise');

// Conexão com o banco
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'sua_senha',
    database: 'sua_base'
});

// Função segura com prepared statement
async function doDBAction(req, res) {
    const id = req.query.id;

    try {
        const [rows] = await pool.execute('SELECT * FROM users WHERE userID = ?', [id]);
        res.json(rows);
    } catch (error) {
        console.error("Erro na consulta:", error);
        res.status(500).json({ error: "Erro interno no servidor" });
    }
}