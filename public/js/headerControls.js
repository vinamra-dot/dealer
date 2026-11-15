import { state, setSession } from './state.js';
import { api } from './api.js';

export function setupHeaderControls(onRefreshView, onSwitchView) {
  setupBranchSwitcher(onRefreshView);
  setupNotificationBell(onSwitchView);
  setupRoleSwitcher(onRefreshView);
}

function setupBranchSwitcher(onRefreshView) {
  const branchSelect = document.getElementById('branchSelector');
  if (!branchSelect) return;

  branchSelect.value = state.user?.dealership_id || 'dealership-apex-01';
  branchSelect.onchange = (e) => {
    if (state.user) {
      state.user.dealership_id = e.target.value;
      localStorage.setItem('df_user', JSON.stringify(state.user));
    }
    onRefreshView();
  };
}

function setupNotificationBell(onSwitchView) {
  const btn = document.getElementById('notifBellBtn');
  const dropdown = document.getElementById('notifDropdown');
  const badge = document.getElementById('notifBadge');
  const countText = document.getElementById('notifCountText');
  const list = document.getElementById('notifList');

  async function fetchNotifs() {
    if (!state.token) return;
    try {
      const res = await api.get('/notifications');
      const notifs = res.data || [];
      const count = notifs.length;

      if (count > 0) {
        badge.classList.remove('hidden');
        badge.textContent = count;
        countText.textContent = `${count} High Priority`;
        list.innerHTML = notifs.map(n => `
          <div class="p-2 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 cursor-pointer transition notif-item" data-tab="${n.tab}">
            <p class="font-bold text-slate-900">${n.title}</p>
            <p class="text-[11px] text-slate-600 mt-0.5">${n.message}</p>
          </div>
        `).join('');

        list.querySelectorAll('.notif-item').forEach(item => {
          item.onclick = () => {
            dropdown.classList.add('hidden');
            onSwitchView(item.dataset.tab);
          };
        });
      } else {
        badge.classList.add('hidden');
        countText.textContent = 'All clear';
        list.innerHTML = '<p class="text-center py-3 text-slate-400">No active alerts.</p>';
      }
    } catch {
      // Quiet background polling
    }
  }

  btn?.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown?.classList.toggle('hidden');
  });

  document.addEventListener('click', (e) => {
    if (!dropdown?.contains(e.target) && !btn?.contains(e.target)) {
      dropdown?.classList.add('hidden');
    }
  });

  fetchNotifs();
  // 30s background live polling
  setInterval(fetchNotifs, 30000);
}

function setupRoleSwitcher(onRefreshView) {
  const btn = document.getElementById('roleSwitchBtn');
  const modal = document.getElementById('appModal');
  const content = document.getElementById('modalContent');

  btn?.addEventListener('click', () => {
    content.innerHTML = `
      <div class="flex items-center justify-between pb-3 border-b border-slate-200">
        <div>
          <h3 class="text-base font-bold text-slate-900">Switch Role Persona</h3>
          <p class="text-xs text-slate-500">Test data isolation across different roles</p>
        </div>
        <button id="closeModal" class="text-slate-400 hover:text-slate-600 p-2"><i class="fa-solid fa-xmark text-lg"></i></button>
      </div>
      <div class="grid grid-cols-2 gap-2 pt-2">
        ${state.roles.map(r => `
          <button class="role-select-btn p-3 text-left bg-slate-50 hover:bg-blue-50 hover:border-blue-400 rounded-xl border border-slate-200 transition" data-email="${r.email}">
            <span class="text-xs font-bold text-slate-900 block">${r.label}</span>
            <span class="text-[10px] text-slate-500 font-mono">${r.role}</span>
          </button>
        `).join('')}
      </div>
    `;

    modal.classList.remove('hidden');
    document.getElementById('closeModal').onclick = () => modal.classList.add('hidden');

    document.querySelectorAll('.role-select-btn').forEach(b => {
      b.onclick = async () => {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: b.dataset.email, password: 'Password@123' })
        });
        const data = await res.json();
        if (data.success) {
          setSession(data.data.token, data.data.user);
          modal.classList.add('hidden');
          window.location.reload();
        }
      };
    });
  });
}
