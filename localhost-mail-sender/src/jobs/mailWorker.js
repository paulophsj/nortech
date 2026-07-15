const Contact = require('../models/Contact');
const { sendContactEmail } = require('../services/mailer');

let running = false;

// Busca os contatos com is_send = false, envia o email de cada um
// e marca is_send = true somente quando o envio dá certo.
async function processPendingEmails() {
  if (running) {
    console.log('[mail-worker] execução anterior ainda em andamento, pulando este ciclo.');
    return;
  }

  running = true;

  try {
    const pendentes = await Contact.findAll({
      where: { is_send: false },
      order: [['createdAt', 'ASC']],
    });

    if (pendentes.length === 0) {
      console.log('[mail-worker] nenhum email pendente.');
      return;
    }

    console.log(`[mail-worker] ${pendentes.length} email(s) pendente(s).`);

    let enviados = 0;
    for (const contact of pendentes) {
      try {
        await sendContactEmail(contact);
        contact.is_send = true;
        await contact.save();
        enviados += 1;
        console.log(`[mail-worker] enviado contato #${contact.id} (${contact.email}).`);
      } catch (err) {
        console.error(`[mail-worker] falha ao enviar contato #${contact.id}: ${err.message}`);
      }
    }

    console.log(`[mail-worker] concluído: ${enviados}/${pendentes.length} enviado(s).`);
  } catch (err) {
    console.error(`[mail-worker] erro ao consultar pendentes: ${err.message}`);
  } finally {
    running = false;
  }
}

module.exports = { processPendingEmails };
