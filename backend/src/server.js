const app = require('./app');
const { ensureDatabase } = require('./db');

const port = process.env.PORT || 3000;

ensureDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Servidor rodando na porta ${port}`);
    });
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
