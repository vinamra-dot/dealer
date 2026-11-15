import { api } from '../api.js';
import { exportTableToCsv } from '../utils/exportCsv.js';

export async function renderLedger(container) {
  container.innerHTML = '<div class="text-center py-12 text-slate-400"><i class="fa-solid fa-spinner fa-spin text-2xl text-emerald-600"></i><p class="mt-2 text-sm">Loading dealership P&L ledger...</p></div>';
  const res = await api.get('/ledger');
  const d = res.data || [];
  const s = res.summary || {};

  container.innerHTML = `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Dealership Accounts & P&L Ledger</h2>
          <p class="text-sm text-slate-500">Gross Profit per Vehicle (GPV), OEM invoice wholesale margins & commission income.</p>
        </div>
        <div class="flex items-center gap-2">
          <button id="downloadTallyXmlBtn" class="min-h-[44px] px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-sm font-semibold flex items-center space-x-1.5 shadow-2xs transition">
            <i class="fa-solid fa-file-code text-indigo-600"></i>
            <span>Tally Prime XML</span>
          </button>
          <button id="exportLedgerCsvBtn" class="min-h-[44px] px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold flex items-center justify-center space-x-2 shadow-sm transition">
            <i class="fa-solid fa-file-excel"></i>
            <span>Export (.csv)</span>
          </button>
        </div>
      </div>

      <!-- KPI Summary -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <p class="text-xs uppercase font-bold text-slate-500">Total Vehicle Turnover</p>
          <p class="text-2xl font-black text-slate-900 mt-1">₹${(s.totalRevenue || 0).toLocaleString('en-IN')}</p>
          <p class="text-xs text-slate-500 mt-0.5">Ex-showroom retail revenue</p>
        </div>
        <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-4 shadow-xs">
          <p class="text-xs uppercase font-bold text-emerald-800">Net Dealership Gross Profit</p>
          <p class="text-2xl font-black text-emerald-950 mt-1">₹${(s.totalGrossProfit || 0).toLocaleString('en-IN')}</p>
          <p class="text-xs text-emerald-700 font-semibold mt-0.5">Front-end + Finance + Insurance + VAS</p>
        </div>
        <div class="bg-indigo-50 border border-indigo-200 rounded-xl p-4 shadow-xs">
          <p class="text-xs uppercase font-bold text-indigo-800">Average Margin Per Vehicle</p>
          <p class="text-2xl font-black text-indigo-950 mt-1">₹${(s.avgMarginPerCar || 0).toLocaleString('en-IN')}</p>
          <p class="text-xs text-indigo-700 font-semibold mt-0.5">Healthy dealer EBITDA benchmark</p>
        </div>
      </div>

      <!-- Search Bar -->
      <div class="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
        <div class="relative w-full sm:w-80">
          <i class="fa-solid fa-magnifying-glass absolute left-3 top-3 text-slate-400 text-xs"></i>
          <input type="text" id="ledgerSearchInput" placeholder="Filter by OTF, customer, or vehicle..." class="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-emerald-500">
        </div>
      </div>

      <!-- Ledger Table -->
      <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div class="table-responsive">
          <table class="w-full text-left text-xs text-slate-700">
            <thead class="uppercase bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th class="py-3 px-3 font-semibold">OTF / Customer</th>
                <th class="py-3 px-3 font-semibold">Vehicle</th>
                <th class="py-3 px-3 font-semibold">Sale Price</th>
                <th class="py-3 px-3 font-semibold">OEM Cost</th>
                <th class="py-3 px-3 font-semibold">Front-End</th>
                <th class="py-3 px-3 font-semibold">Bank DO</th>
                <th class="py-3 px-3 font-semibold">Insurance</th>
                <th class="py-3 px-3 font-semibold">VAS Profit</th>
                <th class="py-3 px-3 font-semibold text-rose-600">Discount</th>
                <th class="py-3 px-3 font-bold text-slate-900 text-right">Net Margin</th>
              </tr>
            </thead>
            <tbody id="ledgerTableBody" class="divide-y divide-slate-100"></tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  function renderRows(items) {
    const tbody = document.getElementById('ledgerTableBody');
    if (!tbody) return;
    if (items.length === 0) {
      tbody.innerHTML = '<tr><td colspan="10" class="py-6 text-center text-slate-400">No ledger transactions found.</td></tr>';
      return;
    }
    tbody.innerHTML = items.map(l => `
      <tr class="hover:bg-slate-50/80 transition">
        <td class="py-2.5 px-3 font-bold text-slate-900 font-mono">${l.otf_number}<br><span class="font-normal text-slate-500">${l.customer_name}</span></td>
        <td class="py-2.5 px-3 font-medium text-slate-900">${l.vehicle_model}</td>
        <td class="py-2.5 px-3 font-mono">₹${l.ex_showroom_price.toLocaleString('en-IN')}</td>
        <td class="py-2.5 px-3 font-mono text-slate-500">₹${l.oem_invoice_cost.toLocaleString('en-IN')}</td>
        <td class="py-2.5 px-3 font-mono font-medium text-emerald-700">₹${l.front_end_margin.toLocaleString('en-IN')}</td>
        <td class="py-2.5 px-3 font-mono text-indigo-700">+₹${l.finance_payout.toLocaleString('en-IN')}</td>
        <td class="py-2.5 px-3 font-mono text-indigo-700">+₹${l.insurance_commission.toLocaleString('en-IN')}</td>
        <td class="py-2.5 px-3 font-mono text-indigo-700">+₹${l.accessories_profit.toLocaleString('en-IN')}</td>
        <td class="py-2.5 px-3 font-mono text-rose-600">-₹${l.dealer_discount.toLocaleString('en-IN')}</td>
        <td class="py-2.5 px-3 font-mono font-black text-emerald-800 text-right text-sm">₹${l.net_dealership_margin.toLocaleString('en-IN')}</td>
      </tr>
    `).join('');
  }

  function filterLedger() {
    const q = (document.getElementById('ledgerSearchInput')?.value || '').toLowerCase();
    const filtered = d.filter(l => 
      (l.otf_number || '').toLowerCase().includes(q) ||
      (l.customer_name || '').toLowerCase().includes(q) ||
      (l.vehicle_model || '').toLowerCase().includes(q)
    );
    renderRows(filtered);
  }

  renderRows(d);
  document.getElementById('ledgerSearchInput')?.addEventListener('input', filterLedger);

  document.getElementById('exportLedgerCsvBtn')?.addEventListener('click', () => {
    const headers = ['OTF Number', 'Customer Name', 'Vehicle Model', 'VIN', 'Ex-Showroom Price', 'OEM Invoice Cost', 'Front-End Margin', 'Bank DO Payout', 'Insurance Commission', 'Accessories Profit', 'Discount Given', 'Net Dealership Margin'];
    const rows = d.map(l => [
      l.otf_number, l.customer_name, l.vehicle_model, l.vin, l.ex_showroom_price, l.oem_invoice_cost, l.front_end_margin, l.finance_payout, l.insurance_commission, l.accessories_profit, l.dealer_discount, l.net_dealership_margin
    ]);
    exportTableToCsv('ApexMotors_Dealership_PL_GPV_Ledger', headers, rows);
  });

  document.getElementById('downloadTallyXmlBtn')?.addEventListener('click', async () => {
    try {
      const res = await fetch('/api/tally/sales-xml', {
        headers: { Authorization: `Bearer ${localStorage.getItem('df_token')}` }
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Tally_Sales_${new Date().toISOString().slice(0, 10)}.xml`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Tally export error: ' + err.message);
    }
  });
}