import { api } from '../api.js';
import { printQuotationDoc } from '../utils/printDocument.js';
import { getCarImage } from '../utils/carImages.js';
import { sendQuoteWhatsApp } from '../utils/whatsapp.js';
import { showQuoteModal } from './quotesModals.js';

export async function renderQuotes(container) {
  container.innerHTML = '<div class="text-center py-12 text-slate-400"><i class="fa-solid fa-spinner fa-spin text-2xl text-purple-600"></i><p class="mt-2 text-sm">Loading quotations...</p></div>';
  const res = await api.get('/quotes');
  const allQuotes = res.data || [];

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

      <!-- Search Bar -->
      <div class="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
        <div class="relative w-full sm:w-80">
          <i class="fa-solid fa-magnifying-glass absolute left-3 top-3 text-slate-400 text-xs"></i>
          <input type="text" id="quoteSearchInput" placeholder="Filter by customer, phone, or model..." class="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-purple-500 focus:bg-white transition">
        </div>
      </div>

      <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div class="table-responsive">
          <table class="w-full text-left text-sm text-slate-700">
            <thead class="text-xs uppercase bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th class="py-3 px-4 font-semibold">Quote Ref</th>
                <th class="py-3 px-4 font-semibold">Customer</th>
                <th class="py-3 px-4 font-semibold">Vehicle</th>
                <th class="py-3 px-4 font-semibold">Ex-Showroom</th>
                <th class="py-3 px-4 font-semibold">Final On-Road</th>
                <th class="py-3 px-4 font-semibold">Status</th>
                <th class="py-3 px-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody id="quotesTableBody" class="divide-y divide-slate-100"></tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  function renderRows(quotes) {
    const tbody = document.getElementById('quotesTableBody');
    if (!tbody) return;
    if (quotes.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="py-6 text-center text-slate-400">No matching quotations found.</td></tr>';
      return;
    }
    tbody.innerHTML = quotes.map(q => `
      <tr class="hover:bg-slate-50/80 transition">
        <td class="py-3 px-4 font-mono text-xs text-purple-700 font-semibold">${q.id}</td>
        <td class="py-3 px-4 font-semibold text-slate-900">${q.customer_name}<br><span class="text-xs text-slate-500 font-mono">${q.customer_phone}</span></td>
        <td class="py-3 px-4 font-semibold text-slate-900 flex items-center space-x-2.5">
          <img src="${getCarImage(q.vehicle_model)}" alt="${q.vehicle_model}" class="w-10 h-7 object-cover rounded border border-slate-200">
          <div>
            <p class="font-bold text-slate-900 leading-tight">${q.vehicle_model}</p>
            <p class="text-xs text-slate-500 font-normal">${q.variant}</p>
          </div>
        </td>
        <td class="py-3 px-4 font-mono">₹${parseFloat(q.ex_showroom_price).toLocaleString('en-IN')}</td>
        <td class="py-3 px-4 font-bold text-slate-900 font-mono text-base">₹${parseFloat(q.final_on_road_price).toLocaleString('en-IN')}</td>
        <td class="py-3 px-4">
          <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">${q.status}</span>
        </td>
        <td class="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
          <button class="whatsapp-quote-btn min-h-[32px] px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded border border-emerald-300 transition shadow-2xs" data-json="${encodeURIComponent(JSON.stringify(q))}">
            <i class="fa-brands fa-whatsapp text-emerald-600 mr-1"></i> WhatsApp
          </button>
          <button class="print-quote-btn min-h-[32px] px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold rounded border border-purple-200 transition shadow-2xs" data-json="${encodeURIComponent(JSON.stringify(q))}">
            <i class="fa-solid fa-print mr-1"></i> Print
          </button>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.whatsapp-quote-btn').forEach(b => {
      b.onclick = () => sendQuoteWhatsApp(JSON.parse(decodeURIComponent(b.dataset.json)));
    });

    tbody.querySelectorAll('.print-quote-btn').forEach(b => {
      b.onclick = () => printQuotationDoc(JSON.parse(decodeURIComponent(b.dataset.json)));
    });
  }

  function filterQuotes() {
    const q = (document.getElementById('quoteSearchInput')?.value || '').toLowerCase();
    const filtered = allQuotes.filter(item => 
      (item.customer_name || '').toLowerCase().includes(q) ||
      (item.customer_phone || '').toLowerCase().includes(q) ||
      (item.vehicle_model || '').toLowerCase().includes(q) ||
      (item.id || '').toLowerCase().includes(q)
    );
    renderRows(filtered);
  }

  renderRows(allQuotes);
  document.getElementById('quoteSearchInput')?.addEventListener('input', filterQuotes);
  document.getElementById('newQuoteBtn')?.addEventListener('click', () => showQuoteModal(() => renderQuotes(container)));
}