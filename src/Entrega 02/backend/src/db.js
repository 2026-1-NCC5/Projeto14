const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

pool.getConnection()
    .then((conn) => {
        console.log('✅ Conexão com o banco MySQL estabelecida com sucesso!');
        conn.release();
    })
    .catch((err) => {
        console.error('❌ ERRO FATAL NO BANCO DE DADOS:', err.message);
    });

module.exports = pool;