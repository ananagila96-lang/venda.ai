function first(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== '');
}

function normalizePhone(value) {
  if (!value) return null;
  return String(value).replace(/\D/g, '') || null;
}

export function normalizeZapiInbound(payload = {}) {
  const phone = normalizePhone(first(
    payload.phone,
    payload.from,
    payload.sender?.phone,
    payload.sender?.id,
    payload.chatId,
    payload.chat?.id
  ));

  const text = first(
    payload.text?.message,
    payload.text?.body,
    payload.message?.text,
    payload.message?.body,
    payload.body,
    payload.text
  );

  const messageId = first(
    payload.messageId,
    payload.message?.id,
    payload.id,
    payload.msgId
  );

  const instanceId = first(
    payload.instanceId,
    payload.instance?.id,
    payload.instance
  );

  const fromMe = Boolean(first(
    payload.fromMe,
    payload.message?.fromMe,
    false
  ));

  return {
    provider: 'zapi',
    mode: 'classic',
    eventType: first(payload.type, payload.event, payload.eventType, 'message'),
    instanceId: instanceId ? String(instanceId) : null,
    messageId: messageId ? String(messageId) : null,
    phone,
    text: typeof text === 'string' ? text : null,
    fromMe,
    receivedAt: new Date().toISOString(),
    raw: payload
  };
}

export function resolveTenantFromInstance(instanceId, env = process.env) {
  if (!instanceId) return null;

  let mapping = {};
  try {
    mapping = JSON.parse(env.ZAPI_INSTANCE_TENANT_MAP || '{}');
  } catch {
    throw new Error('Invalid ZAPI_INSTANCE_TENANT_MAP JSON');
  }

  const tenantId = mapping[String(instanceId)];
  return tenantId ? String(tenantId) : null;
}

export function createZapiWebhookHandler({ onMessage, env = process.env } = {}) {
  return async function handleZapiWebhook(payload = {}) {
    const event = normalizeZapiInbound(payload);
    const tenantId = resolveTenantFromInstance(event.instanceId || env.ZAPI_INSTANCE_ID, env);

    if (!tenantId) {
      const error = new Error('Unable to resolve tenant for Z-API instance');
      error.code = 'ZAPI_TENANT_NOT_FOUND';
      throw error;
    }

    const normalized = { ...event, tenantId };

    if (normalized.fromMe) {
      return { accepted: true, ignored: 'from_me', event: normalized };
    }

    if (!normalized.phone || !normalized.text) {
      return { accepted: true, ignored: 'non_text_or_incomplete', event: normalized };
    }

    if (typeof onMessage !== 'function') {
      return { accepted: true, pendingPersistence: true, event: normalized };
    }

    const messageResult = await onMessage(normalized);
    const metadata = messageResult && typeof messageResult === 'object' ? messageResult : {};
    return { accepted: true, ...metadata, event: normalized };
  };
}
