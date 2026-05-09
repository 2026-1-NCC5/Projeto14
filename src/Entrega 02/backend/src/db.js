const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Teste automático de conexão
pool.getConnection()
    .then((conn) => {
        console.log('✅ Conexão com o banco MySQL estabelecida com sucesso!');
        conn.release(); // Libera a conexão de volta para o pool
    })
    .catch((err) => {
        console.error('❌ ERRO FATAL NO BANCO DE DADOS:', err.message);
    });

module.exports = pool;