// Normaliza o payload real recebido da Whapi para o domínio do Venda.AI.
// O tenant NÃO deve ser aceito do remetente. Resolva channel_id -> tenant_id no servidor.
export function normalizeWhapiWebhook(payload = {}) {
  const channelId = payload.channel_id || null;
  const messages = Array.isArray(payload.messages) ? payload.messages : [];

  return messages
    .filter((message) => message && message.from_me !== true)
    .map((message) => ({
      provider: 'whapi',
      channelId,
      providerMessageId: message.id || null,
      chatId: message.chat_id || null,
      from: message.from || null,
      fromName: message.from_name || null,
      type: message.type || null,
      text: message.type === 'text' ? message.text?.body || '' : '',
      timestamp: message.timestamp || null,
      raw: message,
    }));
}

export function assertWhapiTenant(channelId, channelTenantMap) {
  if (!channelId) throw new Error('Whapi channel_id ausente');
  const tenantId = channelTenantMap?.[channelId];
  if (!tenantId) throw new Error('Canal Whapi não associado a tenant');
  return tenantId;
}
