import { api } from '../api.js';

export function showGatepassModal(vehicles, onSuccess) {
  const modal = document.getElementById('appModal');
  const content = document.getElementById('modalContent');

  content.innerHTML = `
    <div class="flex items-center justify-between pb-3 border-b border-slate-200">
      <h3 class="text-base font-bold text-slate-900">Issue Transit Gatepass & PDI Transfer</h3>
      <button id="closeModal" class="text-slate-400 hover:text-slate-600 p-2"><i class="fa-solid fa-xmark text-lg"></i></button>
    </div>
    <form id="gpForm" class="space-y-4 mt-2">
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Select Vehicle from Stockyard *</label>
        <select id="gpVehicle" required class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-orange-500">
          ${vehicles.map(v => `<option value="${v.id}">${v.model} (${v.color}) - Location: ${v.yard_location} - VIN: ${v.vin}</option>`).join('')}
        </select>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Transit Route *</label>
          <select id="gpType" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-orange-500">
            <option value="YARD_TO_SHOWROOM">Yard ➔ Showroom PDI</option>
            <option value="SHOWROOM_TO_DELIVERY">Showroom ➔ Customer VIP Bay</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Departure Odometer (km) *</label>
          <input type="number" id="gpOdo" value="12" required class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm font-mono focus:outline-none focus:border-orange-500">
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
    onSuccess();
  };
}