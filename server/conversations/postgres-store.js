function assertQuery(query) {
  if (typeof query !== 'function') throw new Error('Postgres conversation store requires query(sql, params)');
}

function requireValue(value, name) {
  if (!value) throw new Error(`Conversation store missing ${name}`);
  return value;
}

export function createPostgresConversationStore({ query } = {}) {
  assertQuery(query);

  async function getOrCreateConversation({ tenantId, contactKey }) {
    requireValue(tenantId, 'tenantId');
    requireValue(contactKey, 'contactKey');

    const result = await query(
      `INSERT INTO conversations (tenant_id, channel, contact_key)
       VALUES ($1, 'whatsapp', $2)
       ON CONFLICT (tenant_id, channel, contact_key)
       DO UPDATE SET updated_at = NOW()
       RETURNING id`,
      [tenantId, contactKey]
    );

    return result.rows[0].id;
  }

  return {
    async saveInbound({ tenantId, contactKey, provider, providerMessageId, text, receivedAt }) {
      const conversationId = await getOrCreateConversation({ tenantId, contactKey });
      const result = await query(
        `INSERT INTO conversation_messages
          (tenant_id, conversation_id, provider, provider_message_id, direction, text, status, received_at)
         VALUES ($1, $2, $3, $4, 'inbound', $5, 'received', $6)
         ON CONFLICT DO NOTHING
         RETURNING id`,
        [tenantId, conversationId, provider, providerMessageId, text, receivedAt]
      );

      if (!result.rows.length) return { duplicate: true, id: null, conversationId };
      return { duplicate: false, id: result.rows[0].id, conversationId };
    },

    async listRecentMessages({ tenantId, contactKey, limit = 20 }) {
      const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
      const result = await query(
        `SELECT m.direction, m.text, m.created_at
           FROM conversation_messages m
           JOIN conversations c ON c.id = m.conversation_id
          WHERE m.tenant_id = $1
            AND c.tenant_id = $1
            AND c.channel = 'whatsapp'
            AND c.contact_key = $2
            AND m.status IN ('received', 'sent')
          ORDER BY m.created_at DESC
          LIMIT $3`,
        [tenantId, contactKey, safeLimit]
      );

      return result.rows
        .slice()
        .reverse()
        .map((row) => ({
          role: row.direction === 'outbound' ? 'assistant' : 'user',
          text: row.text,
          createdAt: row.created_at
        }));
    },

    async saveOutboundPending({
      tenantId,
      contactKey,
      provider,
      text,
      replyToProviderMessageId,
      aiResponseId,
      aiModel
    }) {
      const conversationId = await getOrCreateConversation({ tenantId, contactKey });
      const result = await query(
        `INSERT INTO conversation_messages
          (tenant_id, conversation_id, provider, direction, text, status,
           reply_to_provider_message_id, ai_response_id, ai_model)
         VALUES ($1, $2, $3, 'outbound', $4, 'pending', $5, $6, $7)
         RETURNING id`,
        [tenantId, conversationId, provider, text, replyToProviderMessageId, aiResponseId, aiModel]
      );

      return { id: result.rows[0].id, conversationId };
    },

    async markOutboundSent({ tenantId, messageId, providerResponseId }) {
      await query(
        `UPDATE conversation_messages
            SET status = 'sent', sent_at = NOW(), provider_response_id = $3
          WHERE tenant_id = $1 AND id = $2 AND direction = 'outbound'`,
        [tenantId, messageId, providerResponseId]
      );
    },

    async markOutboundFailed({ tenantId, messageId, errorCode }) {
      await query(
        `UPDATE conversation_messages
            SET status = 'failed', error_code = $3
          WHERE tenant_id = $1 AND id = $2 AND direction = 'outbound'`,
        [tenantId, messageId, errorCode]
      );
    }
  };
}
