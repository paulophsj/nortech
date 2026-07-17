const sequelize = require('./config/database');

let initPromise;

async function initDatabase() {
  await sequelize.authenticate();
  await sequelize.query('CREATE SCHEMA IF NOT EXISTS nortech');
  await sequelize.sync();
}

// Garante que a conexão e o schema sejam preparados apenas uma vez por
// instância. Em ambiente serverless (Vercel) o mesmo processo é reutilizado
// entre invocações, então cacheamos a promessa de inicialização.
function ensureDatabase() {
  if (!initPromise) {
    initPromise = initDatabase().catch((err) => {
      // Libera a promessa para permitir nova tentativa na próxima invocação.
      initPromise = undefined;
      throw err;
    });
  }
  return initPromise;
}

module.exports = { ensureDatabase };
