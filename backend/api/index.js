const app = require('../src/app');
const { ensureDatabase } = require('../src/db');

// Entrypoint serverless da Vercel. Todas as rotas são reescritas para esta
// função (ver vercel.json); o Express cuida do roteamento interno.
module.exports = async (req, res) => {
  try {
    await ensureDatabase();
  } catch (err) {
    console.error(err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Erro de conexão com o banco de dados.' }));
    return;
  }

  return app(req, res);
};
