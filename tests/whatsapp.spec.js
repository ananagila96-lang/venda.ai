import assert from "node:assert/strict";
import crypto from "node:crypto";
import test from "node:test";
import { extractInboundMessages, verifyMetaSignature } from "../server/whatsapp.js";
import { MemoryConversationStore } from "../server/conversation-store.js";

test("validates Meta signature", () => {
  const raw = Buffer.from('{"ok":true}');
  const secret = "secret";
  const sig = "sha256=" + crypto.createHmac("sha256", secret).update(raw).digest("hex");
  assert.equal(verifyMetaSignature(raw, sig, secret), true);
  assert.equal(verifyMetaSignature(raw, "sha256=bad", secret), false);
});

test("extracts inbound message with phone number id", () => {
  const payload = { entry: [{ changes: [{ value: { metadata: { phone_number_id: "123" }, messages: [{ from: "556199999999", id: "wamid.1", timestamp: "1", type: "text", text: { body: "Oi" } }] } }] }] };
  assert.deepEqual(extractInboundMessages(payload)[0], { phoneNumberId: "123", contactWaId: "556199999999", providerMessageId: "wamid.1", type: "text", text: "Oi", timestamp: 1000 });
});

test("conversation store isolates tenants", async () => {
  const store = new MemoryConversationStore();
  await store.append({ tenantId: "a", contactWaId: "1", direction: "inbound", text: "A" });
  await store.append({ tenantId: "b", contactWaId: "1", direction: "inbound", text: "B" });
  assert.equal((await store.list("a", "1"))[0].text, "A");
  assert.equal((await store.list("b", "1"))[0].text, "B");
});
