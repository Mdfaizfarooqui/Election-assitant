import { SYSTEM_PROMPT } from './data.js';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

/**
 * Sends a conversation to Gemini and returns the assistant reply text.
 * @param {string} apiKey
 * @param {Array<{role:'user'|'model', text:string}>} history
 * @param {string} userMessage
 * @returns {Promise<string>}
 */
export async function sendMessage(apiKey, history, userMessage) {
  if (!apiKey) throw new Error('No API key provided. Please enter your Gemini API key in the sidebar.');

  // Build contents array: system instruction + history + new message
  const contents = [
    ...history.map(({ role, text }) => ({
      role,
      parts: [{ text }],
    })),
    { role: 'user', parts: [{ text: userMessage }] },
  ];

  const body = {
    system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 512,
    },
  };

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const msg = err?.error?.message || `HTTP ${response.status}`;
    throw new Error(msg);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini.');
  return text;
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
  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return response.ok;
}
