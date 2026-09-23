function normalizePhone(value) {
  return String(value || '').replace(/\D/g, '');
}

function firstDefined(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== '');
}

export function normalizeZapiWebhook(payload = {}) {
  const phone = normalizePhone(firstDefined(
    payload.phone,
    payload.from,
    payload.sender?.phone,
    payload.sender?.id,
    payload.chat?.phone,
    payload.chat?.id
  ));

  const text = String(firstDefined(
    payload.text?.message,
    payload.text?.body,
    payload.message?.text,
    payload.message?.body,
    payload.body,
    payload.content?.body?.message,
    ''
  ));

  const messageId = String(firstDefined(
    payload.messageId,
    payload.messageId?.id,
    payload.id,
    payload.message?.id,
    ''
  ));

  const channelId = String(firstDefined(
    payload.channelId,
    payload.channel?.id,
    payload.instanceId,
    payload.instance?.id,
    ''
  ));

  const fromMe = Boolean(firstDefined(
    payload.fromMe,
    payload.message?.fromMe,
    false
  ));

  return {
    provider: 'zapi',
    event: String(firstDefined(payload.event, payload.type, payload.webhookEvent, 'message')),
    messageId,
    channelId,
    phone,
    text,
    fromMe,
    receivedAt: new Date().toISOString(),
    raw: payload
  };
}

export function validateWebhookSecret({ providedSecret, env = process.env } = {}) {
  const expected = env.ZAPI_WEBHOOK_SECRET;
  if (!expected) {
    throw new Error('Missing required Z-API configuration: ZAPI_WEBHOOK_SECRET');
  }

  if (!providedSecret || providedSecret !== expected) {
    const error = new Error('Invalid Z-API webhook secret');
    error.status = 401;
    throw error;
  }

  return true;
}

export function isProcessableMessage(event) {
  return Boolean(event && !event.fromMe && event.phone && event.text);
}
