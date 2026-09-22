const DEFAULT_BASE_URL = 'https://api.omni.z-api.io/v1';

function required(value, name) {
  if (!value) throw new Error(`Missing required Z-API configuration: ${name}`);
  return value;
}

export function getZapiConfig(env = process.env) {
  return {
    mode: env.ZAPI_MODE || 'omni',
    baseUrl: env.ZAPI_OMNI_BASE_URL || DEFAULT_BASE_URL,
    secretKey: env.ZAPI_OMNI_SECRET_KEY,
    channelId: env.ZAPI_OMNI_CHANNEL_ID
  };
}

export async function sendZapiText({ to, text, fetchImpl = fetch, env = process.env }) {
  if (!to || !text) throw new Error('sendZapiText requires to and text');

  const config = getZapiConfig(env);
  if (config.mode !== 'omni') {
    throw new Error('Only Z-API Omni is implemented in this adapter. Classic mode requires a separate reviewed adapter.');
  }

  const channelId = required(config.channelId, 'ZAPI_OMNI_CHANNEL_ID');
  const secretKey = required(config.secretKey, 'ZAPI_OMNI_SECRET_KEY');

  const response = await fetchImpl(
    `${config.baseUrl}/channels/${encodeURIComponent(channelId)}/messages`,
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
