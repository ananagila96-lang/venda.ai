import {
  isProcessableMessage,
  normalizeZapiWebhook,
  validateWebhookSecret
} from './webhook.js';

function json(status, body) {
  return {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body)
  };
}

export async function handleZapiWebhook({
  body,
  headers = {},
  env = process.env,
  onMessage
} = {}) {
  const providedSecret =
    headers['x-vendaai-webhook-secret'] ||
    headers['X-VendaAI-Webhook-Secret'] ||
    body?.webhookSecret;

  validateWebhookSecret({ providedSecret, env });

  const event = normalizeZapiWebhook(body);
  if (!isProcessableMessage(event)) {
    return json(202, { ok: true, ignored: true });
  }

  if (typeof onMessage !== 'function') {
    throw new Error('handleZapiWebhook requires an onMessage callback');
  }

  await onMessage(event);
  return json(200, {
    ok: true,
    provider: event.provider,
    messageId: event.messageId || null
  });
}
