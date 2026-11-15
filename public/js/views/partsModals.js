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

export async function showIssuePartModal(part, onSuccess) {
  const modal = document.getElementById('appModal');
  const content = document.getElementById('modalContent');
  const jcRes = await api.get('/workshop/jobs');
  const jobs = jcRes.data || [];

  content.innerHTML = `
    <div class="flex items-center justify-between pb-3 border-b border-slate-200">
      <div>
        <h3 class="text-base font-bold text-slate-900">Issue Part to Workshop Job Card</h3>
        <p class="text-xs text-slate-500">${part.part_name} (${part.part_number})</p>
      </div>
      <button id="closeModal" class="text-slate-400 hover:text-slate-600 p-2"><i class="fa-solid fa-xmark text-lg"></i></button>
    </div>
    <form id="issuePartForm" class="space-y-4 mt-2">
      <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between">
        <div>
          <span class="text-slate-500 block">Warehouse Bin:</span>
          <span class="font-bold font-mono text-slate-900">${part.bin_location}</span>
        </div>
        <div>
          <span class="text-slate-500 block">Available Stock:</span>
          <span class="font-bold text-emerald-700">${part.stock_quantity} Units</span>
        </div>
        <div>
          <span class="text-slate-500 block">Unit Price:</span>
          <span class="font-bold font-mono text-slate-900">₹${parseFloat(part.unit_price).toLocaleString('en-IN')}</span>
        </div>
      </div>
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Select Workshop Job Card *</label>
        <select id="issueJc" required class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-amber-500">
          ${jobs.map(j => `<option value="${j.job_card_number}">${j.job_card_number} — ${j.vehicle_model} (${j.reg_number})</option>`).join('')}
        </select>
      </div>
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Quantity to Issue *</label>
        <input type="number" id="issueQty" value="1" min="1" max="${part.stock_quantity}" required class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm font-mono focus:outline-none focus:border-amber-500">
      </div>
      <button type="submit" class="w-full min-h-[44px] bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg text-sm transition shadow-sm">
        <i class="fa-solid fa-arrow-right-arrow-left mr-1.5"></i> Confirm Issue & Update Stock
      </button>
    </form>
  `;

  modal.classList.remove('hidden');
  document.getElementById('closeModal').onclick = () => modal.classList.add('hidden');
  document.getElementById('issuePartForm').onsubmit = async (e) => {
    e.preventDefault();
    const qty = parseInt(document.getElementById('issueQty').value || 1);
    const jc = document.getElementById('issueJc').value;
    const res = await api.patch(`/parts/${part.id}/issue`, { quantity: qty });
    modal.classList.add('hidden');
    alert(`Successfully issued ${qty} unit(s) of ${part.part_name} to Job Card #${jc}!\nRemaining Stock in ${part.bin_location}: ${res.data.stock_quantity} units.`);
    onSuccess();
  };
}

export function showRestockModal(part, onSuccess) {
  const modal = document.getElementById('appModal');
  const content = document.getElementById('modalContent');

  content.innerHTML = `
    <div class="flex items-center justify-between pb-3 border-b border-slate-200">
      <div>
        <h3 class="text-base font-bold text-slate-900">Receive OEM Shipment / Restock</h3>
        <p class="text-xs text-slate-500">${part.part_name} (${part.part_number})</p>
      </div>
      <button id="closeModal" class="text-slate-400 hover:text-slate-600 p-2"><i class="fa-solid fa-xmark text-lg"></i></button>
    </div>
    <form id="restockForm" class="space-y-4 mt-2">
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Quantity Received from OEM *</label>
        <input type="number" id="restockQty" value="10" min="1" required class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm font-mono focus:outline-none focus:border-emerald-500">
      </div>
      <button type="submit" class="w-full min-h-[44px] bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-sm transition shadow-sm">
        <i class="fa-solid fa-plus-circle mr-1.5"></i> Update Bin Stock
      </button>
    </form>
  `;

  modal.classList.remove('hidden');
  document.getElementById('closeModal').onclick = () => modal.classList.add('hidden');
  document.getElementById('restockForm').onsubmit = async (e) => {
    e.preventDefault();
    const qty = parseInt(document.getElementById('restockQty').value || 1);
    const res = await api.patch(`/parts/${part.id}/restock`, { quantity: qty });
    modal.classList.add('hidden');
    alert(`Successfully added ${qty} units to ${part.part_name}!\nNew Stock in ${part.bin_location}: ${res.data.stock_quantity} units.`);
    onSuccess();
  };
}