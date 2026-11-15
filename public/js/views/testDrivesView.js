import { api } from '../api.js';
import { state } from '../state.js';

export async function renderTestDrives(container) {
  container.innerHTML = '<div class="text-center py-12 text-slate-400"><i class="fa-solid fa-spinner fa-spin text-2xl text-emerald-600"></i><p class="mt-2 text-sm">Loading test drive schedules...</p></div>';
  const res = await api.get('/test-drives');
  const drives = res.data || [];
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
            <tbody class="divide-y divide-slate-100">
              ${drives.length === 0 ? '<tr><td colspan="7" class="py-6 text-center text-slate-400">No test drives scheduled.</td></tr>' : ''}
              ${drives.map(td => `
                <tr class="hover:bg-slate-50/80 transition">
                  <td class="py-3 px-4 font-semibold text-slate-900">${td.customer_name}<br><span class="text-xs text-slate-500 font-mono">${td.customer_phone}</span></td>
                  <td class="py-3 px-4 font-medium text-slate-900">${td.vehicle_model || 'Demo Line'}<br><span class="text-xs text-slate-400">${td.vehicle_vin || ''}</span></td>
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
                  <td class="py-3 px-4 text-right space-x-1.5">
                    ${!td.gm_approved && canApprove ? `
                      <button class="approve-btn min-h-[36px] px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded transition shadow-2xs" data-id="${td.id}">
                        Approve
                      </button>
                    ` : ''}
                    ${td.status !== 'COMPLETED' ? `
                      <button class="complete-btn min-h-[36px] px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium rounded border border-slate-300 transition shadow-2xs" data-id="${td.id}">
                        Mark Done
                      </button>
                    ` : ''}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  document.querySelectorAll('.approve-btn').forEach(b => {
    b.onclick = async () => {
      await api.patch(`/test-drives/${b.dataset.id}/approve`, {});
      renderTestDrives(container);
    };
  });

  document.querySelectorAll('.complete-btn').forEach(b => {
    b.onclick = async () => {
      const feedback = prompt('Enter customer test drive feedback:', 'Customer was very satisfied with power and suspension.');
      if (feedback !== null) {
        await api.patch(`/test-drives/${b.dataset.id}/complete`, { customer_feedback: feedback, rating: 5 });
        renderTestDrives(container);
      }
    };
  });

  document.getElementById('bookTdBtn')?.addEventListener('click', () => showScheduleModal());
}

async function showScheduleModal() {
  const modal = document.getElementById('appModal');
  const content = document.getElementById('modalContent');
  const leadsRes = await api.get('/leads');
  const leads = leadsRes.data || [];

  content.innerHTML = `
    <div class="flex items-center justify-between pb-3 border-b border-slate-200">
      <h3 class="text-lg font-bold text-slate-900">Schedule Demo Test Drive</h3>
      <button id="closeModal" class="text-slate-400 hover:text-slate-600 p-2"><i class="fa-solid fa-xmark text-lg"></i></button>
    </div>
    <form id="tdForm" class="space-y-4">
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Select Customer Lead *</label>
        <select id="tdLead" required class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-emerald-500">
          ${leads.map(l => `<option value="${l.id}">${l.customer_name} (${l.interested_model || 'No model'}) - ${l.phone}</option>`).join('')}
        </select>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Date & Time *</label>
          <input type="datetime-local" id="tdTime" required class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-emerald-500">
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Route / Fuel Plan</label>
          <input type="text" id="tdRoute" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-emerald-500" placeholder="e.g. Highway bypass loop">
        </div>
      </div>
      <button type="submit" class="w-full min-h-[44px] bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-sm transition shadow-sm">Schedule Test Drive</button>
    </form>
  `;

  modal.classList.remove('hidden');
  document.getElementById('closeModal').onclick = () => modal.classList.add('hidden');

  document.getElementById('tdForm').onsubmit = async (e) => {
    e.preventDefault();
    await api.post('/test-drives/schedule', {
      lead_id: document.getElementById('tdLead').value,
      scheduled_at: new Date(document.getElementById('tdTime').value).toISOString(),
      route_notes: document.getElementById('tdRoute').value
    });
    modal.classList.add('hidden');
    renderTestDrives(document.getElementById('viewContainer'));
  };
}
