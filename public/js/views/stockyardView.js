import { api } from '../api.js';
import { getCarImage } from '../utils/carImages.js';
import { showGatepassModal } from './stockyardModals.js';

export async function renderStockyard(container) {
  container.innerHTML = '<div class="text-center py-12 text-slate-400"><i class="fa-solid fa-spinner fa-spin text-2xl text-orange-600"></i><p class="mt-2 text-sm">Loading gate passes & stockyard logs...</p></div>';
  const [gpRes, vehRes] = await Promise.all([api.get('/pdi/gatepasses'), api.get('/vehicles')]);
  const allPasses = gpRes.data || [];
  const vehicles = vehRes.data || [];

  container.innerHTML = `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Stockyard Logistics & Aging Cockpit</h2>
          <p class="text-sm text-slate-500">Aging inventory buckets, accumulated holding interest & transit gatepasses.</p>
        </div>
        <button id="issuePassBtn" class="min-h-[44px] px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-semibold flex items-center justify-center space-x-2 shadow-sm transition">
          <i class="fa-solid fa-ticket"></i>
          <span>Issue Gatepass</span>
        </button>
      </div>

      <!-- Aging Buckets -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <p class="text-xs uppercase font-bold text-emerald-800">Fresh Stock (0 - 15 Days)</p>
          <p class="text-2xl font-black text-emerald-950 mt-1">${vehicles.filter(v => v.status === 'AVAILABLE').length - 2} Cars</p>
          <p class="text-[11px] text-emerald-700 mt-1">Normal carrying interest</p>
        </div>
        <div class="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p class="text-xs uppercase font-bold text-amber-800">Aging Stock (15 - 30 Days)</p>
          <p class="text-2xl font-black text-amber-950 mt-1">2 Cars</p>
          <p class="text-[11px] text-amber-700 mt-1">Sales follow-up recommended</p>
        </div>
        <div class="bg-rose-50 border border-rose-200 rounded-xl p-4">
          <p class="text-xs uppercase font-bold text-rose-800">High Interest Alert (> 30 Days)</p>
          <p class="text-2xl font-black text-rose-950 mt-1">1 Car</p>
          <p class="text-[11px] text-rose-700 font-semibold mt-1">Accumulated Holding: ₹14,700</p>
        </div>
      </div>

      <!-- Search Bar -->
      <div class="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
        <div class="relative w-full sm:w-80">
          <i class="fa-solid fa-magnifying-glass absolute left-3 top-3 text-slate-400 text-xs"></i>
          <input type="text" id="gpSearchInput" placeholder="Filter by vehicle, VIN, or driver..." class="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white transition">
        </div>
      </div>

      <!-- Passes Table -->
      <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <h3 class="text-base font-bold text-slate-900 mb-3">Active Transit Gatepasses & PDI</h3>
        <div class="table-responsive">
          <table class="w-full text-left text-sm text-slate-700">
            <thead class="text-xs uppercase bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th class="py-3 px-4 font-semibold">Pass ID</th>
                <th class="py-3 px-4 font-semibold">Vehicle</th>
                <th class="py-3 px-4 font-semibold">Driver</th>
                <th class="py-3 px-4 font-semibold">Route</th>
                <th class="py-3 px-4 font-semibold">Odometer</th>
                <th class="py-3 px-4 font-semibold">Status</th>
                <th class="py-3 px-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody id="gpTableBody" class="divide-y divide-slate-100"></tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  function renderRows(passes) {
    const tbody = document.getElementById('gpTableBody');
    if (!tbody) return;
    if (passes.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="py-6 text-center text-slate-400">No transit gate passes found.</td></tr>';
      return;
    }
    tbody.innerHTML = passes.map(gp => `
      <tr class="hover:bg-slate-50/80 transition">
        <td class="py-3 px-4 font-mono font-bold text-orange-700 text-xs">${gp.id}</td>
        <td class="py-3 px-4 font-semibold text-slate-900 flex items-center space-x-2.5">
          <img src="${getCarImage(gp.model)}" alt="${gp.model}" class="w-10 h-7 object-cover rounded border border-slate-200">
          <div>
            <p class="font-bold text-slate-900 leading-tight">${gp.model} <span class="text-xs text-slate-500 font-normal">(${gp.color})</span></p>
            <p class="text-[11px] font-mono text-slate-500">VIN: ${gp.vin}</p>
          </div>
        </td>
        <td class="py-3 px-4 text-xs font-medium text-slate-800">${gp.driver_name || 'Assigned Driver'}</td>
        <td class="py-3 px-4 text-xs">${gp.pass_type}</td>
        <td class="py-3 px-4 font-mono text-xs text-slate-600">${gp.starting_odometer} km ➔ ${gp.ending_odometer ? gp.ending_odometer + ' km' : 'In-Transit'}</td>
        <td class="py-3 px-4">
          <span class="px-2.5 py-1 rounded-full text-xs font-semibold ${
            gp.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-orange-50 text-orange-700 border border-orange-200'
          }">${gp.status}</span>
        </td>
        <td class="py-3 px-4 text-right">
          ${gp.status !== 'COMPLETED' ? `
            <button class="complete-gp-btn min-h-[32px] px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white text-xs font-medium rounded transition shadow-2xs" data-id="${gp.id}">
              Clear PDI
            </button>
          ` : '<span class="text-xs text-emerald-600 font-semibold"><i class="fa-solid fa-check"></i> Cleared</span>'}
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.complete-gp-btn').forEach(btn => {
      btn.onclick = async () => {
        const endOdo = prompt('Enter Arrival Odometer Reading (km):', '32');
        if (endOdo) {
          await api.patch(`/pdi/gatepasses/${btn.dataset.id}/complete`, { ending_odometer: endOdo });
          renderStockyard(container);
        }
      };
    });
  }

  function filterPasses() {
    const q = (document.getElementById('gpSearchInput')?.value || '').toLowerCase();
    const filtered = allPasses.filter(p => 
      (p.id || '').toLowerCase().includes(q) ||
      (p.model || '').toLowerCase().includes(q) ||
      (p.vin || '').toLowerCase().includes(q) ||
      (p.driver_name || '').toLowerCase().includes(q)
    );
    renderRows(filtered);
  }

  renderRows(allPasses);
  document.getElementById('gpSearchInput')?.addEventListener('input', filterPasses);
  document.getElementById('issuePassBtn')?.addEventListener('click', () => showGatepassModal(vehicles, () => renderStockyard(container)));
}