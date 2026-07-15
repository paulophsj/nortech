const KEEPALIVE_URL = process.env.KEEPALIVE_URL;

// Faz um GET em {KEEPALIVE_URL}/health para evitar que o serviço no Render hiberne.
async function pingHealth() {
  if (!KEEPALIVE_URL) {
    console.warn('[keep-alive] KEEPALIVE_URL não definida no .env, ping ignorado.');
    return;
  }

  const url = `${KEEPALIVE_URL.replace(/\/$/, '')}/health`;

  try {
    const res = await fetch(url, { method: 'GET' });
    console.log(`[keep-alive] ${url} -> ${res.status}`);
  } catch (err) {
    console.error(`[keep-alive] falha ao pingar ${url}: ${err.message}`);
  }
}

module.exports = { pingHealth };
