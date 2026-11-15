import { api } from '../api.js';
import { showAddLeadModal, showUpdateStageModal, showCsvImportModal } from './leadsModals.js';
import { openWhatsAppChat } from '../utils/whatsapp.js';
import { exportTableToCsv } from '../utils/exportCsv.js';

export async function renderLeads(container) {
  container.innerHTML = '<div class="text-center py-12 text-slate-400"><i class="fa-solid fa-spinner fa-spin text-2xl text-blue-600"></i><p class="mt-2 text-sm">Loading leads...</p></div>';
  const res = await api.get('/leads');
  const allLeads = res.data || [];

  container.innerHTML = `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Lead Pipeline & Intake</h2>
          <p class="text-sm text-slate-500">Capture walk-ins, digital campaigns & OEM DMS auto-sync leads.</p>
        </div>
        <div class="flex items-center gap-2">
          <button id="exportCsvBtn" class="min-h-[44px] px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-sm font-semibold flex items-center space-x-1.5 shadow-2xs transition">
            <i class="fa-solid fa-file-excel text-emerald-600"></i>
            <span>Export (.csv)</span>
          </button>
          <button id="importCsvBtn" class="min-h-[44px] px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-lg text-sm font-semibold flex items-center space-x-1.5 shadow-2xs transition">
            <i class="fa-solid fa-file-csv"></i>
            <span>Import CSV</span>
          </button>
          <button id="addLeadBtn" class="min-h-[44px] px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold flex items-center space-x-2 shadow-sm transition">
            <i class="fa-solid fa-user-plus"></i>
            <span>Capture New Lead</span>
          </button>
        </div>
      </div>

      <!-- Search & Status Filter Bar -->
      <div class="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div class="relative w-full sm:w-80">
          <i class="fa-solid fa-magnifying-glass absolute left-3 top-3 text-slate-400 text-xs"></i>
          <input type="text" id="leadSearchInput" placeholder="Search by customer name, phone, model..." class="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition">
        </div>
        <div class="flex items-center gap-2 w-full sm:w-auto">
          <span class="text-xs font-semibold text-slate-500 whitespace-nowrap">Filter Status:</span>
          <select id="leadStatusSelect" class="w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-500">
            <option value="ALL">All Stages</option>
            <option value="NEW">NEW</option>
            <option value="CONTACTED">CONTACTED</option>
            <option value="TEST_DRIVE_SCHEDULED">TEST DRIVE SCHEDULED</option>
            <option value="QUOTED">QUOTED</option>
            <option value="BOOKED">BOOKED</option>
            <option value="LOST">LOST</option>
          </select>
        </div>
      </div>

      <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div class="table-responsive">
          <table class="w-full text-left text-sm text-slate-700">
            <thead class="text-xs uppercase bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th class="py-3 px-4 font-semibold">Customer</th>
                <th class="py-3 px-4 font-semibold">Contact</th>
                <th class="py-3 px-4 font-semibold">Source</th>
                <th class="py-3 px-4 font-semibold">Interested Model</th>
                <th class="py-3 px-4 font-semibold">Assigned Consultant</th>
                <th class="py-3 px-4 font-semibold">Status</th>
                <th class="py-3 px-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody id="leadsTableBody" class="divide-y divide-slate-100"></tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  function renderTableRows(leads) {
    const tbody = document.getElementById('leadsTableBody');
    if (!tbody) return;
    if (leads.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="py-8 text-center text-slate-400">No matching leads found.</td></tr>';
      return;
    }
    tbody.innerHTML = leads.map(l => `
      <tr class="hover:bg-slate-50/80 transition">
        <td class="py-3 px-4 font-semibold text-slate-900">${l.customer_name}</td>
        <td class="py-3 px-4 text-xs font-mono text-slate-600">${l.phone}<br><span class="text-slate-400">${l.email || ''}</span></td>
        <td class="py-3 px-4"><span class="px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-700 border border-slate-200">${l.source}</span></td>
        <td class="py-3 px-4 font-medium text-slate-900">${l.interested_model || 'Undecided'}</td>
        <td class="py-3 px-4 text-xs">${l.consultant_name || '<span class="text-amber-600 font-medium">Unassigned</span>'}</td>
        <td class="py-3 px-4">
          <span class="px-2.5 py-1 rounded-full text-xs font-semibold ${
            l.status === 'NEW' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
            l.status === 'TEST_DRIVE_SCHEDULED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
            l.status === 'BOOKED' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
            'bg-slate-100 text-slate-700'
          }">${l.status}</span>
        </td>
        <td class="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
          <button class="whatsapp-lead-btn min-h-[32px] px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-xs rounded border border-emerald-300 text-emerald-700 font-semibold transition shadow-2xs" data-phone="${l.phone}" data-name="${l.customer_name}" data-model="${l.interested_model || 'Vehicle'}">
            <i class="fa-brands fa-whatsapp text-emerald-600 mr-1"></i> Chat
          </button>
          <button class="stage-btn min-h-[32px] px-2.5 py-1 bg-white hover:bg-slate-100 text-xs rounded border border-slate-300 text-slate-700 font-medium transition shadow-2xs" data-id="${l.id}" data-status="${l.status}" data-name="${l.customer_name}">
            <i class="fa-solid fa-arrow-right-arrow-left text-[10px] text-blue-600 mr-1"></i> Update Stage
          </button>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.whatsapp-lead-btn').forEach(b => {
      b.onclick = () => {
        const msg = `Hello ${b.dataset.name}, greetings from Apex Mobility Motors! We received your enquiry for the ${b.dataset.model}. When is a good time for a quick call or showroom demo?`;
        openWhatsAppChat(b.dataset.phone, msg);
      };
    });

    tbody.querySelectorAll('.stage-btn').forEach(btn => {
      btn.onclick = () => showUpdateStageModal(btn.dataset.id, btn.dataset.status, btn.dataset.name, () => renderLeads(container));
    });
  }

  function filterAndDisplay() {
    const q = (document.getElementById('leadSearchInput')?.value || '').toLowerCase();
    const st = document.getElementById('leadStatusSelect')?.value || 'ALL';
    const filtered = allLeads.filter(l => {
      const matchQ = (l.customer_name || '').toLowerCase().includes(q) ||
                     (l.phone || '').toLowerCase().includes(q) ||
                     (l.interested_model || '').toLowerCase().includes(q);
      const matchSt = st === 'ALL' || l.status === st;
      return matchQ && matchSt;
    });
    renderTableRows(filtered);
  }

  renderTableRows(allLeads);

  document.getElementById('leadSearchInput')?.addEventListener('input', filterAndDisplay);
  document.getElementById('leadStatusSelect')?.addEventListener('change', filterAndDisplay);
  document.getElementById('addLeadBtn')?.addEventListener('click', () => showAddLeadModal(() => renderLeads(container)));
  document.getElementById('importCsvBtn')?.addEventListener('click', () => showCsvImportModal(() => renderLeads(container)));
  document.getElementById('exportCsvBtn')?.addEventListener('click', () => {
    const headers = ['Customer Name', 'Phone', 'Email', 'Source', 'Interested Model', 'Consultant', 'Status', 'Budget'];
    const rows = allLeads.map(l => [l.customer_name, l.phone, l.email || '', l.source, l.interested_model || '', l.consultant_name || '', l.status, l.budget || '']);
    exportTableToCsv('Lead_Pipeline_Register', headers, rows);
  });
}