export function loadConfig(env = process.env) {
  const required = ["META_VERIFY_TOKEN", "META_WHATSAPP_TOKEN", "META_PHONE_NUMBER_ID", "META_APP_SECRET"];
  const missing = required.filter((key) => !env[key]);
  if (missing.length) throw new Error(`Missing environment variables: ${missing.join(", ")}`);
  return {
    port: Number(env.PORT || 3001),
    verifyToken: env.META_VERIFY_TOKEN,
    accessToken: env.META_WHATSAPP_TOKEN,
    phoneNumberId: env.META_PHONE_NUMBER_ID,
    appSecret: env.META_APP_SECRET,
    graphVersion: env.META_GRAPH_VERSION || "v23.0",
    webhookBaseUrl: env.WEBHOOK_BASE_URL || "",
    aiWebhookUrl: env.AI_WEBHOOK_URL || "",
    aiWebhookToken: env.AI_WEBHOOK_TOKEN || "",
  };
}
