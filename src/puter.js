import { puter } from '@heyputer/puter.js';
import { SYSTEM_PROMPT } from './data.js';

/**
 * Sends a conversation to Puter.js and streams the assistant reply text.
 * Requires NO API KEYS!
 * 
 * @param {Array<{role:'user'|'model', text:string}>} history
 * @param {string} userMessage
 * @param {object} stageContext - Current stage title and description
 * @param {function(string):void} onChunk - Callback when new text chunk arrives
 * @returns {Promise<string>} Full assembled text
 */
export async function streamMessage(history, userMessage, stageContext, onChunk) {
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

  let fullText = '';

  try {
    const response = await puter.ai.chat(messages, { stream: true });
    
    // Puter's stream returns an async iterator
    for await (const chunk of response) {
      if (chunk?.text) {
        fullText += chunk.text;
        onChunk(fullText);
      }
    }
  } catch (err) {
    throw new Error('Puter AI request failed: ' + err.message);
  }

  return fullText;
}
