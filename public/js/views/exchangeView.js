import { api } from '../api.js';

export async function renderExchange(container) {
  container.innerHTML = '<div class="text-center py-12 text-slate-400"><i class="fa-solid fa-spinner fa-spin text-2xl text-amber-600"></i><p class="mt-2 text-sm">Loading used car exchange desk...</p></div>';
  const res = await api.get('/used-cars');
  const cars = res.data || [];

  container.innerHTML = `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Used Car Trade-In & Exchange Desk</h2>
          <p class="text-sm text-slate-500">20-point digital inspection, valuation approval & auto-credit into new car downpayment.</p>
        </div>
        <button id="evalCarBtn" class="min-h-[44px] px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-semibold flex items-center justify-center space-x-2 shadow-sm transition">
          <i class="fa-solid fa-car-side"></i>
          <span>Evaluate Trade-In Vehicle</span>
        </button>
      </div>

      <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div class="table-responsive">
          <table class="w-full text-left text-sm text-slate-700">
            <thead class="text-xs uppercase bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th class="py-3 px-4 font-semibold">Customer</th>
                <th class="py-3 px-4 font-semibold">Trade-in Vehicle</th>
                <th class="py-3 px-4 font-semibold">Year & Odometer</th>
                <th class="py-3 px-4 font-semibold">Condition</th>
                <th class="py-3 px-4 font-semibold">Approved Valuation</th>
                <th class="py-3 px-4 font-semibold">Status</th>
                <th class="py-3 px-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${cars.length === 0 ? '<tr><td colspan="7" class="py-6 text-center text-slate-400">No trade-in vehicles evaluated yet.</td></tr>' : ''}
              ${cars.map(c => `
                <tr class="hover:bg-slate-50/80 transition">
                  <td class="py-3 px-4 font-semibold text-slate-900">${c.customer_name}<br><span class="text-xs text-slate-500 font-mono">${c.phone}</span></td>
                  <td class="py-3 px-4 font-medium text-slate-900">${c.make} ${c.model}</td>
                  <td class="py-3 px-4 text-xs font-mono text-slate-600">${c.manufacturing_year} • ${c.kilometers_run.toLocaleString('en-IN')} km</td>
                  <td class="py-3 px-4"><span class="px-2 py-0.5 rounded text-xs bg-slate-100 font-semibold text-slate-700 border border-slate-200">${c.condition_rating}</span></td>
                  <td class="py-3 px-4 font-bold text-amber-700 font-mono text-base">₹${parseFloat(c.approved_value).toLocaleString('en-IN')}</td>
                  <td class="py-3 px-4">
                    <span class="px-2.5 py-1 rounded-full text-xs font-semibold ${
                      c.status === 'ADJUSTED_IN_DOWNPAYMENT' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }">${c.status.replace(/_/g, ' ')}</span>
                  </td>
                  <td class="py-3 px-4 text-right">
                    ${c.status !== 'ADJUSTED_IN_DOWNPAYMENT' ? `
                      <button class="adjust-btn min-h-[36px] px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded transition shadow-2xs" data-id="${c.id}">
                        Credit to Downpayment
                      </button>
                    ` : `<span class="text-xs text-slate-500">Credited to ${c.otf_number || 'Booking'}</span>`}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  document.querySelectorAll('.adjust-btn').forEach(btn => {
    btn.onclick = async () => {
      const bkRes = await api.get('/bookings');
      const bks = bkRes.data || [];
      if (bks.length === 0) return alert('No active new bookings found to credit exchange.');

      const bkId = prompt(`Select Booking ID to credit this trade-in amount:\n${bks.map(b => `${b.id} (${b.otf_number} - ${b.customer_name})`).join('\n')}`, bks[0].id);
      if (bkId) {
        await api.patch(`/used-cars/${btn.dataset.id}/adjust`, { new_booking_id: bkId });
        alert('Exchange valuation successfully credited to customer ledger!');
        renderExchange(container);
      }
    };
  });

  document.getElementById('evalCarBtn')?.addEventListener('click', () => showEvalModal());
}

async function showEvalModal() {
  const modal = document.getElementById('appModal');
  const content = document.getElementById('modalContent');

  content.innerHTML = `
    <div class="flex items-center justify-between pb-3 border-b border-slate-200">
      <h3 class="text-lg font-bold text-slate-900">20-Point Used Car Valuation Form</h3>
      <button id="closeModal" class="text-slate-400 hover:text-slate-600 p-2"><i class="fa-solid fa-xmark text-lg"></i></button>
    </div>
    <form id="evalForm" class="space-y-4">
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
    renderExchange(document.getElementById('viewContainer'));
  };
}
