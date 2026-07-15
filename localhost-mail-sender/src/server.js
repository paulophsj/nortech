require('dotenv').config();

const express = require('express');
const cron = require('node-cron');
const sequelize = require('./config/database');
const { pingHealth } = require('./jobs/keepAlive');
const { processPendingEmails } = require('./jobs/mailWorker');

const app = express();
const port = process.env.PORT || 4000;

let lastKeepAlive = null;
let lastMailRun = null;

app.get('/health', (req, res) =>
  res.json({ status: 'ok', uptime: process.uptime() })
);

app.get('/status', (req, res) =>
  res.json({
    status: 'ok',
    lastKeepAlive,
    lastMailRun,
  })
);

async function start() {
  await sequelize.authenticate();
  console.log('[db] conexão com o banco estabelecida.');

  // Keep-alive do Render: a cada 15 minutos.
  cron.schedule('*/15 * * * *', async () => {
    await pingHealth();
    lastKeepAlive = new Date().toISOString();
  });

  // Worker de emails: a cada 30 minutos.
  cron.schedule('*/5 * * * *', async () => {
    await processPendingEmails();
    lastMailRun = new Date().toISOString();
  });

  app.listen(port, () => {
    console.log(`[server] localhost-mail-sender rodando na porta ${port}`);
    console.log('[cron] keep-alive a cada 15min | mail-worker a cada 30min');
  });

  // Dispara uma vez logo na inicialização, sem esperar o primeiro ciclo do cron.
  pingHealth().then(() => {
    lastKeepAlive = new Date().toISOString();
  });
  processPendingEmails().then(() => {
    lastMailRun = new Date().toISOString();
  });
}

start().catch((err) => {
  console.error('[server] falha ao iniciar:', err);
  process.exit(1);
});
