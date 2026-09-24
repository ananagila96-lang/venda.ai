import test from 'node:test';
import assert from 'node:assert/strict';
import { createProductionInboundRuntime } from '../server/runtime.js';

function createFakeDatabase() {
  const calls = [];
  let migrated = 0;
  let closed = 0;

  const query = async (sql, params) => {
    calls.push({ sql, params });

    if (sql.includes('INSERT INTO conversations')) {
      return { rows: [{ id: 'conversation-1' }] };
    }

    if (sql.includes('INSERT INTO conversation_messages') && sql.includes("'inbound'")) {
      return { rows: [{ id: 'message-in-1' }] };
    }

    throw new Error(`Unexpected SQL in fake database: ${sql}`);
  };

  return {
    database: {
      query,
      migrate: async () => { migrated += 1; },
      close: async () => { closed += 1; }
    },
    calls,
    get migrated() { return migrated; },
    get closed() { return closed; }
  };
}

test('production runtime migrates and persists inbound when AI key is absent', async () => {
  const fake = createFakeDatabase();
  const logs = [];

  const runtime = await createProductionInboundRuntime({
    env: { DATABASE_URL: 'postgres://example.invalid/venda' },
    databaseFactory: async () => fake.database,
    logger: {
      warn(message, meta) { logs.push({ level: 'warn', message, meta }); },
      info(message, meta) { logs.push({ level: 'info', message, meta }); }
    }
  });

  assert.equal(fake.migrated, 1);
  assert.equal(runtime.aiEnabled, false);

  const result = await runtime.onMessage({
    tenantId: 'tenant-a',
    phone: '5561999999999',
    provider: 'zapi',
    messageId: 'provider-1',
    text: 'Olá',
    receivedAt: '2026-09-23T20:00:00.000Z'
  });

  assert.equal(result.handled, true);
  assert.equal(result.persisted, true);
  assert.equal(result.pendingAIConfiguration, true);
  assert.equal(fake.calls.length, 2);
  assert.deepEqual(fake.calls[0].params, ['tenant-a', '5561999999999']);
  assert.equal(fake.calls[1].params[0], 'tenant-a');
  assert.equal(fake.calls[1].params[2], 'zapi');
  assert.equal(fake.calls[1].params[3], 'provider-1');

  await runtime.close();
  assert.equal(fake.closed, 1);
  assert.ok(logs.some((entry) => entry.meta?.reason === 'OPENAI_API_KEY_MISSING'));
});
