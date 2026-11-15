import { api } from '../api.js';
import { state } from '../state.js';
import { getCarImage } from '../utils/carImages.js';
import { sendTestDriveReminderWhatsApp } from '../utils/whatsapp.js';
import { showScheduleModal } from './testDrivesModals.js';

export async function renderTestDrives(container) {
  container.innerHTML = '<div class="text-center py-12 text-slate-400"><i class="fa-solid fa-spinner fa-spin text-2xl text-emerald-600"></i><p class="mt-2 text-sm">Loading test drive schedules...</p></div>';
  const res = await api.get('/test-drives');
  const allDrives = res.data || [];
  const canApprove = ['GENERAL_MANAGER', 'SYSTEM_ADMIN'].includes(state.user?.role);

  container.innerHTML = `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Test Drive Fleet Management</h2>
          <p class="text-sm text-slate-500">Demo car availability, fuel optimization & General Manager approval workflow.</p>
        </div>
        <button id="bookTdBtn" class="min-h-[44px] px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold flex items-center justify-center space-x-2 shadow-sm transition">
          <i class="fa-solid fa-calendar-plus"></i>
          <span>Schedule Test Drive</span>
        </button>
      </div>

      <!-- Search Bar -->
      <div class="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
        <div class="relative w-full sm:w-80">
          <i class="fa-solid fa-magnifying-glass absolute left-3 top-3 text-slate-400 text-xs"></i>
          <input type="text" id="tdSearchInput" placeholder="Filter by customer, phone, or demo vehicle..." class="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition">
        </div>
      </div>

      <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div class="table-responsive">
          <table class="w-full text-left text-sm text-slate-700">
            <thead class="text-xs uppercase bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th class="py-3 px-4 font-semibold">Customer</th>
                <th class="py-3 px-4 font-semibold">Demo Vehicle</th>
                <th class="py-3 px-4 font-semibold">Scheduled Slot</th>
                <th class="py-3 px-4 font-semibold">Consultant</th>
                <th class="py-3 px-4 font-semibold">GM Approval</th>
                <th class="py-3 px-4 font-semibold">Status</th>
                <th class="py-3 px-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody id="tdTableBody" class="divide-y divide-slate-100"></tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  function renderRows(drives) {
    const tbody = document.getElementById('tdTableBody');
    if (!tbody) return;
    if (drives.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="py-6 text-center text-slate-400">No test drives found.</td></tr>';
      return;
    }
    tbody.innerHTML = drives.map(td => `
      <tr class="hover:bg-slate-50/80 transition">
        <td class="py-3 px-4 font-semibold text-slate-900">${td.customer_name}<br><span class="text-xs text-slate-500 font-mono">${td.customer_phone}</span></td>
        <td class="py-3 px-4 font-semibold text-slate-900 flex items-center space-x-2.5">
          <img src="${getCarImage(td.vehicle_model)}" alt="${td.vehicle_model || 'Demo'}" class="w-10 h-7 object-cover rounded border border-slate-200">
          <div>
            <p class="font-bold text-slate-900 leading-tight">${td.vehicle_model || 'Demo Car'}</p>
            <p class="text-[11px] font-mono text-slate-400">${td.vehicle_vin || 'Allotted'}</p>
          </div>
        </td>
        <td class="py-3 px-4 text-xs font-mono text-slate-600">${new Date(td.scheduled_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</td>
        <td class="py-3 px-4 text-xs">${td.consultant_name}</td>
        <td class="py-3 px-4">
          ${td.gm_approved ? '<span class="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-semibold inline-flex items-center gap-1"><i class="fa-solid fa-circle-check"></i> Approved</span>' : '<span class="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded inline-flex items-center gap-1"><i class="fa-solid fa-clock"></i> Pending GM</span>'}
        </td>
        <td class="py-3 px-4">
          <span class="px-2.5 py-1 rounded-full text-xs font-semibold ${
            td.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
          }">${td.status}</span>
        </td>
        <td class="py-3 px-4 text-right space-x-1 whitespace-nowrap">
          <button class="whatsapp-td-btn min-h-[32px] px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded border border-emerald-300 transition shadow-2xs" data-json="${encodeURIComponent(JSON.stringify(td))}">
            <i class="fa-brands fa-whatsapp text-emerald-600 mr-1"></i> Remind
          </button>
          ${!td.gm_approved && canApprove ? `
            <button class="approve-btn min-h-[32px] px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded transition shadow-2xs" data-id="${td.id}">
              Approve
            </button>
          ` : ''}
          ${td.status !== 'COMPLETED' ? `
            <button class="complete-btn min-h-[32px] px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium rounded border border-slate-300 transition shadow-2xs" data-id="${td.id}">
              Mark Done
            </button>
          ` : ''}
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.whatsapp-td-btn').forEach(b => {
      b.onclick = () => sendTestDriveReminderWhatsApp(JSON.parse(decodeURIComponent(b.dataset.json)));
    });

    tbody.querySelectorAll('.approve-btn').forEach(b => {
      b.onclick = async () => {
        await api.patch(`/test-drives/${b.dataset.id}/approve`, {});
        renderTestDrives(container);
      };
    });

    tbody.querySelectorAll('.complete-btn').forEach(b => {
      b.onclick = async () => {
        const feedback = prompt('Enter customer test drive feedback:', 'Customer was very satisfied with power and suspension.');
        if (feedback !== null) {
          await api.patch(`/test-drives/${b.dataset.id}/complete`, { customer_feedback: feedback, rating: 5 });
          renderTestDrives(container);
        }
      };
    });
  }

  function filterDrives() {
    const q = (document.getElementById('tdSearchInput')?.value || '').toLowerCase();
    const filtered = allDrives.filter(td => 
      (td.customer_name || '').toLowerCase().includes(q) ||
      (td.customer_phone || '').toLowerCase().includes(q) ||
      (td.vehicle_model || '').toLowerCase().includes(q) ||
      (td.consultant_name || '').toLowerCase().includes(q)
    );
    renderRows(filtered);
  }

  renderRows(allDrives);
  document.getElementById('tdSearchInput')?.addEventListener('input', filterDrives);
  document.getElementById('bookTdBtn')?.addEventListener('click', () => showScheduleModal(() => renderTestDrives(container)));
}