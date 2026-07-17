const { Sequelize } = require('sequelize');
// Importado estaticamente para que o bundler serverless da Vercel (@vercel/nft)
// inclua o driver no pacote. O Sequelize carrega o dialeto dinamicamente, então
// sem isto o `pg` fica de fora e o deploy quebra com "Please install pg package".
const pg = require('pg');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    dialectModule: pg,
    logging: false,
  }
);

module.exports = sequelize;
