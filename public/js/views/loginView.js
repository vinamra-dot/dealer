import { state, setSession } from '../state.js';

export function renderLoginPage(container, onLoginSuccess) {
  container.innerHTML = `
    <div class="min-h-screen flex items-center justify-center p-4 bg-slate-100">
      <div class="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-8 space-y-6">
        <!-- Logo & Header -->
        <div class="text-center space-y-2">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white font-black text-xl shadow-md shadow-blue-500/30">
            DF
          </div>
          <h2 class="text-2xl font-bold tracking-tight text-slate-900">DealerFlow Enterprise</h2>
          <p class="text-xs text-slate-500">Automobile Operations & Workflow Management SaaS</p>
        </div>

        <!-- Manual Login Form -->
        <form id="loginForm" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Work Email</label>
            <input type="email" id="loginEmail" required class="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="name@apexmotors.com">
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <input type="password" id="loginPassword" required class="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="••••••••">
          </div>
          <button type="submit" class="w-full min-h-[44px] bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition shadow-sm">
            Sign In to Dealership Portal
          </button>
        </form>

        <div class="relative flex py-1 items-center">
          <div class="flex-grow border-t border-slate-200"></div>
          <span class="flex-shrink mx-3 text-[11px] font-semibold uppercase text-slate-400">Or Select Role Persona</span>
          <div class="flex-grow border-t border-slate-200"></div>
        </div>

        <!-- 1-Click Role Persona Grid -->
        <div class="grid grid-cols-2 gap-2 text-xs">
          ${state.roles.map(r => `
            <button type="button" class="persona-btn p-2.5 text-left bg-slate-50 hover:bg-blue-50 hover:border-blue-400 rounded-lg border border-slate-200 transition" data-email="${r.email}">
              <p class="font-bold text-slate-900 truncate">${r.label}</p>
              <p class="text-[10px] text-slate-500 truncate font-mono">${r.role}</p>
            </button>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  async function executeLogin(email, password) {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || 'Authentication failed.');
        return;
      }
      setSession(data.data.token, data.data.user);
      onLoginSuccess();
    } catch (err) {
      alert('Unable to connect to server.');
    }
  }

  document.getElementById('loginForm').onsubmit = (e) => {
    e.preventDefault();
    executeLogin(
      document.getElementById('loginEmail').value,
      document.getElementById('loginPassword').value
    );
  };

  document.querySelectorAll('.persona-btn').forEach(btn => {
    btn.onclick = () => {
      executeLogin(btn.dataset.email, 'Password@123');
    };
  });
}
