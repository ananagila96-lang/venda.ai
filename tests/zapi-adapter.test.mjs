import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../server/integrations/zapi/client.js', import.meta.url), 'utf8');
const moduleUrl = `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
const { getZapiConfig, sendZapiText } = await import(moduleUrl);

test('getZapiConfig defaults to Classic without exposing secrets', () => {
  const config = getZapiConfig({});
  assert.equal(config.mode, 'classic');
  assert.equal(config.classicBaseUrl, 'https://api.z-api.io');
  assert.equal(config.instanceId, undefined);
  assert.equal(config.token, undefined);
  assert.equal(config.clientToken, undefined);
});

test('sendZapiText Classic fails fast when credentials are absent', async () => {
  await assert.rejects(
    () => sendZapiText({ to: '5511999999999', text: 'oi', env: {}, fetchImpl: async () => { throw new Error('fetch should not run'); } }),
    /ZAPI_INSTANCE_ID/
  );
});

test('sendZapiText Classic sends the documented request', async () => {
  let request;
  const fetchImpl = async (url, options) => {
    request = { url, options };
    return {
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ zaapId: 'msg-1' })
    };
  };

  const result = await sendZapiText({
    to: '5511999999999',
    text: 'Olá',
    fetchImpl,
    env: {
      ZAPI_MODE: 'classic',
      ZAPI_CLASSIC_BASE_URL: 'https://api.z-api.io',
      ZAPI_INSTANCE_ID: 'instance-123',
      ZAPI_TOKEN: 'test-token',
      ZAPI_CLIENT_TOKEN: 'test-client-token'
    }
  });

  assert.equal(request.url, 'https://api.z-api.io/instances/instance-123/token/test-token/send-text');
  assert.equal(request.options.method, 'POST');
  assert.equal(request.options.headers['Client-Token'], 'test-client-token');
  assert.deepEqual(JSON.parse(request.options.body), {
    phone: '5511999999999',
    message: 'Olá'
  });
  assert.deepEqual(result, { zaapId: 'msg-1' });
});

test('sendZapiText still supports Omni explicitly', async () => {
  let request;
  const fetchImpl = async (url, options) => {
    request = { url, options };
    return { ok: true, status: 200, text: async () => '{}' };
  };

  await sendZapiText({
    to: '5511999999999',
    text: 'Olá',
    fetchImpl,
    env: {
      ZAPI_MODE: 'omni',
      ZAPI_OMNI_SECRET_KEY: 'test-secret',
      ZAPI_OMNI_CHANNEL_ID: 'channel-123'
    }
  });

  assert.equal(request.url, 'https://api.omni.z-api.io/v1/channels/channel-123/messages');
  assert.equal(request.options.headers.Authorization, 'Bearer test-secret');
});

test('sendZapiText surfaces non-2xx provider responses', async () => {
  await assert.rejects(
    () => sendZapiText({
      to: '5511999999999',
      text: 'oi',
      env: {
        ZAPI_MODE: 'classic',
        ZAPI_INSTANCE_ID: 'instance-123',
        ZAPI_TOKEN: 'test-token',
        ZAPI_CLIENT_TOKEN: 'test-client-token'
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
