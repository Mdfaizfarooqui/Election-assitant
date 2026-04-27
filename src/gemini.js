import { SYSTEM_PROMPT } from './data.js';

const GEMINI_STREAM_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse';
const GEMINI_GENERATE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

/**
 * Sends a conversation to Gemini and streams the assistant reply text.
 * @param {string} apiKey
 * @param {Array<{role:'user'|'model', text:string}>} history
 * @param {string} userMessage
 * @param {object} stageContext - Current stage title and description
 * @param {function(string):void} onChunk - Callback when new text chunk arrives
 * @returns {Promise<string>} Full assembled text
 */
export async function streamMessage(apiKey, history, userMessage, stageContext, onChunk) {
  if (!apiKey) throw new Error('No API key provided. Please enter your Gemini API key in the sidebar.');

  const contextStr = \`[System Context: The user is currently viewing the "\${stageContext.title}" stage. Description: \${stageContext.desc}]\n\n\`;
  const augmentedMessage = history.length === 0 ? (contextStr + userMessage) : userMessage;

  // Build contents array: history + new message
  const contents = [
    ...history.map(({ role, text }) => ({
      role,
      parts: [{ text }],
    })),
    { role: 'user', parts: [{ text: augmentedMessage }] },
  ];

  const body = {
    system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024,
    },
  };

  const response = await fetch(\`\${GEMINI_STREAM_URL}&key=\${apiKey}\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const msg = err?.error?.message || \`HTTP \${response.status}\`;
    throw new Error(msg);
  }

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
        const dataStr = line.slice(6);
        if (dataStr === '[DONE]') continue;
        try {
          const data = JSON.parse(dataStr);
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
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

  return fullText;
}

/**
 * Validates an API key with a lightweight probe request.
 * @param {string} apiKey
 * @returns {Promise<boolean>}
 */
export async function validateApiKey(apiKey) {
  const body = {
    contents: [{ role: 'user', parts: [{ text: 'Hi' }] }],
    generationConfig: { maxOutputTokens: 5 },
  };
  const response = await fetch(\`\${GEMINI_GENERATE_URL}?key=\${apiKey}\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return response.ok;
}
