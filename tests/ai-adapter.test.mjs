import test from 'node:test';
import assert from 'node:assert/strict';
import { extractOpenAIResponseText, generateOpenAIReply } from '../server/ai/openai.js';

test('extractOpenAIResponseText reads raw Responses API output', () => {
  assert.equal(extractOpenAIResponseText({
    output: [{
      type: 'message',
      content: [{ type: 'output_text', text: '  Olá! Como posso ajudar?  ' }]
    }]
  }), 'Olá! Como posso ajudar?');
});

test('generateOpenAIReply calls Responses API without exposing key in body', async () => {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    return {
      ok: true,
      status: 200,
      async text() {
        return JSON.stringify({
          id: 'resp_test',
          model: 'gpt-5.6-luna',
          output: [{ type: 'message', content: [{ type: 'output_text', text: 'Posso te ajudar.' }] }]
        });
      }
    };
  };

  const result = await generateOpenAIReply({
    messages: [{ role: 'user', text: 'Quero agendar' }],
    fetchImpl,
    env: {
      OPENAI_API_KEY: 'secret-test',
      OPENAI_MODEL: 'gpt-5.6-luna'
    }
  });

  assert.equal(result.text, 'Posso te ajudar.');
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://api.openai.com/v1/responses');
  assert.equal(calls[0].options.headers.Authorization, 'Bearer secret-test');
  assert.equal(calls[0].options.body.includes('secret-test'), false);
});
