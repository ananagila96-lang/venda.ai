import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../server/integrations/zapi/client.js', import.meta.url), 'utf8');
const moduleUrl = `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
const { getZapiConfig, sendZapiText } = await import(moduleUrl);

test('getZapiConfig uses Omni defaults without exposing secrets', () => {
  const config = getZapiConfig({});
  assert.equal(config.mode, 'omni');
  assert.equal(config.baseUrl, 'https://api.omni.z-api.io/v1');
  assert.equal(config.secretKey, undefined);
  assert.equal(config.channelId, undefined);
});

test('sendZapiText fails fast when credentials are absent', async () => {
  await assert.rejects(
    () => sendZapiText({ to: '5511999999999', text: 'oi', env: {}, fetchImpl: async () => { throw new Error('fetch should not run'); } }),
    /ZAPI_OMNI_CHANNEL_ID/
  );
});

test('sendZapiText sends the documented Omni payload', async () => {
  let request;
  const fetchImpl = async (url, options) => {
    request = { url, options };
    return {
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ messageId: 'msg-1' })
    };
  };

  const result = await sendZapiText({
    to: '5511999999999',
    text: 'Olá',
    fetchImpl,
    env: {
      ZAPI_MODE: 'omni',
      ZAPI_OMNI_BASE_URL: 'https://api.omni.z-api.io/v1',
      ZAPI_OMNI_SECRET_KEY: 'test-secret',
      ZAPI_OMNI_CHANNEL_ID: 'channel-123'
    }
  });

  assert.equal(request.url, 'https://api.omni.z-api.io/v1/channels/channel-123/messages');
  assert.equal(request.options.method, 'POST');
  assert.equal(request.options.headers.Authorization, 'Bearer test-secret');
  assert.deepEqual(JSON.parse(request.options.body), {
    recipient: { identifier: '5511999999999' },
    content: {
      type: 'TEXT',
      body: { message: 'Olá' }
    }
  });
  assert.deepEqual(result, { messageId: 'msg-1' });
});

test('sendZapiText surfaces non-2xx provider responses', async () => {
  await assert.rejects(
    () => sendZapiText({
      to: '5511999999999',
      text: 'oi',
      env: {
        ZAPI_MODE: 'omni',
        ZAPI_OMNI_SECRET_KEY: 'test-secret',
        ZAPI_OMNI_CHANNEL_ID: 'channel-123'
      },
      fetchImpl: async () => ({
        ok: false,
        status: 401,
        text: async () => JSON.stringify({ error: 'unauthorized' })
      })
    }),
    (error) => error.status === 401 && error.response?.error === 'unauthorized'
  );
});
