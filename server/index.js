import { loadConfig } from "./config.js";
import { createApp } from "./app.js";
import { MemoryConversationStore } from "./conversation-store.js";
import { registerTenant } from "./tenant-store.js";

const config = loadConfig();
const tenantId = process.env.VENDAAI_TENANT_ID;
if (!tenantId) throw new Error("VENDAAI_TENANT_ID is required");
registerTenant({ id: tenantId, phoneNumberId: config.phoneNumberId, accessToken: config.accessToken });

const app = createApp({ config, conversationStore: new MemoryConversationStore() });
app.listen(config.port, () => console.log(`Venda.AI WhatsApp listening on :${config.port}`));
