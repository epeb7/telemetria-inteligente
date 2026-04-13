const { Client } = require('pg');
const client = new Client({
  host: '192.168.7.99',
  port: 5432,
  user: 'postgres',
  password: 'senha', // substitua
  database: 'postgres'
});
client.connect()
  .then(() => { console.log('Conectado!'); client.end(); })
  .catch(err => console.error('Erro:', err.message));