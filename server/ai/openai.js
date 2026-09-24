const DEFAULT_BASE_URL = 'https://api.openai.com/v1';
const DEFAULT_MODEL = 'gpt-5.6-luna';
const DEFAULT_MAX_OUTPUT_TOKENS = 500;

const DEFAULT_INSTRUCTIONS = [
  'Você é o funcionário digital de atendimento comercial da empresa cliente do Venda.AI.',
  'Responda em português-BR, de forma breve, clara e útil.',
  'Não invente preços, horários, serviços, políticas, disponibilidade ou condições que não estejam no contexto.',
  'Quando faltar informação, faça a pergunta mínima necessária para continuar o atendimento.',
  'Ajude a compreender a intenção do cliente e identificar oportunidade comercial sem prometer venda, receita ou disponibilidade.'
].join(' ');

function required(value, name) {
  if (!value) throw new Error(`Missing required OpenAI configuration: ${name}`);
  return value;
}

export function getOpenAIConfig(env = process.env) {
  const maxOutputTokens = Number(env.OPENAI_MAX_OUTPUT_TOKENS || DEFAULT_MAX_OUTPUT_TOKENS);

  return {
    apiKey: env.OPENAI_API_KEY,
    baseUrl: env.OPENAI_BASE_URL || DEFAULT_BASE_URL,
    model: env.OPENAI_MODEL || DEFAULT_MODEL,
    maxOutputTokens: Number.isFinite(maxOutputTokens) && maxOutputTokens > 0
      ? maxOutputTokens
      : DEFAULT_MAX_OUTPUT_TOKENS,
    instructions: env.OPENAI_SYSTEM_PROMPT || DEFAULT_INSTRUCTIONS
  };
}

export function extractOpenAIResponseText(payload = {}) {
  if (typeof payload.output_text === 'string' && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  for (const item of payload.output || []) {
    if (item?.type !== 'message') continue;
    for (const part of item.content || []) {
      if (part?.type === 'output_text' && typeof part.text === 'string' && part.text.trim()) {
        return part.text.trim();
      }
    }
  }

  return null;
}

function transcript(messages) {
  return messages
    .filter((message) => message && typeof message.text === 'string' && message.text.trim())
    .map((message) => {
      const speaker = message.role === 'assistant' ? 'ASSISTENTE' : 'CLIENTE';
      return `${speaker}: ${message.text.trim()}`;
    })
    .join('\n');
}

export async function generateOpenAIReply({
  messages,
  fetchImpl = fetch,
  env = process.env,
  instructions
} = {}) {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error('generateOpenAIReply requires a non-empty messages array');
  }

  const config = getOpenAIConfig(env);
  const apiKey = required(config.apiKey, 'OPENAI_API_KEY');
  const input = transcript(messages);

  if (!input) {
    throw new Error('generateOpenAIReply requires at least one text message');
  }

  const response = await fetchImpl(`${config.baseUrl}/responses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: config.model,
      instructions: instructions || config.instructions,
      input,
      max_output_tokens: config.maxOutputTokens
    })
  });

  const raw = await response.text();
  let data;
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    data = { raw };
  }

  if (!response.ok) {
    const error = new Error(`OpenAI request failed with status ${response.status}`);
    error.status = response.status;
    error.response = data;
    throw error;
  }

  const text = extractOpenAIResponseText(data);
  if (!text) {
    const error = new Error('OpenAI response did not contain output text');
    error.code = 'OPENAI_EMPTY_RESPONSE';
    error.response = data;
    throw error;
  }

  return {
    text,
    responseId: data.id || null,
    model: data.model || config.model,
    usage: data.usage || null
  };
}
