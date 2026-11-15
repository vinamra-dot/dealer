import { api } from '../api.js';
import { getCarImage } from '../utils/carImages.js';
import { showNewJobCardModal } from './workshopModals.js';

export async function renderWorkshop(container) {
  container.innerHTML = '<div class="text-center py-12 text-slate-400"><i class="fa-solid fa-spinner fa-spin text-2xl text-indigo-600"></i><p class="mt-2 text-sm">Loading workshop job cards...</p></div>';
  const res = await api.get('/workshop/jobs');
  const allJobs = res.data || [];

  container.innerHTML = `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Service Workshop & Bay Operations</h2>
          <p class="text-sm text-slate-500">Live job cards, technician lift allocation, washing & final QC release.</p>
        </div>
        <button id="openJcBtn" class="min-h-[44px] px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold flex items-center justify-center space-x-2 shadow-sm transition">
          <i class="fa-solid fa-wrench"></i>
          <span>Open New Job Card</span>
        </button>
      </div>

      <!-- Workshop Bays Overview -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
          <p class="text-[11px] uppercase font-bold text-indigo-800">Bay-01: EV Diagnostic</p>
          <p class="text-xl font-black text-indigo-950 mt-1">1 Vehicle</p>
          <p class="text-[11px] text-indigo-700 font-medium">Fast charger active</p>
        </div>
        <div class="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p class="text-[11px] uppercase font-bold text-blue-800">Bay-02: Hydraulic Lift</p>
          <p class="text-xl font-black text-blue-950 mt-1">1 Vehicle</p>
          <p class="text-[11px] text-blue-700 font-medium">Engine oil service</p>
        </div>
        <div class="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p class="text-[11px] uppercase font-bold text-amber-800">Bay-03: Quick Service</p>
          <p class="text-xl font-black text-amber-950 mt-1">1 Vehicle</p>
          <p class="text-[11px] text-amber-700 font-medium">Brake inspection</p>
        </div>
        <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <p class="text-[11px] uppercase font-bold text-emerald-800">Bay-04: Washing & QC</p>
          <p class="text-xl font-black text-emerald-950 mt-1">1 Vehicle</p>
          <p class="text-[11px] text-emerald-700 font-medium">Final delivery ready</p>
        </div>
      </div>

      <!-- Search Bar -->
      <div class="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
        <div class="relative w-full sm:w-80">
          <i class="fa-solid fa-magnifying-glass absolute left-3 top-3 text-slate-400 text-xs"></i>
          <input type="text" id="jcSearchInput" placeholder="Filter by Job Card #, registration, or customer..." class="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-indigo-500">
        </div>
      </div>

      <!-- Job Cards Table -->
      <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div class="table-responsive">
          <table class="w-full text-left text-sm text-slate-700">
            <thead class="text-xs uppercase bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th class="py-3 px-4 font-semibold">Job Card</th>
                <th class="py-3 px-4 font-semibold">Vehicle</th>
                <th class="py-3 px-4 font-semibold">Customer</th>
                <th class="py-3 px-4 font-semibold">Bay & Technician</th>
                <th class="py-3 px-4 font-semibold">Odometer / Fuel</th>
                <th class="py-3 px-4 font-semibold">Status</th>
                <th class="py-3 px-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody id="jcTableBody" class="divide-y divide-slate-100"></tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  function renderRows(jobs) {
    const tbody = document.getElementById('jcTableBody');
    if (!tbody) return;
    if (jobs.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="py-6 text-center text-slate-400">No active workshop jobs.</td></tr>';
      return;
    }
    tbody.innerHTML = jobs.map(j => `
      <tr class="hover:bg-slate-50/80 transition">
        <td class="py-3 px-4 font-mono font-bold text-indigo-700 text-xs">${j.job_card_number}</td>
        <td class="py-3 px-4 font-semibold text-slate-900 flex items-center space-x-2.5">
          <img src="${getCarImage(j.vehicle_model)}" alt="${j.vehicle_model}" class="w-10 h-7 object-cover rounded border border-slate-200">
          <div>
            <p class="font-bold text-slate-900 leading-tight">${j.vehicle_model}</p>
            <p class="text-[11px] font-mono font-bold text-slate-700">${j.reg_number}</p>
          </div>
        </td>
        <td class="py-3 px-4 font-medium text-slate-900">${j.customer_name}<br><span class="text-xs text-slate-500 font-mono">${j.customer_phone}</span></td>
        <td class="py-3 px-4 text-xs font-semibold text-slate-800">${j.bay_number}<br><span class="text-slate-500 font-normal">Tech: ${j.technician_name || 'Assigned'}</span></td>
        <td class="py-3 px-4 font-mono text-xs text-slate-600">${j.odometer_in} km<br><span class="text-slate-400">Fuel: ${j.fuel_level}</span></td>
        <td class="py-3 px-4">
          <span class="px-2.5 py-1 rounded-full text-xs font-semibold ${
            j.status === 'QC_CLEARED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
            j.status === 'WASHING' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
            j.status === 'IN_REPAIR' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
            'bg-slate-100 text-slate-700'
          }">${j.status}</span>
        </td>
        <td class="py-3 px-4 text-right whitespace-nowrap">
          ${j.status !== 'QC_CLEARED' ? `
            <button class="advance-jc-btn min-h-[32px] px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded transition shadow-2xs" data-id="${j.id}" data-status="${j.status}">
              Advance Bay
            </button>
          ` : '<span class="text-xs text-emerald-600 font-semibold"><i class="fa-solid fa-circle-check"></i> Gatepass Ready</span>'}
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.advance-jc-btn').forEach(btn => {
      btn.onclick = async () => {
        const flow = ['ARRIVED', 'IN_REPAIR', 'WASHING', 'QC_CLEARED'];
        const next = flow[flow.indexOf(btn.dataset.status) + 1] || 'QC_CLEARED';
        await api.patch(`/workshop/jobs/${btn.dataset.id}/status`, { status: next });
        renderWorkshop(container);
      };
    });
  }

  function filterJobs() {
    const q = (document.getElementById('jcSearchInput')?.value || '').toLowerCase();
    const filtered = allJobs.filter(j => 
      (j.job_card_number || '').toLowerCase().includes(q) ||
      (j.reg_number || '').toLowerCase().includes(q) ||
      (j.customer_name || '').toLowerCase().includes(q) ||
      (j.vehicle_model || '').toLowerCase().includes(q)
    );
    renderRows(filtered);
  }

  renderRows(allJobs);
  document.getElementById('jcSearchInput')?.addEventListener('input', filterJobs);
  document.getElementById('openJcBtn')?.addEventListener('click', () => showNewJobCardModal(() => renderWorkshop(container)));
}