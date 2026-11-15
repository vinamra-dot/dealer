import { api } from '../api.js';

export async function showQuoteModal(onSuccess) {
  const modal = document.getElementById('appModal');
  const content = document.getElementById('modalContent');
  const leadsRes = await api.get('/leads');
  const leads = leadsRes.data || [];

  content.innerHTML = `
    <div class="flex items-center justify-between pb-3 border-b border-slate-200">
      <h3 class="text-base font-bold text-slate-900">Create Instant Quotation</h3>
      <button id="closeModal" class="text-slate-400 hover:text-slate-600 p-2"><i class="fa-solid fa-xmark text-lg"></i></button>
    </div>
    <form id="quoteForm" class="space-y-4 mt-2">
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Customer Lead *</label>
        <select id="quoteLead" required class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-purple-500">
          ${leads.map(l => `<option value="${l.id}">${l.customer_name} - ${l.phone}</option>`).join('')}
        </select>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Vehicle Model *</label>
          <select id="quoteModel" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-purple-500">
            <option value="Nexon EV" data-price="1929000">Nexon EV (₹19,29,000)</option>
            <option value="Harrier" data-price="2644000">Harrier (₹26,44,000)</option>
            <option value="Safari" data-price="2734000">Safari (₹27,34,000)</option>
            <option value="Punch" data-price="960000">Punch (₹9,60,000)</option>
            <option value="Curvv EV" data-price="2199000">Curvv EV (₹21,99,000)</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Ex-Showroom Price (₹) *</label>
          <input type="number" id="quotePrice" value="1929000" required class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm font-mono focus:outline-none focus:border-purple-500">
        </div>
      </div>
      <!-- Accessories & VAS Packages -->
      <div class="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 space-y-1.5">
        <p class="font-bold text-slate-900">Accessories & VAS Add-ons:</p>
        <label class="flex items-center space-x-2"><input type="checkbox" id="vasTeflon" checked class="w-4 h-4 text-purple-600"> <span>Ceramic Coating & Underbody Protection (+₹12,000)</span></label>
        <label class="flex items-center space-x-2"><input type="checkbox" id="vasWarranty" checked class="w-4 h-4 text-purple-600"> <span>Extended 5-Year Warranty & RSA (+₹18,000)</span></label>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Basic Accessories Kit (₹)</label>
          <input type="number" id="quoteAcc" value="15000" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm font-mono focus:outline-none focus:border-purple-500">
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Dealer Discount (₹)</label>
          <input type="number" id="quoteDiscount" value="15000" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm font-mono focus:outline-none focus:border-purple-500">
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
    onSuccess();
  };
}