export async function sendPasswordResetEmail({ to, name, resetUrl, env = process.env, fetchImpl = fetch } = {}) {
  const apiKey = env.RESEND_API_KEY;
  const from = env.AUTH_EMAIL_FROM;

  if (!apiKey || !from) {
    return { sent: false, reason: 'EMAIL_PROVIDER_NOT_CONFIGURED' };
  }

  const response = await fetchImpl('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: 'Redefina sua senha do Venda.AI',
      html: `<p>Olá${name ? `, ${escapeHtml(name)}` : ''}.</p><p>Recebemos um pedido para redefinir sua senha do Venda.AI.</p><p><a href="${escapeHtml(resetUrl)}">Criar nova senha</a></p><p>Este link expira em 30 minutos e só pode ser usado uma vez.</p><p>Se você não pediu a redefinição, ignore este e-mail.</p>`
    })
  });

  if (!response.ok) {
    const error = new Error(`Falha ao enviar e-mail de recuperação (${response.status}).`);
    error.code = 'EMAIL_SEND_FAILED';
    throw error;
  }

  return { sent: true };
}

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
