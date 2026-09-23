import test from 'node:test';
import assert from 'node:assert/strict';
import { createPostgresConversationStore } from '../server/conversations/postgres-store.js';

test('postgres store scopes history query by tenant and contact', async () => {
  const calls = [];
  const store = createPostgresConversationStore({
    query: async (sql, params) => {
      calls.push({ sql, params });
      return { rows: [
        { direction: 'outbound', text: 'Resposta', created_at: '2026-09-23T23:01:00Z' },
        { direction: 'inbound', text: 'Pergunta', created_at: '2026-09-23T23:00:00Z' }
      ] };
    }
  });

  const history = await store.listRecentMessages({ tenantId: 'tenant-a', contactKey: '5561', limit: 20 });
  assert.deepEqual(calls[0].params, ['tenant-a', '5561', 20]);
  assert.match(calls[0].sql, /m\.tenant_id = \$1/);
  assert.match(calls[0].sql, /c\.tenant_id = \$1/);
  assert.deepEqual(history.map((item) => item.role), ['user', 'assistant']);
});

test('postgres store treats conflicting inbound provider id as duplicate', async () => {
  const responses = [
    { rows: [{ id: 'conversation-1' }] },
    { rows: [] }
  ];
  const store = createPostgresConversationStore({
    query: async () => responses.shift()
  });

  const result = await store.saveInbound({
    tenantId: 'tenant-a',
    contactKey: '5561',
    provider: 'zapi',
    providerMessageId: 'msg-1',
    text: 'Oi',
    receivedAt: '2026-09-23T23:00:00Z'
  });

  assert.equal(result.duplicate, true);
  assert.equal(result.conversationId, 'conversation-1');
});
