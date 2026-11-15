import { api } from '../api.js';

export function showExchangeModal(onSuccess) {
  const modal = document.getElementById('appModal');
  const content = document.getElementById('modalContent');

  content.innerHTML = `
    <div class="flex items-center justify-between pb-3 border-b border-slate-200">
      <div>
        <h3 class="text-base font-bold text-slate-900">Used Car Exchange Valuation</h3>
        <p class="text-xs text-slate-500">Parivahan RTO auto-fetch & 15-point inspection</p>
      </div>
      <button id="closeModal" class="text-slate-400 hover:text-slate-600 p-2"><i class="fa-solid fa-xmark text-lg"></i></button>
    </div>
    <form id="evalForm" class="space-y-4 mt-2">
      <!-- Parivahan RTO Fetch Bar -->
      <div class="p-3 bg-cyan-50 rounded-xl border border-cyan-200 space-y-1.5">
        <label class="block text-xs font-bold text-cyan-900">Fetch RTO Details from Parivahan</label>
        <div class="flex gap-2">
          <input type="text" id="rtoRegInput" value="MH-02-DW-8821" class="flex-1 bg-white border border-cyan-300 rounded-lg px-3 py-1.5 text-xs font-mono uppercase focus:outline-none">
          <button type="button" id="vahanFetchBtn" class="min-h-[34px] px-3 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg text-xs font-semibold">
            <i class="fa-solid fa-cloud-arrow-down mr-1"></i> Auto-Fetch
          </button>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Customer Name *</label>
          <input type="text" id="ucName" value="Sunita Jain" required class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none">
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Customer Phone *</label>
          <input type="tel" id="ucPhone" value="+91-9414087654" required class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none">
        </div>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Make & Brand *</label>
          <input type="text" id="ucMake" value="Hyundai" required class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none">
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Model & Variant *</label>
          <input type="text" id="ucModel" value="Grand i10 Sportz" required class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none">
        </div>
      </div>
      <div class="grid grid-cols-3 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Year *</label>
          <input type="number" id="ucYear" value="2018" required class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none">
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Odometer (km) *</label>
          <input type="number" id="ucKm" value="48000" required class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none">
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Condition</label>
          <select id="ucCond" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none">
            <option value="EXCELLENT">Excellent</option>
            <option value="GOOD" selected>Good</option>
            <option value="AVERAGE">Average</option>
          </select>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Customer Expected (₹) *</label>
          <input type="number" id="ucProp" value="380000" required class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm font-mono focus:outline-none">
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Evaluator Approved (₹) *</label>
          <input type="number" id="ucApp" value="360000" required class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm font-mono focus:outline-none">
        </div>
      </div>
      <button type="submit" class="w-full min-h-[44px] bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg text-sm transition shadow-sm">Authorize Exchange Valuation</button>
    </form>
  `;

  modal.classList.remove('hidden');
  document.getElementById('closeModal').onclick = () => modal.classList.add('hidden');

  document.getElementById('vahanFetchBtn')?.addEventListener('click', async () => {
    const reg = document.getElementById('rtoRegInput').value;
    try {
      const res = await api.post('/rto/vahan-lookup', { reg_number: reg });
      const d = res.data;
      document.getElementById('ucMake').value = d.maker.split(' ')[0] || 'Tata';
      document.getElementById('ucModel').value = d.model;
      document.getElementById('ucYear').value = d.mfg_year || 2023;
      alert(`Parivahan RTO Data Found!\nVehicle: ${d.maker} - ${d.model}\nRC: ${d.rc_status}\nTax: ${d.tax_status}`);
    } catch {
      alert('Unable to fetch Parivahan data.');
    }
  });

  document.getElementById('evalForm').onsubmit = async (e) => {
    e.preventDefault();
    await api.post('/used-cars/evaluate', {
      customer_name: document.getElementById('ucName').value,
      phone: document.getElementById('ucPhone').value,
      make: document.getElementById('ucMake').value,
      model: document.getElementById('ucModel').value,
      manufacturing_year: document.getElementById('ucYear').value,
      kilometers_run: document.getElementById('ucKm').value,
      condition_rating: document.getElementById('ucCond').value,
      proposed_value: document.getElementById('ucProp').value,
      approved_value: document.getElementById('ucApp').value
    });
    modal.classList.add('hidden');
    onSuccess();
  };
}