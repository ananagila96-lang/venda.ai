import { generateOpenAIReply } from './ai/openai.js';
import { createPostgresConversationStore } from './conversations/postgres-store.js';
import { createPostgresDatabase } from './db/postgres.js';
import { sendZapiText } from './integrations/zapi/client.js';
import { createInboundMessagePipeline } from './pipeline/inbound-message.js';

function inboundPayload(event = {}) {
  return {
    tenantId: event.tenantId,
    contactKey: event.phone,
    provider: event.provider || 'zapi',
    providerMessageId: event.messageId || null,
    text: event.text,
    receivedAt: event.receivedAt || new Date().toISOString()
  };
}

export async function createProductionInboundRuntime({
  env = process.env,
  logger = console,
  sendText = sendZapiText,
  generateReply = generateOpenAIReply,
  databaseFactory = createPostgresDatabase
} = {}) {
  const database = await databaseFactory({ env });
  await database.migrate();

  const store = createPostgresConversationStore({ query: database.query });
  const aiEnabled = Boolean(env.OPENAI_API_KEY);

  if (aiEnabled) {
    const onMessage = createInboundMessagePipeline({
      store,
      generateReply,
      sendText,
      env,
      logger
    });

    return { onMessage, close: database.close, aiEnabled: true };
  }

  logger.warn?.('Venda.AI started with persistence enabled and AI disabled', {
    reason: 'OPENAI_API_KEY_MISSING'
  });

  const onMessage = async (event = {}) => {
    const inbound = await store.saveInbound(inboundPayload(event));

    logger.info?.('Venda.AI inbound persisted awaiting AI configuration', {
      tenantId: event.tenantId || null,
      messageId: event.messageId || null,
      duplicate: inbound.duplicate
    });

    return {
      handled: true,
      persisted: !inbound.duplicate,
      duplicate: inbound.duplicate,
      pendingAIConfiguration: true
    };
  };

  return { onMessage, close: database.close, aiEnabled: false };
}
