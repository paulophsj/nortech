// Carrega o app de forma protegida para capturar erros em tempo de import.
let app;
let loadError;
let ensureDatabase = null;

try {
  app = require('../src/app');
  ensureDatabase = require('../src/db').ensureDatabase;
} catch (err) {
  loadError = err;
  console.error('LOAD ERROR', err);
}

// Entrypoint serverless da Vercel. Todas as rotas são reescritas para esta
// função (ver vercel.json); o Express cuida do roteamento interno.
module.exports = async (req, res) => {
  try {
    if (loadError) throw loadError;
    await ensureDatabase();
    return app(req, res);
  } catch (err) {
    console.error('HANDLER ERROR', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        error: err && err.message,
        name: err && err.name,
        code: err && err.code,
        stack: err && err.stack,
      })
    );
  }
};
