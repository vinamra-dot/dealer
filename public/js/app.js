import { state, clearSession, setSession } from './state.js';
import { renderLoginPage } from './views/loginView.js';
import { renderDashboard } from './views/dashboardView.js';
import { renderLeads } from './views/leadsView.js';
import { renderTestDrives } from './views/testDrivesView.js';
import { renderQuotes } from './views/quotesView.js';
import { renderBookings } from './views/bookingsView.js';
import { renderFinance } from './views/financeView.js';
import { renderStockyard } from './views/stockyardView.js';
import { renderClaims } from './views/claimsView.js';
import { renderExchange } from './views/exchangeView.js';
import { renderDeliveryProtocol } from './views/deliveryProtocolView.js';
import { renderSalesTargets } from './views/salesTargetsView.js';

const viewMap = {
  dashboard: renderDashboard,
  leads: renderLeads,
  testDrives: renderTestDrives,
  quotes: renderQuotes,
  bookings: renderBookings,
  finance: renderFinance,
  stockyard: renderStockyard,
  claims: renderClaims,
  exchange: renderExchange,
  deliveryProtocol: renderDeliveryProtocol,
  salesTargets: renderSalesTargets
};

const rolePermissions = {
  SYSTEM_ADMIN: ['dashboard', 'leads', 'testDrives', 'quotes', 'bookings', 'exchange', 'finance', 'stockyard', 'deliveryProtocol', 'claims', 'salesTargets'],
  GENERAL_MANAGER: ['dashboard', 'leads', 'testDrives', 'quotes', 'bookings', 'exchange', 'finance', 'stockyard', 'deliveryProtocol', 'claims', 'salesTargets'],
  SALES_MANAGER: ['dashboard', 'leads', 'testDrives', 'quotes', 'bookings', 'exchange', 'salesTargets'],
  SALES_CONSULTANT: ['leads', 'testDrives', 'quotes', 'bookings', 'exchange', 'salesTargets'],
  TELECALLER: ['leads'],
  FINANCE_HEAD: ['bookings', 'finance', 'exchange', 'claims'],
  LOGISTICS_PDI: ['stockyard', 'bookings', 'deliveryProtocol'],
  DRIVER: ['stockyard']
};

function init() {
  if (!state.token || !state.user) {
    document.getElementById('appShell').classList.add('hidden');
    renderLoginPage(document.getElementById('loginContainer'), () => {
      document.getElementById('loginContainer').innerHTML = '';
      document.getElementById('appShell').classList.remove('hidden');
      setupApp();
    });
    return;
  }
  document.getElementById('appShell').classList.remove('hidden');
  setupApp();
}

function setupApp() {
  updateHeaderUI();
  filterNavigationByRole();
  setupMobileDrawer();
  setupRoleSwitcher();
  setupLogout();

  const allowed = rolePermissions[state.user?.role] || ['leads'];
  const initialTab = allowed.includes(state.currentTab) ? state.currentTab : allowed[0];
  switchView(initialTab);
}

function updateHeaderUI() {
  if (state.user) {
    document.getElementById('userNameDisplay').textContent = state.user.name;
    document.getElementById('userRoleBadge').textContent = state.user.role;
    if (state.user.dealership_name) {
      document.getElementById('headerDealership').textContent = `${state.user.dealership_name} • Jaipur`;
    }
  }
}

function filterNavigationByRole() {
  const allowed = rolePermissions[state.user?.role] || ['leads'];
  document.querySelectorAll('.nav-tab').forEach(tab => {
    const isAllowed = allowed.includes(tab.dataset.tab);
    tab.style.display = isAllowed ? 'flex' : 'none';
    tab.onclick = () => switchView(tab.dataset.tab);
  });
}

function switchView(tabKey) {
  state.currentTab = tabKey;
  const container = document.getElementById('viewContainer');
  document.querySelectorAll('.nav-tab').forEach(b => {
    b.classList.toggle('active-tab', b.dataset.tab === tabKey);
  });

  document.getElementById('sidebarNav')?.classList.add('-translate-x-full');
  document.getElementById('sidebarBackdrop')?.classList.add('hidden');

  const renderFn = viewMap[tabKey] || renderDashboard;
  renderFn(container);
}

function setupMobileDrawer() {
  const menuBtn = document.getElementById('mobileMenuBtn');
  const sidebar = document.getElementById('sidebarNav');
  const backdrop = document.getElementById('sidebarBackdrop');

  menuBtn?.addEventListener('click', () => {
    sidebar.classList.toggle('-translate-x-full');
    backdrop.classList.toggle('hidden');
  });

  backdrop?.addEventListener('click', () => {
    sidebar.classList.add('-translate-x-full');
    backdrop.classList.add('hidden');
  });
}

function setupRoleSwitcher() {
  const btn = document.getElementById('roleSwitchBtn');
  const modal = document.getElementById('appModal');
  const content = document.getElementById('modalContent');

  btn?.addEventListener('click', () => {
    content.innerHTML = `
      <div class="flex items-center justify-between pb-3 border-b border-slate-200">
        <div>
          <h3 class="text-lg font-bold text-slate-900">Switch Role Persona</h3>
          <p class="text-xs text-slate-500">Test data isolation across different roles</p>
        </div>
        <button id="closeModal" class="text-slate-400 hover:text-slate-600 p-2"><i class="fa-solid fa-xmark text-lg"></i></button>
      </div>
      <div class="grid grid-cols-2 gap-2 pt-2">
        ${state.roles.map(r => `
          <button class="role-select-btn p-3 text-left bg-slate-50 hover:bg-blue-50 hover:border-blue-400 rounded-xl border border-slate-200 transition" data-email="${r.email}">
            <span class="text-sm font-semibold text-slate-900 block">${r.label}</span>
            <span class="text-xs text-slate-500 font-mono">${r.role}</span>
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
          setupApp();
        }
      };
    });
  });
}

function setupLogout() {
  document.getElementById('logoutBtn')?.addEventListener('click', () => {
    clearSession();
    init();
  });
}

document.addEventListener('DOMContentLoaded', init);
