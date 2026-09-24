import http from 'node:http';
import { URL } from 'node:url';
import { createZapiWebhookHandler } from './integrations/zapi/webhook.js';
import { sendZapiText } from './integrations/zapi/client.js';

const MAX_BODY_BYTES = 1024 * 1024;
const ZAPI_ROUNDTRIP_TRIGGER = 'teste venda ai';
const ZAPI_ROUNDTRIP_REPLY = 'Venda.AI online ⚡';
const ANA_NUTRI_PERSONA = 'ana-nutri';

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

function normalizeForMatch(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function isAnaNutriEnabled(event, env) {
  const persona = normalizeForMatch(env.P0_TEST_PERSONA);
  if (persona !== ANA_NUTRI_PERSONA) return false;

  const tenant = String(env.P0_TEST_TENANT_ID || '').trim();
  return !tenant || tenant === event.tenantId;
}

export function buildAnaNutriTestReply(text) {
  const message = normalizeForMatch(text);

  if (/\b(oi|ola|bom dia|boa tarde|boa noite)\b/.test(message)) {
    return 'Oi! 😊 Eu sou a Ana, assistente da nutricionista. Me conta: o que você está buscando hoje — emagrecimento, ganho de massa, melhora da alimentação ou quer agendar uma consulta?';
  }

  if (/(agendar|agenda|consulta|horario|marcar)/.test(message)) {
    return 'Claro 💚 Vamos organizar sua consulta. Qual dia e período você prefere: manhã, tarde ou noite?';
  }

  if (/(valor|preco|preço|quanto custa|custa)/.test(message)) {
    return 'Te ajudo com isso 😊 É sua primeira consulta ou você já é paciente? Assim eu te passo o atendimento correto sem misturar as informações.';
  }

  if (/(emagrecer|emagrecimento|perder peso|ganhar massa|massa muscular|alimentacao|alimentação|dieta)/.test(message)) {
    return 'Entendi 💚 O acompanhamento é individualizado conforme seu objetivo e rotina. Quer que eu já te ajude a agendar uma avaliação com a nutricionista?';
  }

  if (/(cancelar|cancelamento)/.test(message)) {
    return 'Sem problema. Me diga seu nome e o horário da consulta que você quer cancelar para eu seguir com o atendimento.';
  }

  if (/(reagendar|remarcar|mudar horario|mudar horário)/.test(message)) {
    return 'Claro 😊 Me diga o horário atual da consulta e qual dia ou período seria melhor para você.';
  }

  return 'Entendi 😊 Me conta um pouquinho mais do que você precisa. Posso te ajudar com dúvidas de atendimento, objetivo nutricional ou agendamento.';
}

export function createP0InboundHandler({ env = process.env, sendText = sendZapiText, logger = console } = {}) {
  return async function handleInbound(event = {}) {
    const normalizedText = typeof event.text === 'string' ? event.text.trim().toLowerCase() : '';

    if (normalizedText === ZAPI_ROUNDTRIP_TRIGGER) {
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
    }

    if (isAnaNutriEnabled(event, env)) {
      const reply = buildAnaNutriTestReply(event.text);

      await sendText({
        to: event.phone,
        text: reply,
        env
      });

      logger.info?.('Venda.AI Ana Nutri test reply sent', {
        tenantId: event.tenantId || null,
        messageId: event.messageId || null
      });

      return { handled: true, testPersona: ANA_NUTRI_PERSONA };
    }

    return { handled: false, pendingPersistence: true };
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
