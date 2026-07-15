const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function fieldRow(label, value) {
  return `
    <tr>
      <td style="padding:0 0 18px 0;">
        <p style="margin:0 0 4px 0;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#94a3b8;">${label}</p>
        <p style="margin:0;font-size:16px;font-weight:600;color:#0f172e;">${value}</p>
      </td>
    </tr>
  `;
}

function buildContactEmailHtml(contact) {
  const nome = escapeHtml(contact.nome);
  const email = escapeHtml(contact.email);
  const servico = escapeHtml(contact.servico_interesse);
  const mensagem = escapeHtml(contact.mensagem).replace(/\r?\n/g, '<br />');
  const recebidaEm = new Date(contact.createdAt || Date.now()).toLocaleString('pt-BR', {
    timeZone: 'America/Recife',
    dateStyle: 'long',
    timeStyle: 'short',
  });

  return `
  <div style="margin:0;padding:40px 16px;background-color:#f1f5f9;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;border-collapse:separate;">
      <tr>
        <td style="height:5px;border-radius:16px 16px 0 0;background-color:#0ea5e9;background-image:linear-gradient(90deg,#0ea5e9,#8b5cf6);font-size:0;line-height:0;">&nbsp;</td>
      </tr>
      <tr>
        <td style="background-color:#0a0f1e;padding:30px 36px;">
          <p style="margin:0;font-size:24px;font-weight:800;letter-spacing:-0.5px;color:#ffffff;">Nor<span style="color:#38bdf8;">tech</span></p>
          <p style="margin:16px 0 0 0;">
            <span style="display:inline-block;padding:6px 16px;border:1px solid #0e638c;border-radius:999px;background-color:#0f2438;color:#7dd3fc;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">&#9993;&nbsp; Nova mensagem do site</span>
          </p>
        </td>
      </tr>
      <tr>
        <td style="background-color:#ffffff;padding:36px 36px 12px 36px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${fieldRow('Nome', nome)}
            ${fieldRow('E-mail', `<a href="mailto:${email}" style="color:#0284c7;text-decoration:none;">${email}</a>`)}
            ${fieldRow('Serviço de interesse', servico)}
            <tr>
              <td style="padding:0;">
                <p style="margin:0 0 8px 0;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#94a3b8;">Mensagem</p>
                <div style="padding:18px 20px;border-left:3px solid #0ea5e9;border-radius:0 10px 10px 0;background-color:#f8fafc;">
                  <p style="margin:0;font-size:15px;line-height:1.7;color:#334155;">${mensagem}</p>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="background-color:#ffffff;border-radius:0 0 16px 16px;padding:24px 36px 36px 36px;">
          <a href="mailto:${email}?subject=${encodeURIComponent(`Re: ${contact.servico_interesse} - Nortech`)}" style="display:inline-block;padding:13px 28px;border-radius:10px;background-color:#0ea5e9;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;">Responder para ${nome}</a>
        </td>
      </tr>
      <tr>
        <td style="padding:24px 12px 0 12px;text-align:center;">
          <p style="margin:0;font-size:12px;line-height:1.6;color:#94a3b8;">Recebida em ${recebidaEm} &bull; E-mail autom&aacute;tico gerado pelo formul&aacute;rio de contato do site da Nortech.</p>
        </td>
      </tr>
    </table>
  </div>
  `;
}

async function sendContactEmail(contact) {
  await transporter.sendMail({
    from: `"Site Nortech" <${process.env.MAIL_ADDRESS}>`,
    to: process.env.MAIL_ADDRESS,
    replyTo: contact.email,
    subject: `Novo contato: ${contact.nome} - ${contact.servico_interesse}`,
    html: buildContactEmailHtml(contact),
    text: `Nova mensagem do site\n\nNome: ${contact.nome}\nE-mail: ${contact.email}\nServiço de interesse: ${contact.servico_interesse}\n\nMensagem:\n${contact.mensagem}`,
  });
}

module.exports = { sendContactEmail };
