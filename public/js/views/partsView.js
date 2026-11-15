import { api } from '../api.js';
import { showNewPartModal, showIssuePartModal, showRestockModal } from './partsModals.js';

export async function renderParts(container) {
  container.innerHTML = '<div class="text-center py-12 text-slate-400"><i class="fa-solid fa-spinner fa-spin text-2xl text-amber-600"></i><p class="mt-2 text-sm">Loading spare parts inventory...</p></div>';
  const res = await api.get('/parts');
  const allParts = res.data || [];
  const lowStockCount = allParts.filter(p => p.stock_quantity <= p.min_stock_alert).length;

  container.innerHTML = `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Spare Parts & Warehouse Bins</h2>
          <p class="text-sm text-slate-500">Genuine OEM parts inventory, bin/rack locations & workshop issuing desk.</p>
        </div>
        <button id="addPartBtn" class="min-h-[44px] px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-semibold flex items-center justify-center space-x-2 shadow-sm transition">
          <i class="fa-solid fa-boxes-stacked"></i>
          <span>Add Spare Part</span>
        </button>
      </div>

      <!-- KPI Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <p class="text-xs uppercase font-bold text-slate-500">Total Catalog Items</p>
          <p class="text-2xl font-black text-slate-900 mt-1">${allParts.length} Parts</p>
          <p class="text-xs text-slate-500 mt-0.5">OEM Tata Genuine</p>
        </div>
        <div class="bg-rose-50 border border-rose-200 rounded-xl p-4 shadow-xs">
          <p class="text-xs uppercase font-bold text-rose-800">Critical Low Stock</p>
          <p class="text-2xl font-black text-rose-950 mt-1">${lowStockCount} Parts</p>
          <p class="text-xs text-rose-700 font-semibold mt-0.5">Below safety reorder threshold</p>
        </div>
        <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-4 shadow-xs">
          <p class="text-xs uppercase font-bold text-emerald-800">Warehouse Utilization</p>
          <p class="text-2xl font-black text-emerald-950 mt-1">4 Active Racks</p>
          <p class="text-xs text-emerald-700 font-semibold mt-0.5">Rack A, B, C, D & EV Bay</p>
        </div>
      </div>

      <!-- Search & Category Filter -->
      <div class="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div class="relative w-full sm:w-80">
          <i class="fa-solid fa-magnifying-glass absolute left-3 top-3 text-slate-400 text-xs"></i>
          <input type="text" id="partSearchInput" placeholder="Search by part #, name, or rack..." class="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-amber-500">
        </div>
        <div class="flex items-center gap-2 w-full sm:w-auto">
          <span class="text-xs font-semibold text-slate-500">Category:</span>
          <select id="partCategoryFilter" class="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none">
            <option value="ALL">All Categories</option>
            <option value="LUBRICANTS">Lubricants</option>
            <option value="BRAKES">Brakes</option>
            <option value="FILTERS">Filters</option>
            <option value="ELECTRICAL_EV">EV & Electrical</option>
            <option value="ACCESSORIES">Accessories</option>
          </select>
        </div>
      </div>

      <!-- Table -->
      <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div class="table-responsive">
          <table class="w-full text-left text-sm text-slate-700">
            <thead class="text-xs uppercase bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th class="py-3 px-4 font-semibold">Part Number</th>
                <th class="py-3 px-4 font-semibold">Description</th>
                <th class="py-3 px-4 font-semibold">Rack / Bin</th>
                <th class="py-3 px-4 font-semibold">Stock on Hand</th>
                <th class="py-3 px-4 font-semibold">Unit Price</th>
                <th class="py-3 px-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody id="partsTableBody" class="divide-y divide-slate-100"></tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  function renderRows(parts) {
    const tbody = document.getElementById('partsTableBody');
    if (!tbody) return;
    if (parts.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="py-6 text-center text-slate-400">No matching spare parts.</td></tr>';
      return;
    }
    tbody.innerHTML = parts.map(p => `
      <tr class="hover:bg-slate-50/80 transition">
        <td class="py-3 px-4 font-mono font-bold text-amber-800 text-xs">${p.part_number}</td>
        <td class="py-3 px-4 font-semibold text-slate-900">
          ${p.part_name}<br>
          <span class="text-xs font-normal text-slate-500">${p.compatibility || 'Universal'}</span>
        </td>
        <td class="py-3 px-4"><span class="px-2 py-0.5 rounded text-xs font-mono bg-slate-100 text-slate-700 border border-slate-200">${p.bin_location}</span></td>
        <td class="py-3 px-4">
          <span class="font-bold ${p.stock_quantity <= p.min_stock_alert ? 'text-rose-600' : 'text-emerald-700'}">${p.stock_quantity} Units</span>
          ${p.stock_quantity <= p.min_stock_alert ? '<span class="ml-1.5 text-[10px] bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.5 rounded font-bold">REORDER</span>' : ''}
        </td>
        <td class="py-3 px-4 font-mono font-semibold text-slate-900">₹${parseFloat(p.unit_price).toLocaleString('en-IN')}</td>
        <td class="py-3 px-4 text-right space-x-1 whitespace-nowrap">
          <button class="issue-part-btn min-h-[32px] px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-semibold rounded transition shadow-2xs" data-json="${encodeURIComponent(JSON.stringify(p))}" ${p.stock_quantity <= 0 ? 'disabled' : ''}>
            <i class="fa-solid fa-arrow-right-arrow-left text-[10px] mr-1"></i> Issue to Job Card
          </button>
          <button class="restock-part-btn min-h-[32px] px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-semibold rounded transition shadow-2xs" data-json="${encodeURIComponent(JSON.stringify(p))}">
            <i class="fa-solid fa-plus text-[10px]"></i>
          </button>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.issue-part-btn').forEach(btn => {
      btn.onclick = () => {
        const part = JSON.parse(decodeURIComponent(btn.dataset.json));
        showIssuePartModal(part, () => renderParts(container));
      };
    });

    tbody.querySelectorAll('.restock-part-btn').forEach(btn => {
      btn.onclick = () => {
        const part = JSON.parse(decodeURIComponent(btn.dataset.json));
        showRestockModal(part, () => renderParts(container));
      };
    });
  }

  function filterParts() {
    const q = (document.getElementById('partSearchInput')?.value || '').toLowerCase();
    const cat = document.getElementById('partCategoryFilter')?.value || 'ALL';
    const filtered = allParts.filter(p => {
      const matchQ = (p.part_number || '').toLowerCase().includes(q) || (p.part_name || '').toLowerCase().includes(q) || (p.bin_location || '').toLowerCase().includes(q);
      const matchCat = cat === 'ALL' || p.category === cat;
      return matchQ && matchCat;
    });
    renderRows(filtered);
  }

  renderRows(allParts);
  document.getElementById('partSearchInput')?.addEventListener('input', filterParts);
  document.getElementById('partCategoryFilter')?.addEventListener('change', filterParts);
  document.getElementById('addPartBtn')?.addEventListener('click', () => showNewPartModal(() => renderParts(container)));
}