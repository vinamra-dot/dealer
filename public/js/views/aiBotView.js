import { api } from '../api.js';

export function renderAiBot(container) {
  container.innerHTML = `
    <div class="max-w-4xl mx-auto space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
            <h2 class="text-2xl font-bold text-slate-900 tracking-tight">AI Dealership Concierge & Inbound Bot</h2>
          </div>
          <p class="text-sm text-slate-500">24/7 automated WhatsApp & web sales assistant for instant pricing, brochures & test drive booking.</p>
        </div>
        <span class="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold self-start sm:self-auto">
          <i class="fa-solid fa-bolt mr-1"></i> LLM Automotive Engine Active
        </span>
      </div>

      <!-- Quick Inquiry Prompt Pills -->
      <div class="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span class="text-slate-400 font-semibold whitespace-nowrap">Suggested Prompts:</span>
        <button class="ai-prompt-btn px-2.5 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 text-slate-700 font-medium rounded-lg border border-slate-200 whitespace-nowrap transition">
          Book Harrier Test Drive tomorrow
        </button>
        <button class="ai-prompt-btn px-2.5 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 text-slate-700 font-medium rounded-lg border border-slate-200 whitespace-nowrap transition">
          What is Nexon EV certified range?
        </button>
        <button class="ai-prompt-btn px-2.5 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 text-slate-700 font-medium rounded-lg border border-slate-200 whitespace-nowrap transition">
          Tata Curvv EV price & delivery
        </button>
      </div>

      <!-- Chat Window Card -->
      <div class="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col h-[520px]">
        <div class="p-3.5 bg-slate-50 border-b border-slate-200 rounded-t-2xl flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              <i class="fa-solid fa-robot"></i>
            </div>
            <div>
              <p class="text-xs font-bold text-slate-900">Apex Motors WhatsApp Assistant</p>
              <p class="text-[10px] text-emerald-600 font-medium">● Online • Instant Reply</p>
            </div>
          </div>
          <span class="text-[11px] font-mono text-slate-400">Meta Cloud API v19.0</span>
        </div>

        <!-- Chat History -->
        <div id="aiChatHistory" class="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
          <div class="flex items-start gap-2.5">
            <div class="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 text-xs font-bold">AI</div>
            <div class="bg-slate-100 text-slate-800 p-3 rounded-2xl rounded-tl-none max-w-md space-y-1 shadow-2xs">
              <p>Hello! Welcome to <strong>Apex Mobility Motors (Mumbai & Pune)</strong>. How may I help you today? You can ask me about on-road pricing, technical specs, or book a doorstep test drive!</p>
            </div>
          </div>
        </div>

        <!-- Input Box -->
        <form id="aiChatForm" class="p-3 bg-white border-t border-slate-200 rounded-b-2xl flex gap-2">
          <input type="text" id="aiUserInput" placeholder="Type your vehicle enquiry (e.g. Book Harrier test drive for Alok Nath)..." class="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500">
          <button type="submit" class="min-h-[40px] px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition">
            <span>Send</span>
            <i class="fa-solid fa-paper-plane text-[10px]"></i>
          </button>
        </form>
      </div>
    </div>
  `;

  const chatContainer = document.getElementById('aiChatHistory');
  const chatForm = document.getElementById('aiChatForm');
  const input = document.getElementById('aiUserInput');

  function appendMessage(sender, text, card = null) {
    const isUser = sender === 'user';
    const div = document.createElement('div');
    div.className = `flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`;
    div.innerHTML = `
      <div class="w-7 h-7 rounded-full ${isUser ? 'bg-slate-800 text-white' : 'bg-blue-100 text-blue-700'} flex items-center justify-center shrink-0 text-xs font-bold">
        ${isUser ? '<i class="fa-solid fa-user"></i>' : 'AI'}
      </div>
      <div class="${isUser ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-100 text-slate-800 rounded-tl-none'} p-3 rounded-2xl max-w-md space-y-2 shadow-2xs">
        <p class="leading-relaxed">${text}</p>
        ${card ? `
          <div class="p-2.5 bg-white text-slate-800 rounded-xl border border-slate-200 space-y-1 font-sans">
            ${card.model ? `<p class="font-bold text-slate-900 text-xs">${card.model}</p>` : ''}
            ${card.range ? `<p class="text-[11px] text-slate-600">⚡ Range: <strong>${card.range}</strong></p>` : ''}
            ${card.price ? `<p class="text-[11px] text-emerald-700 font-bold">💰 Price: ${card.price}</p>` : ''}
            ${card.consultant ? `<p class="text-[11px] text-blue-700 font-semibold"><i class="fa-solid fa-user-check mr-1"></i> Assigned: ${card.consultant}</p>` : ''}
          </div>
        ` : ''}
      </div>
    `;
    chatContainer.appendChild(div);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  async function handleSend(text) {
    if (!text.trim()) return;
    appendMessage('user', text);
    input.value = '';

    const typingDiv = document.createElement('div');
    typingDiv.id = 'aiTyping';
    typingDiv.className = 'text-[11px] text-slate-400 flex items-center gap-1.5 ml-9';
    typingDiv.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin text-blue-600"></i> AI is typing response...';
    chatContainer.appendChild(typingDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    try {
      const res = await api.post('/bot/chat', { message: text });
      typingDiv.remove();
      appendMessage('ai', res.data.reply, res.data.card);
    } catch (err) {
      typingDiv.remove();
      appendMessage('ai', 'Error processing enquiry: ' + err.message);
    }
  }

  chatForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    handleSend(input.value);
  });

  document.querySelectorAll('.ai-prompt-btn').forEach(b => {
    b.onclick = () => handleSend(b.textContent.trim());
  });
}
