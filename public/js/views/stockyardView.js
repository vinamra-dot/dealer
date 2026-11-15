import { api } from '../api.js';

export async function renderStockyard(container) {
  container.innerHTML = '<div class="text-center py-12 text-slate-400"><i class="fa-solid fa-spinner fa-spin text-2xl text-orange-600"></i><p class="mt-2 text-sm">Loading gate passes & stockyard logs...</p></div>';
  const [gpRes, vehRes] = await Promise.all([api.get('/pdi/gatepasses'), api.get('/vehicles')]);
  const passes = gpRes.data || [];
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

      <!-- Stockyard Aging Buckets -->
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

      <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <h3 class="text-base font-bold text-slate-900 mb-3">Active Transit Gatepasses & PDI</h3>
        <div class="table-responsive">
          <table class="w-full text-left text-sm text-slate-700">
            <thead class="text-xs uppercase bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th class="py-3 px-4 font-semibold">Pass ID</th>
                <th class="py-3 px-4 font-semibold">Vehicle Model / VIN</th>
                <th class="py-3 px-4 font-semibold">Driver</th>
                <th class="py-3 px-4 font-semibold">Route</th>
                <th class="py-3 px-4 font-semibold">Odometer</th>
                <th class="py-3 px-4 font-semibold">Status</th>
                <th class="py-3 px-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${passes.length === 0 ? '<tr><td colspan="7" class="py-6 text-center text-slate-400">No transit gate passes issued yet.</td></tr>' : ''}
              ${passes.map(gp => `
                <tr class="hover:bg-slate-50/80 transition">
                  <td class="py-3 px-4 font-mono font-bold text-orange-700">${gp.id}</td>
                  <td class="py-3 px-4 font-semibold text-slate-900">${gp.model} <span class="text-xs text-slate-500">(${gp.color})</span><br><span class="text-xs font-mono text-slate-400">VIN: ${gp.vin}</span></td>
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
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  document.querySelectorAll('.complete-gp-btn').forEach(btn => {
    btn.onclick = async () => {
      const endOdo = prompt('Enter Arrival Odometer Reading (km):', '32');
      if (endOdo) {
        await api.patch(`/pdi/gatepasses/${btn.dataset.id}/complete`, { ending_odometer: endOdo });
        renderStockyard(container);
      }
    };
  });

  document.getElementById('issuePassBtn')?.addEventListener('click', () => showGatepassModal(container, vehicles));
}

async function showGatepassModal(container, vehicles) {
  const modal = document.getElementById('appModal');
  const content = document.getElementById('modalContent');

  content.innerHTML = `
    <div class="flex items-center justify-between pb-3 border-b border-slate-200">
      <h3 class="text-lg font-bold text-slate-900">Issue Transit Gatepass</h3>
      <button id="closeModal" class="text-slate-400 hover:text-slate-600 p-2"><i class="fa-solid fa-xmark text-lg"></i></button>
    </div>
    <form id="gpForm" class="space-y-4">
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Select Vehicle from Stockyard *</label>
        <select id="gpVehicle" required class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none">
          ${vehicles.map(v => `<option value="${v.id}">${v.model} (${v.color}) - Location: ${v.yard_location}</option>`).join('')}
        </select>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Transit Route</label>
          <select id="gpType" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none">
            <option value="YARD_TO_SHOWROOM">Yard ➔ Showroom PDI</option>
            <option value="SHOWROOM_TO_DELIVERY">Showroom ➔ Customer</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Departure Odometer (km) *</label>
          <input type="number" id="gpOdo" value="12" required class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm font-mono focus:outline-none">
        </div>
      </div>
      <button type="submit" class="w-full min-h-[44px] bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg text-sm transition shadow-sm">Authorize Driver & Generate Pass</button>
    </form>
  `;

  modal.classList.remove('hidden');
  document.getElementById('closeModal').onclick = () => modal.classList.add('hidden');
  document.getElementById('gpForm').onsubmit = async (e) => {
    e.preventDefault();
    await api.post('/pdi/issue-pass', {
      vehicle_id: document.getElementById('gpVehicle').value,
      pass_type: document.getElementById('gpType').value,
      starting_odometer: document.getElementById('gpOdo').value
    });
    modal.classList.add('hidden');
    renderStockyard(container);
  };
}
