import { api } from '../api.js';
import { printQuotationDoc } from '../utils/printDocument.js';

export async function renderQuotes(container) {
  container.innerHTML = '<div class="text-center py-12 text-slate-400"><i class="fa-solid fa-spinner fa-spin text-2xl text-purple-600"></i><p class="mt-2 text-sm">Loading quotations...</p></div>';
  const res = await api.get('/quotes');
  const quotes = res.data || [];

  container.innerHTML = `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Instant On-Road Quotation Builder</h2>
          <p class="text-sm text-slate-500">Accurate RTO tax, zero-dep insurance, Fastag & accessory inventory calculations.</p>
        </div>
        <button id="newQuoteBtn" class="min-h-[44px] px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold flex items-center justify-center space-x-2 shadow-sm transition">
          <i class="fa-solid fa-calculator"></i>
          <span>Generate New Quotation</span>
        </button>
      </div>

      <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div class="table-responsive">
          <table class="w-full text-left text-sm text-slate-700">
            <thead class="text-xs uppercase bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th class="py-3 px-4 font-semibold">Quote Ref</th>
                <th class="py-3 px-4 font-semibold">Customer</th>
                <th class="py-3 px-4 font-semibold">Model & Variant</th>
                <th class="py-3 px-4 font-semibold">Ex-Showroom</th>
                <th class="py-3 px-4 font-semibold">Final On-Road</th>
                <th class="py-3 px-4 font-semibold">Status</th>
                <th class="py-3 px-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${quotes.length === 0 ? '<tr><td colspan="7" class="py-6 text-center text-slate-400">No quotations generated yet.</td></tr>' : ''}
              ${quotes.map(q => `
                <tr class="hover:bg-slate-50/80 transition">
                  <td class="py-3 px-4 font-mono text-xs text-purple-700 font-semibold">${q.id}</td>
                  <td class="py-3 px-4 font-semibold text-slate-900">${q.customer_name}<br><span class="text-xs text-slate-500 font-mono">${q.customer_phone}</span></td>
                  <td class="py-3 px-4 font-medium text-slate-900">${q.vehicle_model} <span class="text-xs text-slate-500">(${q.variant})</span></td>
                  <td class="py-3 px-4 font-mono">₹${parseFloat(q.ex_showroom_price).toLocaleString('en-IN')}</td>
                  <td class="py-3 px-4 font-bold text-slate-900 font-mono text-base">₹${parseFloat(q.final_on_road_price).toLocaleString('en-IN')}</td>
                  <td class="py-3 px-4">
                    <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">${q.status}</span>
                  </td>
                  <td class="py-3 px-4 text-right">
                    <button class="print-quote-btn min-h-[32px] px-3 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold rounded border border-purple-200 transition" data-json="${encodeURIComponent(JSON.stringify(q))}">
                      <i class="fa-solid fa-print mr-1"></i> Print Quote
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  document.querySelectorAll('.print-quote-btn').forEach(b => {
    b.onclick = () => printQuotationDoc(JSON.parse(decodeURIComponent(b.dataset.json)));
  });

  document.getElementById('newQuoteBtn')?.addEventListener('click', () => showQuoteModal(container));
}

async function showQuoteModal(container) {
  const modal = document.getElementById('appModal');
  const content = document.getElementById('modalContent');
  const leadsRes = await api.get('/leads');
  const leads = leadsRes.data || [];

  content.innerHTML = `
    <div class="flex items-center justify-between pb-3 border-b border-slate-200">
      <h3 class="text-lg font-bold text-slate-900">Create Instant Quotation</h3>
      <button id="closeModal" class="text-slate-400 hover:text-slate-600 p-2"><i class="fa-solid fa-xmark text-lg"></i></button>
    </div>
    <form id="quoteForm" class="space-y-4">
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Customer Lead *</label>
        <select id="quoteLead" required class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none">
          ${leads.map(l => `<option value="${l.id}">${l.customer_name} - ${l.phone}</option>`).join('')}
        </select>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Vehicle Model *</label>
          <select id="quoteModel" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none">
            <option value="Nexon EV" data-price="1929000">Nexon EV (₹19,29,000)</option>
            <option value="Harrier" data-price="2644000">Harrier (₹26,44,000)</option>
            <option value="Safari" data-price="2734000">Safari (₹27,34,000)</option>
            <option value="Punch" data-price="960000">Punch (₹9,60,000)</option>
            <option value="Curvv EV" data-price="2199000">Curvv EV (₹21,99,000)</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Ex-Showroom Price (₹) *</label>
          <input type="number" id="quotePrice" value="1929000" required class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm font-mono focus:outline-none">
        </div>
      </div>
      <!-- Accessories & VAS Packages -->
      <div class="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 space-y-1.5">
        <p class="font-bold text-slate-900">Accessories & VAS Add-ons:</p>
        <label class="flex items-center space-x-2"><input type="checkbox" id="vasTeflon" checked class="w-4 h-4 text-purple-600"> <span>Ceramic Coating & Underbody Protection (+₹12,000)</span></label>
        <label class="flex items-center space-x-2"><input type="checkbox" id="vasWarranty" checked class="w-4 h-4 text-purple-600"> <span>Extended 5-Year Warranty & RSA (+₹18,000)</span></label>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Basic Accessories Kit (₹)</label>
          <input type="number" id="quoteAcc" value="15000" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm font-mono focus:outline-none">
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Dealer Discount (₹)</label>
          <input type="number" id="quoteDiscount" value="15000" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm font-mono focus:outline-none">
        </div>
      </div>
      <button type="submit" class="w-full min-h-[44px] bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg text-sm transition shadow-sm">Calculate & Save Quotation</button>
    </form>
  `;

  modal.classList.remove('hidden');
  document.getElementById('closeModal').onclick = () => modal.classList.add('hidden');
  document.getElementById('quoteModel').onchange = (e) => {
    document.getElementById('quotePrice').value = e.target.selectedOptions[0].dataset.price;
  };

  document.getElementById('quoteForm').onsubmit = async (e) => {
    e.preventDefault();
    let totalAcc = parseFloat(document.getElementById('quoteAcc').value || 0);
    if (document.getElementById('vasTeflon').checked) totalAcc += 12000;
    if (document.getElementById('vasWarranty').checked) totalAcc += 18000;

    await api.post('/quotes/generate', {
      lead_id: document.getElementById('quoteLead').value,
      vehicle_model: document.getElementById('quoteModel').value,
      variant: 'Top Variant',
      ex_showroom_price: document.getElementById('quotePrice').value,
      accessories_cost: totalAcc,
      discount_amount: document.getElementById('quoteDiscount').value
    });
    modal.classList.add('hidden');
    renderQuotes(container);
  };
}
