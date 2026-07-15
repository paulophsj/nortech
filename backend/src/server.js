require('dotenv').config();

const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const contactsRouter = require('./routes/contacts');

const app = express();

app.set('trust proxy', 1);

app.use(cors());
app.use(express.json());
app.use('/api', contactsRouter);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const port = process.env.PORT || 3000;

async function start() {
  await sequelize.authenticate();
  await sequelize.query('CREATE SCHEMA IF NOT EXISTS nortech');
  await sequelize.sync();
  app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
  });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
