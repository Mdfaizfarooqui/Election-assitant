import './style.css';
import { stages } from './data.js';
import { streamMessage, validateApiKey } from './gemini.js';

// ===== STATE =====
let apiKey = localStorage.getItem('electiq_api_key') || '';
let currentStage = 0;
let chatHistory = []; // [{role, text}]
let isLoading = false;

// ===== DOM REFS =====
const $ = id => document.getElementById(id);
const chatMessages   = $('chat-messages');
const chatInput      = $('chat-input');
const sendBtn        = $('send-btn');
const typingIndicator= $('typing-indicator');
const apiKeyInput    = $('api-key-input');
const saveApiKeyBtn  = $('save-api-key');
const apiStatus      = $('api-status');
const quickGrid      = $('quick-prompt-grid');
const stageIcon      = $('stage-icon');
const stageTitle     = $('stage-title');
const stageDesc      = $('stage-desc');
const stagePrgLabel  = $('stage-progress-label');
const stagePrgFill   = $('stage-progress-fill');
const clearChatBtn   = $('clear-chat');
const sidebarToggle  = $('sidebar-toggle');
const sidebar        = document.querySelector('.sidebar');
const timelineItems  = document.querySelectorAll('.timeline-item');

// ===== INIT =====
function init() {
  if (apiKey) apiKeyInput.value = apiKey;
  renderStage(0);
  renderWelcomeMessage();
  bindEvents();
}

// ===== STAGE RENDERING =====
function renderStage(idx) {
  currentStage = idx;
  const s = stages[idx];

  stageIcon.textContent = s.icon;
  stageTitle.textContent = s.title;
  stageDesc.textContent = s.desc;

  const pct = Math.round(((idx + 1) / stages.length) * 100);
  stagePrgLabel.textContent = `Stage ${idx + 1} of ${stages.length}`;
  stagePrgFill.style.width = `${pct}%`;
  stagePrgFill.parentElement.setAttribute('aria-valuenow', pct);

  // Timeline highlighting
  timelineItems.forEach((el, i) => {
    el.classList.remove('active', 'completed');
    el.setAttribute('aria-selected', 'false');
    if (i < idx) el.classList.add('completed');
    if (i === idx) { el.classList.add('active'); el.setAttribute('aria-selected', 'true'); }
  });

  renderQuickPrompts(s.prompts);
}

// ===== QUICK PROMPTS =====
function renderQuickPrompts(prompts) {
  quickGrid.innerHTML = '';
  prompts.forEach(p => {
    const btn = document.createElement('button');
    btn.className = 'quick-prompt-btn';
    btn.textContent = p;
    btn.setAttribute('role', 'listitem');
    btn.addEventListener('click', () => submitMessage(p));
    quickGrid.appendChild(btn);
  });
}

// ===== CHAT RENDERING =====
function renderWelcomeMessage() {
  const div = document.createElement('div');
  div.className = 'message assistant';
  div.innerHTML = `
    <div class="message-avatar" aria-hidden="true">⚖️</div>
    <div class="message-body">
      <div class="welcome-card">
        <h3>Welcome to ElectIQ! 🗳️</h3>
        <p>I'm your AI-powered guide to understanding the <strong>democratic election process</strong> — from registering to vote all the way to inauguration day.</p>
        <p>Click any stage in the sidebar to jump to that part of the journey, use the quick prompts above, or just ask me anything!</p>
        <p><em>Tip: Enter your Gemini API key in the sidebar to enable AI-powered answers.</em></p>
      </div>
      <div class="message-time">${getTime()}</div>
    </div>`;
  chatMessages.appendChild(div);
}

function appendMessage(role, text) {
  const div = document.createElement('div');
  div.className = `message ${role}`;

  const avatar = role === 'assistant' ? '⚖️' : '👤';
  const bubble = role === 'assistant' ? formatMarkdown(text) : escapeHtml(text);

  div.innerHTML = `
    <div class="message-avatar" aria-hidden="true">${avatar}</div>
    <div class="message-body">
      <div class="message-bubble">${bubble}</div>
      <div class="message-time">${getTime()}</div>
      <div class="suggestions-container" style="margin-top: 8px; display: flex; gap: 8px; flex-wrap: wrap;"></div>
    </div>`;

  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return {
    bubble: div.querySelector('.message-bubble'),
    suggestions: div.querySelector('.suggestions-container')
  };
}

function appendErrorMessage(text) {
  const div = document.createElement('div');
  div.className = 'message assistant';
  div.innerHTML = `
    <div class="message-avatar" aria-hidden="true">⚠️</div>
    <div class="message-body">
      <div class="message-bubble" style="border-color:rgba(248,113,113,0.3);background:rgba(248,113,113,0.05);">
        <p style="color:#f87171;">⚠️ ${escapeHtml(text)}</p>
      </div>
      <div class="message-time">${getTime()}</div>
    </div>`;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ===== MESSAGE SUBMIT =====
async function submitMessage(text) {
  const msg = (text || chatInput.value).trim();
  if (!msg || isLoading) return;

  chatInput.value = '';
  autoResizeTextarea();
  appendMessage('user', msg);

  isLoading = true;
  sendBtn.disabled = true;
  typingIndicator.hidden = false;
  chatMessages.scrollTop = chatMessages.scrollHeight;

  try {
    const stageContext = {
      title: stages[currentStage].title,
      desc: stages[currentStage].desc
    };

    // Create empty assistant message bubble for streaming
    typingIndicator.hidden = true;
    const { bubble, suggestions } = appendMessage('assistant', '');

    const reply = await streamMessage(apiKey, chatHistory, msg, stageContext, (chunk) => {
      const parts = chunk.split('===SUGGESTIONS===');
      bubble.innerHTML = formatMarkdown(parts[0].trim());
      chatMessages.scrollTop = chatMessages.scrollHeight;
    });

    chatHistory.push({ role: 'user', text: msg });
    chatHistory.push({ role: 'model', text: reply });
    
    // Parse suggestions
    const parts = reply.split('===SUGGESTIONS===');
    if (parts.length > 1) {
      try {
        const suggs = JSON.parse(parts[1].trim());
        suggs.forEach(s => {
          const btn = document.createElement('button');
          btn.className = 'quick-prompt-btn suggestion-chip';
          btn.textContent = s;
          btn.onclick = () => submitMessage(s);
          suggestions.appendChild(btn);
        });
        chatMessages.scrollTop = chatMessages.scrollHeight;
      } catch(e) {
        // Failed to parse suggestions json
      }
    }
  } catch (err) {
    typingIndicator.hidden = true;
    appendErrorMessage(err.message || 'Something went wrong. Please try again.');
  } finally {
    isLoading = false;
    sendBtn.disabled = !chatInput.value.trim();
  }
}

// ===== API KEY =====
async function handleSaveApiKey() {
  const key = apiKeyInput.value.trim();
  if (!key) {
    setApiStatus('Please enter an API key.', 'error');
    return;
  }

  saveApiKeyBtn.textContent = 'Checking…';
  saveApiKeyBtn.disabled = true;
  setApiStatus('', '');

  try {
    const valid = await validateApiKey(key);
    if (valid) {
      apiKey = key;
      localStorage.setItem('electiq_api_key', key);
      setApiStatus('✓ API key saved!', 'success');
    } else {
      setApiStatus('✗ Invalid API key. Please try again.', 'error');
    }
  } catch {
    setApiStatus('✗ Could not verify key. Check your connection.', 'error');
  } finally {
    saveApiKeyBtn.textContent = 'Save';
    saveApiKeyBtn.disabled = false;
  }
}

function setApiStatus(msg, type) {
  apiStatus.textContent = msg;
  apiStatus.className = `api-status${type ? ' ' + type : ''}`;
}

// ===== HELPERS =====
function formatMarkdown(text) {
  return text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code style="background:rgba(255,255,255,0.08);padding:1px 5px;border-radius:4px;font-size:12px">$1</code>')
    .replace(/^### (.+)$/gm, '<h4 style="font-size:14px;font-weight:700;margin:12px 0 6px;color:var(--accent-cyan)">$1</h4>')
    .replace(/^## (.+)$/gm, '<h3 style="font-size:15px;font-weight:700;margin:12px 0 6px">$1</h3>')
    .replace(/^\d+\.\s(.+)$/gm, '<li>$1</li>')
    .replace(/^[-*]\s(.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, m => `<ul>${m}</ul>`)
    .replace(/\n{2,}/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/^(?!<[hup])(.+)$/gm, '<p>$1</p>')
    .replace(/<p><\/p>/g, '');
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function getTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function autoResizeTextarea() {
  chatInput.style.height = 'auto';
  chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
}

// ===== EVENT BINDING =====
function bindEvents() {
  // Send button / Enter key
  sendBtn.addEventListener('click', () => submitMessage());

  chatInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitMessage();
    }
  });

  chatInput.addEventListener('input', () => {
    autoResizeTextarea();
    sendBtn.disabled = !chatInput.value.trim();
  });

  // API key
  saveApiKeyBtn.addEventListener('click', handleSaveApiKey);
  apiKeyInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') handleSaveApiKey();
  });

  // Timeline navigation
  timelineItems.forEach(el => {
    el.addEventListener('click', () => {
      const idx = parseInt(el.dataset.stage, 10);
      renderStage(idx);
      // On mobile, close sidebar after selection
      if (window.innerWidth <= 768) sidebar.classList.remove('open');
    });
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        el.click();
      }
    });
  });

  // Clear chat
  clearChatBtn.addEventListener('click', () => {
    chatHistory = [];
    chatMessages.innerHTML = '';
    renderWelcomeMessage();
  });

  // Mobile sidebar toggle
  sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });

  // Close sidebar when clicking outside on mobile
  document.addEventListener('click', e => {
    if (window.innerWidth <= 768
      && !sidebar.contains(e.target)
      && !sidebarToggle.contains(e.target)) {
      sidebar.classList.remove('open');
    }
  });
}

// ===== START =====
init();
