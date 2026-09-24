import http from 'node:http';
import { URL } from 'node:url';
import { createAuthService } from './auth/service.js';
import { sendPasswordResetEmail } from './auth/email.js';
import { createZapiWebhookHandler } from './integrations/zapi/webhook.js';
import { sendZapiText } from './integrations/zapi/client.js';
import { createProductionInboundRuntime } from './runtime.js';

const MAX_BODY_BYTES = 1024 * 1024;
const ZAPI_ROUNDTRIP_TRIGGER = 'teste venda ai';
const ZAPI_ROUNDTRIP_REPLY = 'Venda.AI online ⚡';
const ANA_NUTRI_PERSONA = 'ana-nutri';

function corsHeaders(req, env) {
  const configured = String(env.PUBLIC_APP_ORIGIN || '').trim();
  const origin = req.headers.origin;
  const allowOrigin = configured && origin === configured ? configured : configured ? null : '*';
  return {
    ...(allowOrigin ? { 'Access-Control-Allow-Origin': allowOrigin } : {}),
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400'
  };
}

function sendJson(res, statusCode, payload, headers = {}) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    ...headers
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

function bearerToken(req) {
  const header = String(req.headers.authorization || '');
  return header.startsWith('Bearer ') ? header.slice(7).trim() : '';
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

function passwordResetUrl(env, token) {
  const base = String(env.PASSWORD_RESET_BASE_URL || '').trim().replace(/\/$/, '');
  return base ? `${base}/#/reset-password?token=${encodeURIComponent(token)}` : '';
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

export function composeInboundHandlers(primary, fallback) {
  return async function handleComposedInbound(event = {}) {
    const primaryResult = await primary(event);
    if (primaryResult?.handled) return primaryResult;
    return fallback(event);
  };
}

async function handleAuthRequest({ req, res, url, env, authService, logger, headers }) {
  if (!url.pathname.startsWith('/auth/')) return false;

  if (!authService) {
    sendJson(res, 503, { ok: false, error: 'auth_unavailable' }, headers);
    return true;
  }

  try {
    if (req.method === 'POST' && url.pathname === '/auth/signup') {
      const body = await readJson(req);
      const user = await authService.signup(body);
      sendJson(res, 201, { ok: true, status: 'PENDING', user }, headers);
      return true;
    }

    if (req.method === 'POST' && url.pathname === '/auth/login') {
      const body = await readJson(req);
      const session = await authService.login(body);
      sendJson(res, 200, { ok: true, ...session }, headers);
      return true;
    }

    if (req.method === 'POST' && url.pathname === '/auth/forgot-password') {
      const body = await readJson(req);
      const reset = await authService.requestPasswordReset(body.email);

      if (reset) {
        const resetUrl = passwordResetUrl(env, reset.token);
        if (resetUrl) {
          try {
            const result = await sendPasswordResetEmail({
              to: reset.user.email,
              name: reset.user.name,
              resetUrl,
              env
            });
            if (!result.sent) logger.warn?.('Venda.AI password reset email provider unavailable', { reason: result.reason });
          } catch (error) {
            logger.error?.('Venda.AI password reset email failed', { code: error.code || null, message: error.message });
          }
        } else {
          logger.warn?.('Venda.AI password reset URL not configured', { reason: 'PASSWORD_RESET_BASE_URL_MISSING' });
        }
      }

      sendJson(res, 200, {
        ok: true,
        message: 'Se este e-mail estiver cadastrado, enviaremos as instruções para redefinir a senha.'
      }, headers);
      return true;
    }

    if (req.method === 'POST' && url.pathname === '/auth/reset-password') {
      const body = await readJson(req);
      await authService.resetPassword(body);
      sendJson(res, 200, { ok: true }, headers);
      return true;
    }

    if (req.method === 'GET' && url.pathname === '/auth/session') {
      const user = await authService.verifySession(bearerToken(req));
      if (!user) {
        sendJson(res, 401, { ok: false, error: 'invalid_session' }, headers);
      } else {
        sendJson(res, 200, { ok: true, user }, headers);
      }
      return true;
    }

    if (req.method === 'POST' && url.pathname === '/auth/logout') {
      await authService.logout(bearerToken(req));
      sendJson(res, 200, { ok: true }, headers);
      return true;
    }

    sendJson(res, 404, { ok: false, error: 'not_found' }, headers);
    return true;
  } catch (error) {
    sendJson(res, error.status || 500, {
      ok: false,
      error: error.code || 'auth_error',
      message: error.status && error.status < 500 ? error.message : 'Não foi possível concluir a operação.'
    }, headers);
    return true;
  }
}

export function createApp({ env = process.env, onMessage, authService, logger = console } = {}) {
  const handleZapiWebhook = createZapiWebhookHandler({ env, onMessage });

  return http.createServer(async (req, res) => {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    const headers = corsHeaders(req, env);

    if (req.method === 'OPTIONS') {
      res.writeHead(204, headers);
      return res.end();
    }

    if (req.method === 'GET' && url.pathname === '/health') {
      return sendJson(res, 200, { ok: true, service: 'venda-ai-backend' }, headers);
    }

    if (await handleAuthRequest({ req, res, url, env, authService, logger, headers })) return;

    if (req.method === 'POST' && url.pathname === '/webhooks/zapi') {
      if (!isWebhookAuthorized(url, req, env)) {
        return sendJson(res, 401, { ok: false, error: 'unauthorized' }, headers);
      }

      try {
        const payload = await readJson(req);
        const result = await handleZapiWebhook(payload);
        return sendJson(res, 202, { ok: true, ...result }, headers);
      } catch (error) {
        const statusCode = error.status || (error.code === 'ZAPI_TENANT_NOT_FOUND' ? 422 : 500);
        return sendJson(res, statusCode, {
          ok: false,
          error: error.code || 'webhook_error',
          message: error.message
        }, headers);
      }
    }

    return sendJson(res, 404, { ok: false, error: 'not_found' }, headers);
  });
}

export async function startServer({ env = process.env, logger = console } = {}) {
  const port = Number(env.PORT || 3000);
  const testHandler = createP0InboundHandler({ env, logger });
  let runtime = null;
  let authService = null;
  let onMessage = testHandler;

  if (env.DATABASE_URL) {
    runtime = await createProductionInboundRuntime({ env, logger });
    onMessage = composeInboundHandlers(testHandler, runtime.onMessage);
    authService = createAuthService({ query: runtime.database.query });
  } else {
    logger.warn?.('Venda.AI started without server-side persistence', {
      reason: 'DATABASE_URL_MISSING'
    });
  }

  const server = createApp({ env, onMessage, authService, logger });
  server.listen(port, '0.0.0.0', () => {
    logger.log?.(`Venda.AI backend listening on port ${port}`);
  });

  const shutdown = async () => {
    server.close();
    await runtime?.close?.();
  };

  process.once('SIGTERM', shutdown);
  process.once('SIGINT', shutdown);

  return { server, runtime, authService };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  startServer().catch((error) => {
    console.error('Venda.AI backend failed to start', {
      code: error.code || null,
      message: error.message
    });
    process.exitCode = 1;
  });
}
