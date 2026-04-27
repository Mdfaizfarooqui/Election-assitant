import { SYSTEM_PROMPT } from './data.js';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Sends a conversation to OpenAI and streams the assistant reply text.
 * Implements a key rotation system: if a key hits a 429 Rate Limit, it automatically falls back to the next key.
 * 
 * @param {string} apiKeysStr - Comma separated list of API keys
 * @param {Array<{role:'user'|'model', text:string}>} history
 * @param {string} userMessage
 * @param {object} stageContext - Current stage title and description
 * @param {function(string):void} onChunk - Callback when new text chunk arrives
 * @returns {Promise<string>} Full assembled text
 */
export async function streamMessage(apiKeysStr, history, userMessage, stageContext, onChunk) {
  const keys = apiKeysStr.split(',').map(k => k.trim()).filter(Boolean);
  if (keys.length === 0) throw new Error('No API key provided. Please enter your OpenAI API key in the sidebar or .env file.');

  const contextStr = `[System Context: The user is currently viewing the "${stageContext.title}" stage. Description: ${stageContext.desc}]\n\n`;
  const augmentedMessage = history.length === 0 ? (contextStr + userMessage) : userMessage;

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.map(({ role, text }) => ({
      role: role === 'model' ? 'assistant' : 'user',
      content: text,
    })),
    { role: 'user', content: augmentedMessage },
  ];

  const body = {
    model: 'gpt-3.5-turbo',
    messages,
    temperature: 0.7,
    max_tokens: 1024,
    stream: true,
  };

  let lastError = new Error('Failed to connect to OpenAI API');

  for (const apiKey of keys) {
    try {
      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        if (response.status === 429) {
          console.warn(`Key ${apiKey.slice(0, 8)}... hit rate limit, trying next key...`);
          lastError = new Error(`Rate limit exceeded for key ending in ${apiKey.slice(-4)}`);
          continue; // Try next key
        }
        const err = await response.json().catch(() => ({}));
        const msg = err?.error?.message || `HTTP ${response.status}`;
        throw new Error(msg);
      }

      // Success! Read the stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let fullText = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (dataStr === '[DONE]') continue;
            try {
              const data = JSON.parse(dataStr);
              const text = data?.choices?.[0]?.delta?.content;
              if (text) {
                fullText += text;
                onChunk(fullText);
              }
            } catch (e) {
              // Ignore parsing errors for partial chunks
            }
          }
        }
      }

      return fullText; // Return successfully, breaking out of the rotation loop
    } catch (e) {
      lastError = e;
      // For network errors or 429s, loop continues and tries the next key
    }
  }

  // If we exhaust all keys, throw the last error encountered
  throw lastError;
}

/**
 * Validates a single API key from the sidebar.
 * @param {string} apiKey
 * @returns {Promise<boolean>}
 */
export async function validateApiKey(apiKey) {
  const body = {
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: 'Hi' }],
    max_tokens: 5,
  };
  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });
  return response.ok;
}
