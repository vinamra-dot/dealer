import { api } from '../api.js';

export function showNewPartModal(onSuccess) {
  const modal = document.getElementById('appModal');
  const content = document.getElementById('modalContent');

  content.innerHTML = `
    <div class="flex items-center justify-between pb-3 border-b border-slate-200">
      <h3 class="text-base font-bold text-slate-900">Add Spare Part to Warehouse Catalog</h3>
      <button id="closeModal" class="text-slate-400 hover:text-slate-600 p-2"><i class="fa-solid fa-xmark text-lg"></i></button>
    </div>
    <form id="partForm" class="space-y-4 mt-2">
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">OEM Part Number *</label>
          <input type="text" id="pNumber" required class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm font-mono uppercase focus:outline-none focus:border-amber-500" placeholder="e.g. TM-BRK-FRT-02">
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
          <select id="pCategory" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-amber-500">
            <option value="LUBRICANTS">Lubricants & Oils</option>
            <option value="BRAKES">Brakes & Suspension</option>
            <option value="FILTERS">Filters & Service Kits</option>
            <option value="ELECTRICAL_EV">EV Batteries & Electrical</option>
            <option value="ACCESSORIES">Genuine Accessories</option>
          </select>
        </div>
      </div>
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Part Description / Name *</label>
        <input type="text" id="pName" required class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-amber-500" placeholder="e.g. Front Disc Rotor Pair">
      </div>
      <div class="grid grid-cols-3 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Bin / Rack *</label>
          <input type="text" id="pBin" required class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm font-mono focus:outline-none focus:border-amber-500" placeholder="RACK-B-04">
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Initial Stock *</label>
          <input type="number" id="pQty" value="10" required class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm font-mono focus:outline-none focus:border-amber-500">
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Unit Price (₹) *</label>
          <input type="number" id="pPrice" value="1800" required class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm font-mono focus:outline-none focus:border-amber-500">
        </div>
      </div>
      <button type="submit" class="w-full min-h-[44px] bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg text-sm transition shadow-sm">Save Part to Bin</button>
    </form>
  `;

  modal.classList.remove('hidden');
  document.getElementById('closeModal').onclick = () => modal.classList.add('hidden');
  document.getElementById('partForm').onsubmit = async (e) => {
    e.preventDefault();
    await api.post('/parts', {
      part_number: document.getElementById('pNumber').value,
      part_name: document.getElementById('pName').value,
      category: document.getElementById('pCategory').value,
      bin_location: document.getElementById('pBin').value,
      stock_quantity: document.getElementById('pQty').value,
      unit_price: document.getElementById('pPrice').value
    });
    modal.classList.add('hidden');
    onSuccess();
  };
}