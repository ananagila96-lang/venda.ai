function assertFunction(value, name) {
  if (typeof value !== 'function') {
    throw new Error(`Missing inbound pipeline dependency: ${name}`);
  }
}

function assertEvent(event = {}) {
  for (const field of ['tenantId', 'phone', 'text']) {
    if (!event[field]) throw new Error(`Inbound event missing ${field}`);
  }
}

export function createInboundMessagePipeline({
  store,
  generateReply,
  sendText,
  env = process.env,
  logger = console,
  historyLimit = 20
} = {}) {
  if (!store) throw new Error('Missing inbound pipeline dependency: store');
  for (const method of [
    'saveInbound',
    'listRecentMessages',
    'saveOutboundPending',
    'markOutboundSent',
    'markOutboundFailed'
  ]) {
    assertFunction(store[method], `store.${method}`);
  }
  assertFunction(generateReply, 'generateReply');
  assertFunction(sendText, 'sendText');

  return async function handleInboundMessage(event = {}) {
    assertEvent(event);

    const inbound = await store.saveInbound({
      tenantId: event.tenantId,
      contactKey: event.phone,
      provider: event.provider || 'zapi',
      providerMessageId: event.messageId || null,
      text: event.text,
      receivedAt: event.receivedAt || new Date().toISOString()
    });

    if (inbound.duplicate) {
      logger.info?.('Venda.AI duplicate inbound ignored', {
        tenantId: event.tenantId,
        messageId: event.messageId || null
      });
      return { handled: true, duplicate: true };
    }

    const history = await store.listRecentMessages({
      tenantId: event.tenantId,
      contactKey: event.phone,
      limit: historyLimit
    });

    const ai = await generateReply({
      messages: history,
      env,
      context: {
        tenantId: event.tenantId,
        contactKey: event.phone
      }
    });

    const pending = await store.saveOutboundPending({
      tenantId: event.tenantId,
      contactKey: event.phone,
      provider: event.provider || 'zapi',
      text: ai.text,
      replyToProviderMessageId: event.messageId || null,
      aiResponseId: ai.responseId || null,
      aiModel: ai.model || null
    });

    try {
      const providerResponse = await sendText({
        to: event.phone,
        text: ai.text,
        env
      });

      await store.markOutboundSent({
        tenantId: event.tenantId,
        messageId: pending.id,
        providerResponseId: providerResponse?.messageId || providerResponse?.id || null
      });

      logger.info?.('Venda.AI AI reply sent', {
        tenantId: event.tenantId,
        inboundMessageId: event.messageId || null,
        outboundMessageId: pending.id,
        aiResponseId: ai.responseId || null
      });

      return {
        handled: true,
        duplicate: false,
        replySent: true,
        outboundMessageId: pending.id,
        aiResponseId: ai.responseId || null
      };
    } catch (error) {
      await store.markOutboundFailed({
        tenantId: event.tenantId,
        messageId: pending.id,
        errorCode: error.code || String(error.status || 'send_failed')
      });
      throw error;
    }
  };
}
