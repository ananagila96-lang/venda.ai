import test from 'node:test';
import assert from 'node:assert/strict';
import { createInboundMessagePipeline } from '../server/pipeline/inbound-message.js';

function baseEvent(extra = {}) {
  return {
    tenantId: 'tenant-a',
    phone: '5561999999999',
    text: 'Quero marcar uma consulta',
    provider: 'zapi',
    messageId: 'msg-in-1',
    receivedAt: '2026-09-23T23:00:00.000Z',
    ...extra
  };
}

test('pipeline persists inbound, calls AI, persists outbound and sends reply', async () => {
  const calls = [];
  const store = {
    async saveInbound(input) { calls.push(['saveInbound', input]); return { duplicate: false, id: 'in-1' }; },
    async listRecentMessages(input) { calls.push(['history', input]); return [{ role: 'user', text: 'Quero marcar uma consulta' }]; },
    async saveOutboundPending(input) { calls.push(['pending', input]); return { id: 'out-1' }; },
    async markOutboundSent(input) { calls.push(['sent', input]); },
    async markOutboundFailed(input) { calls.push(['failed', input]); }
  };

  const handler = createInboundMessagePipeline({
    store,
    generateReply: async ({ messages }) => {
      calls.push(['ai', messages]);
      return { text: 'Claro. Qual dia você prefere?', responseId: 'resp-1', model: 'gpt-5.6-luna' };
    },
    sendText: async ({ to, text }) => {
      calls.push(['send', { to, text }]);
      return { messageId: 'zapi-out-1' };
    },
    logger: { info() {} }
  });

  const result = await handler(baseEvent());

  assert.equal(result.replySent, true);
  assert.equal(calls[0][0], 'saveInbound');
  assert.equal(calls[1][0], 'history');
  assert.equal(calls[2][0], 'ai');
  assert.equal(calls[3][0], 'pending');
  assert.equal(calls[4][0], 'send');
  assert.equal(calls[5][0], 'sent');
  assert.equal(calls.some(([name]) => name === 'failed'), false);
});

test('pipeline ignores duplicate provider message before AI and send', async () => {
  let aiCalls = 0;
  let sendCalls = 0;
  const store = {
    async saveInbound() { return { duplicate: true }; },
    async listRecentMessages() { throw new Error('should not load history'); },
    async saveOutboundPending() { throw new Error('should not persist outbound'); },
    async markOutboundSent() {},
    async markOutboundFailed() {}
  };

  const handler = createInboundMessagePipeline({
    store,
    generateReply: async () => { aiCalls += 1; return { text: 'x' }; },
    sendText: async () => { sendCalls += 1; },
    logger: { info() {} }
  });

  const result = await handler(baseEvent());
  assert.equal(result.duplicate, true);
  assert.equal(aiCalls, 0);
  assert.equal(sendCalls, 0);
});

test('pipeline keeps tenant id on every persistence mutation', async () => {
  const tenantIds = [];
  const store = {
    async saveInbound(input) { tenantIds.push(input.tenantId); return { duplicate: false, id: 'in-1' }; },
    async listRecentMessages(input) { tenantIds.push(input.tenantId); return [{ role: 'user', text: 'Oi' }]; },
    async saveOutboundPending(input) { tenantIds.push(input.tenantId); return { id: 'out-1' }; },
    async markOutboundSent(input) { tenantIds.push(input.tenantId); },
    async markOutboundFailed(input) { tenantIds.push(input.tenantId); }
  };

  const handler = createInboundMessagePipeline({
    store,
    generateReply: async () => ({ text: 'Olá', responseId: 'resp-1' }),
    sendText: async () => ({ messageId: 'provider-1' }),
    logger: { info() {} }
  });

  await handler(baseEvent({ tenantId: 'tenant-b' }));
  assert.deepEqual(tenantIds, ['tenant-b', 'tenant-b', 'tenant-b', 'tenant-b']);
});
