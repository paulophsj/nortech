require('dotenv').config();

const express = require('express');
const cors = require('cors');
const contactsRouter = require('./routes/contacts');

const app = express();

app.set('trust proxy', 1);

app.use(cors());
app.use(express.json());
app.use('/api', contactsRouter);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

module.exports = app;
