const DEFAULT_CLASSIC_BASE_URL = 'https://api.z-api.io';
const DEFAULT_OMNI_BASE_URL = 'https://api.omni.z-api.io/v1';

function required(value, name) {
  if (!value) throw new Error(`Missing required Z-API configuration: ${name}`);
  return value;
}

export function getZapiConfig(env = process.env) {
  return {
    mode: env.ZAPI_MODE || 'classic',
    classicBaseUrl: env.ZAPI_CLASSIC_BASE_URL || DEFAULT_CLASSIC_BASE_URL,
    instanceId: env.ZAPI_INSTANCE_ID,
    token: env.ZAPI_TOKEN,
    clientToken: env.ZAPI_CLIENT_TOKEN,
    omniBaseUrl: env.ZAPI_OMNI_BASE_URL || DEFAULT_OMNI_BASE_URL,
    omniSecretKey: env.ZAPI_OMNI_SECRET_KEY,
    omniChannelId: env.ZAPI_OMNI_CHANNEL_ID
  };
}

async function parseResponse(response) {
  const raw = await response.text();
  let data;
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    data = { raw };
  }

  if (!response.ok) {
    const error = new Error(`Z-API request failed with status ${response.status}`);
    error.status = response.status;
    error.response = data;
    throw error;
  }

  return data;
}

async function sendClassicText({ to, text, fetchImpl, config }) {
  const instanceId = required(config.instanceId, 'ZAPI_INSTANCE_ID');
  const token = required(config.token, 'ZAPI_TOKEN');
  const clientToken = required(config.clientToken, 'ZAPI_CLIENT_TOKEN');

  const response = await fetchImpl(
    `${config.classicBaseUrl}/instances/${encodeURIComponent(instanceId)}/token/${encodeURIComponent(token)}/send-text`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Client-Token': clientToken
      },
      body: JSON.stringify({
        phone: String(to),
        message: String(text)
      })
    }
  );

  return parseResponse(response);
}

async function sendOmniText({ to, text, fetchImpl, config }) {
  const channelId = required(config.omniChannelId, 'ZAPI_OMNI_CHANNEL_ID');
  const secretKey = required(config.omniSecretKey, 'ZAPI_OMNI_SECRET_KEY');

  const response = await fetchImpl(
    `${config.omniBaseUrl}/channels/${encodeURIComponent(channelId)}/messages`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${secretKey}`
      },
      body: JSON.stringify({
        recipient: { identifier: String(to) },
        content: {
          type: 'TEXT',
          body: { message: String(text) }
        }
      })
    }
  );

  return parseResponse(response);
}

export async function sendZapiText({ to, text, fetchImpl = fetch, env = process.env }) {
  if (!to || !text) throw new Error('sendZapiText requires to and text');

  const config = getZapiConfig(env);

  if (config.mode === 'classic') {
    return sendClassicText({ to, text, fetchImpl, config });
  }

  if (config.mode === 'omni') {
    return sendOmniText({ to, text, fetchImpl, config });
  }

  throw new Error(`Unsupported Z-API mode: ${config.mode}`);
}
