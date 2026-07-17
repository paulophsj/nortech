const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const Contact = require('../models/Contact');
const { sendContactEmail } = require('../services/mailer');
const { sanitizeText } = require('../utils/sanitize');

const router = Router();

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Muitas mensagens enviadas. Aguarde alguns minutos e tente novamente.' },
});

router.post('/contacts', contactLimiter, async (req, res) => {
  const body = req.body || {};
  const nome = sanitizeText(body.nome);
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const servicoInteresse = sanitizeText(body.servicoInteresse);
  const mensagem = sanitizeText(body.mensagem);

  if (!nome || !email || !servicoInteresse || !mensagem) {
    return res.status(400).json({
      error: 'Os campos nome, email, servicoInteresse e mensagem são obrigatórios.',
    });
  }

  try {
    const contact = await Contact.create({
      nome,
      email,
      servico_interesse: servicoInteresse,
      mensagem,
    });

    await sendContactEmail(contact);

    return res.status(201).json({ id: contact.id, message: 'Mensagem enviada com sucesso.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Falha ao processar a mensagem.' });
  }
});

module.exports = router;
