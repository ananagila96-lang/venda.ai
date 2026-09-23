import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createApp, createP0InboundHandler } from '../server/index.js';
import { normalizeZapiInbound, resolveTenantFromInstance } from '../server/integrations/zapi/webhook.js';

const INSTANCE_ID = 'instance-test';
const TENANT_ID = 'tenant-test';

function env(extra = {}) {
  return {
    ZAPI_INSTANCE_ID: INSTANCE_ID,
    ZAPI_INSTANCE_TENANT_MAP: JSON.stringify({ [INSTANCE_ID]: TENANT_ID }),
    ZAPI_WEBHOOK_SECRET: 'webhook-secret-test',
    ...extra
  };
}

test('normalizeZapiInbound extracts text message data', () => {
  const event = normalizeZapiInbound({
    instanceId: INSTANCE_ID,
    messageId: 'msg-1',
    phone: '55 (61) 99999-9999',
    text: { message: 'Olá' },
    fromMe: false
  });

  assert.equal(event.instanceId, INSTANCE_ID);
  assert.equal(event.messageId, 'msg-1');
  assert.equal(event.phone, '5561999999999');
  assert.equal(event.text, 'Olá');
  assert.equal(event.fromMe, false);
});

test('resolveTenantFromInstance isolates tenant server-side', () => {
  assert.equal(resolveTenantFromInstance(INSTANCE_ID, env()), TENANT_ID);
  assert.equal(resolveTenantFromInstance('unknown', env()), null);
});

test('POST /webhooks/zapi rejects wrong webhook secret', async () => {
  const server = createApp({ env: env() });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');

  try {
    const { port } = server.address();
    const response = await fetch(`http://127.0.0.1:${port}/webhooks/zapi?secret=wrong`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ instanceId: INSTANCE_ID, phone: '5561999999999', text: { message: 'oi' } })
    });

    assert.equal(response.status, 401);
  } finally {
    server.close();
    await once(server, 'close');
  }
});

test('POST /webhooks/zapi accepts and routes normalized text event', async () => {
  const received = [];
  const server = createApp({
    env: env(),
    onMessage: async (event) => received.push(event)
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');

  try {
    const { port } = server.address();
    const response = await fetch(`http://127.0.0.1:${port}/webhooks/zapi?secret=webhook-secret-test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instanceId: INSTANCE_ID,
        messageId: 'msg-2',
        phone: '5561999999999',
        text: { message: 'Quero agendar' }
      })
    });

    assert.equal(response.status, 202);
    const body = await response.json();
    assert.equal(body.ok, true);
    assert.equal(received.length, 1);
    assert.equal(received[0].tenantId, TENANT_ID);
    assert.equal(received[0].text, 'Quero agendar');
  } finally {
    server.close();
    await once(server, 'close');
  }
});

test('P0 inbound handler replies only to controlled roundtrip trigger', async () => {
  const sent = [];
  const handler = createP0InboundHandler({
    env: env(),
    sendText: async (payload) => sent.push(payload),
    logger: { info() {} }
  });

  const result = await handler({
    tenantId: TENANT_ID,
    messageId: 'msg-test',
    phone: '5561999999999',
    text: '  TESTE VENDA AI  '
  });

  assert.equal(result.handled, true);
  assert.equal(result.testReplySent, true);
  assert.equal(sent.length, 1);
  assert.equal(sent[0].to, '5561999999999');
  assert.equal(sent[0].text, 'Venda.AI online ⚡');
});

test('P0 inbound handler leaves non-test messages pending persistence', async () => {
  const sent = [];
  const handler = createP0InboundHandler({
    env: env(),
    sendText: async (payload) => sent.push(payload),
    logger: { info() {} }
  });

  const result = await handler({
    tenantId: TENANT_ID,
    messageId: 'msg-normal',
    phone: '5561999999999',
    text: 'Quero agendar'
  });

  assert.equal(result.handled, false);
  assert.equal(result.pendingPersistence, true);
  assert.equal(sent.length, 0);
});
