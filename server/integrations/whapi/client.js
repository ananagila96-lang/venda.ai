const WHAPI_BASE_URL = process.env.WHAPI_BASE_URL || 'https://gate.whapi.cloud';

function requireToken() {
  const token = process.env.WHAPI_TOKEN;
  if (!token) throw new Error('WHAPI_TOKEN não configurado no servidor');
  return token;
}

async function whapiRequest(path, { method = 'GET', body } = {}) {
  const response = await fetch(`${WHAPI_BASE_URL}${path}`, {
    method,
    headers: {
      accept: 'application/json',
      authorization: `Bearer ${requireToken()}`,
      ...(body ? { 'content-type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const text = await response.text();
  let data;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }

  if (!response.ok) {
    const error = new Error(`Whapi HTTP ${response.status}`);
    error.status = response.status;
    error.response = data;
    throw error;
  }
  return data;
}

export function sendWhapiText(to, body) {
  if (!to || !body) throw new Error('to e body são obrigatórios');
  return whapiRequest('/messages/text', { method: 'POST', body: { to, body } });
}

export function getWhapiHealth() {
  return whapiRequest('/health');
}
