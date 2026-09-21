// Append-only contract used by the webhook. P0 ships an in-memory adapter only for tests.
// Production MUST inject a durable store keyed by tenantId + contactWaId.
export class MemoryConversationStore {
  constructor() { this.messages = []; }
  async append(message) {
    if (!message?.tenantId || !message?.contactWaId || !message?.direction) throw new Error("invalid conversation message");
    this.messages.push(Object.freeze({ ...message }));
    return message;
  }
  async list(tenantId, contactWaId) {
    return this.messages.filter((m) => m.tenantId === tenantId && m.contactWaId === contactWaId);
  }
}
