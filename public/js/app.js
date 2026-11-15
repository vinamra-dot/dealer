import { state, clearSession } from './state.js';
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
import { renderTeam } from './views/teamView.js';
import { renderKyc } from './views/kycView.js';
import { renderLoanComparator } from './views/loanComparatorView.js';
import { renderWorkshop } from './views/workshopView.js';
import { renderParts } from './views/partsView.js';
import { renderRetention } from './views/retentionView.js';
import { renderLedger } from './views/ledgerView.js';
import { renderTracking } from './views/trackingView.js';
import { renderIntegrations } from './views/integrationsView.js';
import { renderAiBot } from './views/aiBotView.js';
import { renderTransportGps } from './views/transportGpsView.js';
import { renderAuctions } from './views/auctionView.js';
import { renderBodyShop } from './views/bodyShopView.js';
import { renderHsrpFastag } from './views/hsrpFastagView.js';
import { setupHeaderControls } from './headerControls.js';

const viewMap = {
  dashboard: renderDashboard,
  leads: renderLeads,
  testDrives: renderTestDrives,
  quotes: renderQuotes,
  bookings: renderBookings,
  loanComparator: renderLoanComparator,
  kyc: renderKyc,
  exchange: renderExchange,
  auctions: renderAuctions,
  finance: renderFinance,
  ledger: renderLedger,
  stockyard: renderStockyard,
  transport: renderTransportGps,
  deliveryProtocol: renderDeliveryProtocol,
  claims: renderClaims,
  workshop: renderWorkshop,
  bodyshop: renderBodyShop,
  parts: renderParts,
  compliance: renderHsrpFastag,
  retention: renderRetention,
  aibot: renderAiBot,
  tracking: renderTracking,
  integrations: renderIntegrations,
  salesTargets: renderSalesTargets,
  team: renderTeam
};

const rolePermissions = {
  SYSTEM_ADMIN: ['dashboard', 'leads', 'testDrives', 'quotes', 'bookings', 'loanComparator', 'kyc', 'exchange', 'auctions', 'finance', 'ledger', 'stockyard', 'transport', 'deliveryProtocol', 'claims', 'workshop', 'bodyshop', 'parts', 'compliance', 'retention', 'aibot', 'tracking', 'integrations', 'salesTargets', 'team'],
  GENERAL_MANAGER: ['dashboard', 'leads', 'testDrives', 'quotes', 'bookings', 'loanComparator', 'kyc', 'exchange', 'auctions', 'finance', 'ledger', 'stockyard', 'transport', 'deliveryProtocol', 'claims', 'workshop', 'bodyshop', 'parts', 'compliance', 'retention', 'aibot', 'tracking', 'integrations', 'salesTargets', 'team'],
  SALES_MANAGER: ['dashboard', 'leads', 'testDrives', 'quotes', 'bookings', 'loanComparator', 'kyc', 'exchange', 'auctions', 'ledger', 'retention', 'aibot', 'tracking', 'salesTargets'],
  SALES_CONSULTANT: ['leads', 'testDrives', 'quotes', 'bookings', 'loanComparator', 'kyc', 'exchange', 'auctions', 'retention', 'aibot', 'tracking', 'salesTargets'],
  TELECALLER: ['leads', 'retention', 'aibot', 'tracking'],
  FINANCE_HEAD: ['bookings', 'finance', 'ledger', 'loanComparator', 'kyc', 'exchange', 'compliance', 'claims', 'tracking'],
  LOGISTICS_PDI: ['stockyard', 'transport', 'bookings', 'deliveryProtocol', 'workshop', 'parts', 'compliance', 'tracking'],
  DRIVER: ['stockyard', 'transport', 'workshop', 'tracking']
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
  setupHeaderControls(
    () => switchView(state.currentTab),
    (tab) => switchView(tab)
  );
  setupLogout();
  document.getElementById('headerTrackBtn')?.addEventListener('click', () => switchView('tracking'));

  const allowed = rolePermissions[state.user?.role] || ['leads'];
  const initialTab = allowed.includes(state.currentTab) ? state.currentTab : allowed[0];
  switchView(initialTab);
}

function updateHeaderUI() {
  if (state.user) {
    document.getElementById('userNameDisplay').textContent = state.user.name;
    document.getElementById('userRoleBadge').textContent = state.user.role;
    if (state.user.dealership_name) {
      document.getElementById('headerDealership').textContent = `${state.user.dealership_name} • Mumbai & Pune, MH`;
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

function setupLogout() {
  document.getElementById('logoutBtn')?.addEventListener('click', () => {
    clearSession();
    init();
  });
}

document.addEventListener('DOMContentLoaded', init);