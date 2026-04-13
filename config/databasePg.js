const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false, // ou true se precisar
});

pool.on('connect', () => console.log('Conectado ao PostgreSQL via pg'));
pool.on('error', (err) => console.error('Erro inesperado no pool', err));

module.exports = pool;