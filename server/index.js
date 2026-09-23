import http from 'node:http';
import { URL } from 'node:url';
import { createZapiWebhookHandler } from './integrations/zapi/webhook.js';
import { sendZapiText } from './integrations/zapi/client.js';

const MAX_BODY_BYTES = 1024 * 1024;
const ZAPI_ROUNDTRIP_TRIGGER = 'teste venda ai';
const ZAPI_ROUNDTRIP_REPLY = 'Venda.AI online ⚡';

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body)
  });
  res.end(body);
}

async function readJson(req) {
  let size = 0;
  const chunks = [];

  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) {
      const error = new Error('Payload too large');
      error.status = 413;
      throw error;
    }
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return {};

  try {
    return JSON.parse(raw);
  } catch {
    const error = new Error('Invalid JSON');
    error.status = 400;
    throw error;
  }
}

function isWebhookAuthorized(url, req, env) {
  const expected = env.ZAPI_WEBHOOK_SECRET;
  if (!expected) return true;

  const provided = url.searchParams.get('secret') || req.headers['x-venda-webhook-secret'];
  return typeof provided === 'string' && provided === expected;
}

export function createP0InboundHandler({ env = process.env, sendText = sendZapiText, logger = console } = {}) {
  return async function handleInbound(event = {}) {
    const normalizedText = typeof event.text === 'string' ? event.text.trim().toLowerCase() : '';

    if (normalizedText !== ZAPI_ROUNDTRIP_TRIGGER) {
      return { handled: false, pendingPersistence: true };
    }

    await sendText({
      to: event.phone,
      text: ZAPI_ROUNDTRIP_REPLY,
      env
    });

    logger.info?.('Venda.AI Z-API roundtrip test reply sent', {
      tenantId: event.tenantId || null,
      messageId: event.messageId || null
    });

    return { handled: true, testReplySent: true };
  };
}

export function createApp({ env = process.env, onMessage } = {}) {
  const handleZapiWebhook = createZapiWebhookHandler({ env, onMessage });

  return http.createServer(async (req, res) => {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

    if (req.method === 'GET' && url.pathname === '/health') {
      return sendJson(res, 200, { ok: true, service: 'venda-ai-backend' });
    }

    if (req.method === 'POST' && url.pathname === '/webhooks/zapi') {
      if (!isWebhookAuthorized(url, req, env)) {
        return sendJson(res, 401, { ok: false, error: 'unauthorized' });
      }

      try {
        const payload = await readJson(req);
        const result = await handleZapiWebhook(payload);
        return sendJson(res, 202, { ok: true, ...result });
      } catch (error) {
        const statusCode = error.status || (error.code === 'ZAPI_TENANT_NOT_FOUND' ? 422 : 500);
        return sendJson(res, statusCode, {
          ok: false,
          error: error.code || 'webhook_error',
          message: error.message
        });
      }
    }

    return sendJson(res, 404, { ok: false, error: 'not_found' });
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const port = Number(process.env.PORT || 3000);
  const onMessage = createP0InboundHandler();
  const server = createApp({ onMessage });
  server.listen(port, '0.0.0.0', () => {
    console.log(`Venda.AI backend listening on port ${port}`);
  });
}
