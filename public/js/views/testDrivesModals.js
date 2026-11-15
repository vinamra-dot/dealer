import { api } from '../api.js';

export async function showScheduleModal(onSuccess) {
  const modal = document.getElementById('appModal');
  const content = document.getElementById('modalContent');
  const leadsRes = await api.get('/leads');
  const leads = leadsRes.data || [];

  content.innerHTML = `
    <div class="flex items-center justify-between pb-3 border-b border-slate-200">
      <h3 class="text-base font-bold text-slate-900">Schedule Demo Test Drive</h3>
      <button id="closeModal" class="text-slate-400 hover:text-slate-600 p-2"><i class="fa-solid fa-xmark text-lg"></i></button>
    </div>
    <form id="tdForm" class="space-y-4 mt-2">
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Select Customer Lead *</label>
        <select id="tdLead" required class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-emerald-500">
          ${leads.map(l => `<option value="${l.id}">${l.customer_name} (${l.interested_model || 'No model'}) - ${l.phone}</option>`).join('')}
        </select>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
    onSuccess();
  };
}