import http from "node:http";
import { verifyMetaSignature, extractInboundMessages, sendText } from "./whatsapp.js";
import { resolveTenantByPhoneNumberId } from "./tenant-store.js";
import { getAIReply } from "./ai.js";

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks);
}

export function createApp({ config, conversationStore, fetchImpl = fetch, logger = console }) {
  const processed = new Set();

  return http.createServer(async (req, res) => {
    const url = new URL(req.url, "http://localhost");
    if (req.method === "GET" && url.pathname === "/health") {
      res.writeHead(200, { "content-type": "application/json" }); return res.end(JSON.stringify({ ok: true, service: "venda-ai-whatsapp" }));
    }
    if (req.method === "GET" && url.pathname === "/webhooks/whatsapp") {
      const ok = url.searchParams.get("hub.mode") === "subscribe" && url.searchParams.get("hub.verify_token") === config.verifyToken;
      res.writeHead(ok ? 200 : 403); return res.end(ok ? (url.searchParams.get("hub.challenge") || "") : "forbidden");
    }
    if (req.method === "POST" && url.pathname === "/webhooks/whatsapp") {
      const raw = await readBody(req);
      if (!verifyMetaSignature(raw, req.headers["x-hub-signature-256"], config.appSecret)) { res.writeHead(401); return res.end("invalid signature"); }
      let payload; try { payload = JSON.parse(raw.toString("utf8")); } catch { res.writeHead(400); return res.end("invalid json"); }
      res.writeHead(200); res.end("EVENT_RECEIVED");

      for (const msg of extractInboundMessages(payload)) {
        if (processed.has(msg.providerMessageId)) continue;
        processed.add(msg.providerMessageId);
        const tenant = resolveTenantByPhoneNumberId(msg.phoneNumberId);
        if (!tenant) { logger.warn("Unknown WhatsApp phone_number_id", msg.phoneNumberId); continue; }
        try {
          await conversationStore.append({ tenantId: tenant.id, contactWaId: msg.contactWaId, providerMessageId: msg.providerMessageId, direction: "inbound", type: msg.type, text: msg.text, timestamp: msg.timestamp });
          if (!msg.text) continue;
          const history = await conversationStore.list(tenant.id, msg.contactWaId);
          const reply = await getAIReply({ url: config.aiWebhookUrl, token: config.aiWebhookToken, tenantId: tenant.id, contactWaId: msg.contactWaId, text: msg.text, history, fetchImpl });
          if (!reply) continue;
          const sent = await sendText({ accessToken: tenant.accessToken || config.accessToken, phoneNumberId: msg.phoneNumberId, graphVersion: config.graphVersion, to: msg.contactWaId, text: reply, fetchImpl });
          await conversationStore.append({ tenantId: tenant.id, contactWaId: msg.contactWaId, providerMessageId: sent?.messages?.[0]?.id || null, direction: "outbound", type: "text", text: reply, timestamp: Date.now() });
        } catch (error) { logger.error("WhatsApp processing failed", error); }
      }
      return;
    }
    res.writeHead(404); res.end("not found");
  });
}
