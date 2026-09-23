CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  channel TEXT NOT NULL,
  contact_key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, channel, contact_key)
);

CREATE INDEX IF NOT EXISTS idx_conversations_tenant_updated
  ON conversations (tenant_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS conversation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  provider_message_id TEXT,
  provider_response_id TEXT,
  reply_to_provider_message_id TEXT,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  text TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('received', 'pending', 'sent', 'failed')),
  ai_response_id TEXT,
  ai_model TEXT,
  error_code TEXT,
  received_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_conversation_messages_provider_id
  ON conversation_messages (tenant_id, provider, provider_message_id)
  WHERE provider_message_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_conversation_messages_tenant_conversation_created
  ON conversation_messages (tenant_id, conversation_id, created_at DESC);
