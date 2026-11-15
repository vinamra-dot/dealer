import { api } from '../api.js';
import { showExchangeModal } from './exchangeModals.js';

export async function renderExchange(container) {
  container.innerHTML = '<div class="text-center py-12 text-slate-400"><i class="fa-solid fa-spinner fa-spin text-2xl text-amber-600"></i><p class="mt-2 text-sm">Loading vehicle exchange desk...</p></div>';
  const res = await api.get('/used-cars');
  const usedCars = res.data || [];

  container.innerHTML = `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Used Car Trade-In & Evaluator Desk</h2>
          <p class="text-sm text-slate-500">Parivahan RTO auto-fetch, 15-point inspection, refurbishment estimation & exchange bonus ledger.</p>
        </div>
        <button id="newExchangeBtn" class="min-h-[44px] px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-semibold flex items-center justify-center space-x-2 shadow-sm transition">
          <i class="fa-solid fa-car-side"></i>
          <span>New Vehicle Valuation</span>
        </button>
      </div>

      <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div class="table-responsive">
          <table class="w-full text-left text-sm text-slate-700">
            <thead class="text-xs uppercase bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th class="py-3 px-4 font-semibold">Customer</th>
                <th class="py-3 px-4 font-semibold">Trade-In Vehicle</th>
                <th class="py-3 px-4 font-semibold">Odometer / Year</th>
                <th class="py-3 px-4 font-semibold">Customer Ask</th>
                <th class="py-3 px-4 font-semibold">Evaluator Value</th>
                <th class="py-3 px-4 font-semibold">Status</th>
                <th class="py-3 px-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${usedCars.length === 0 ? '<tr><td colspan="7" class="py-6 text-center text-slate-400">No used cars evaluated yet.</td></tr>' : ''}
              ${usedCars.map(c => `
                <tr class="hover:bg-slate-50/80 transition">
                  <td class="py-3 px-4 font-semibold text-slate-900">${c.customer_name}<br><span class="text-xs text-slate-500 font-mono">${c.phone}</span></td>
                  <td class="py-3 px-4 font-medium text-slate-900">${c.make} ${c.model}</td>
                  <td class="py-3 px-4 text-xs font-mono text-slate-600">${c.manufacturing_year} • ${c.kilometers_run?.toLocaleString('en-IN') || '0'} km</td>
                  <td class="py-3 px-4 font-mono text-slate-500">₹${parseFloat(c.proposed_value || 0).toLocaleString('en-IN')}</td>
                  <td class="py-3 px-4 font-mono font-bold text-amber-700">₹${parseFloat(c.approved_value || 0).toLocaleString('en-IN')}</td>
                  <td class="py-3 px-4">
                    <span class="px-2.5 py-1 rounded-full text-xs font-semibold ${
                      c.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      c.status === 'ADJUSTED_IN_INVOICE' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                      'bg-amber-50 text-amber-700 border border-amber-200'
                    }">${c.status}</span>
                  </td>
                  <td class="py-3 px-4 text-right">
                    ${c.status === 'EVALUATED' ? `
                      <button class="approve-val-btn min-h-[32px] px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded transition" data-id="${c.id}">
                        Approve
                      </button>
                    ` : '<span class="text-xs text-emerald-600 font-semibold"><i class="fa-solid fa-check"></i> Approved</span>'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  document.querySelectorAll('.approve-val-btn').forEach(btn => {
    btn.onclick = async () => {
      await api.patch(`/used-cars/${btn.dataset.id}/approve`, {});
      renderExchange(container);
    };
  });

  document.getElementById('newExchangeBtn')?.addEventListener('click', () => showExchangeModal(() => renderExchange(container)));
}