import crypto from "node:crypto";

export function verifyMetaSignature(rawBody, signature, appSecret) {
  if (!signature || !appSecret) return false;
  const expected = "sha256=" + crypto.createHmac("sha256", appSecret).update(rawBody).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function extractInboundMessages(payload) {
  const out = [];
  for (const entry of payload?.entry || []) {
    for (const change of entry?.changes || []) {
      const value = change?.value || {};
      const phoneNumberId = value?.metadata?.phone_number_id;
      for (const message of value?.messages || []) {
        if (!phoneNumberId || !message?.from || !message?.id) continue;
        out.push({
          phoneNumberId: String(phoneNumberId),
          contactWaId: String(message.from),
          providerMessageId: String(message.id),
          type: message.type || "unknown",
          text: message?.text?.body || "",
          timestamp: message.timestamp ? Number(message.timestamp) * 1000 : Date.now(),
        });
      }
    }
  }
  return out;
}

export async function sendText({ accessToken, phoneNumberId, graphVersion = "v23.0", to, text, fetchImpl = fetch }) {
  const response = await fetchImpl(`https://graph.facebook.com/${graphVersion}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ messaging_product: "whatsapp", recipient_type: "individual", to, type: "text", text: { body: text } }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`WhatsApp send failed (${response.status}): ${JSON.stringify(body)}`);
  return body;
}
