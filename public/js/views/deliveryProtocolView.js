import { api } from '../api.js';

export async function renderDeliveryProtocol(container) {
  container.innerHTML = '<div class="text-center py-12 text-slate-400"><i class="fa-solid fa-spinner fa-spin text-2xl text-emerald-600"></i><p class="mt-2 text-sm">Loading delivery handovers...</p></div>';
  const [dhRes, bkRes] = await Promise.all([
    api.get('/delivery'),
    api.get('/bookings')
  ]);
  const handovers = dhRes.data || [];
  const readyBookings = (bkRes.data || []).filter(b => b.booking_status === 'READY_FOR_DELIVERY' || b.booking_status === 'RTO_PROCESSED');

  container.innerHTML = `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-slate-900 tracking-tight">VIP Handover & Customer CSI Protocol</h2>
          <p class="text-sm text-slate-500">Zero-balance ledger verification, physical vehicle checklist & 10-point CSI audit.</p>
        </div>
        <button id="vipHandoverBtn" class="min-h-[44px] px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold flex items-center justify-center space-x-2 shadow-sm transition">
          <i class="fa-solid fa-champagne-glasses"></i>
          <span>Execute VIP Handover</span>
        </button>
      </div>

      <!-- Protocol Summary Table -->
      <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <h3 class="text-base font-bold text-slate-900 mb-4">Completed Delivery Handover Audit Logs</h3>
        <div class="table-responsive">
          <table class="w-full text-left text-sm text-slate-700">
            <thead class="text-xs uppercase bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th class="py-3 px-4 font-semibold">OTF Booking</th>
                <th class="py-3 px-4 font-semibold">Customer</th>
                <th class="py-3 px-4 font-semibold">Handover Vehicle / VIN</th>
                <th class="py-3 px-4 font-semibold">Ledger Zero</th>
                <th class="py-3 px-4 font-semibold">Physical Checklist</th>
                <th class="py-3 px-4 font-semibold">CSI Rating</th>
                <th class="py-3 px-4 font-semibold">Delivered At</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${handovers.length === 0 ? '<tr><td colspan="7" class="py-6 text-center text-slate-400">No VIP delivery handovers recorded yet.</td></tr>' : ''}
              ${handovers.map(h => `
                <tr class="hover:bg-slate-50/80 transition">
                  <td class="py-3 px-4 font-mono font-bold text-cyan-700">${h.otf_number}</td>
                  <td class="py-3 px-4 font-semibold text-slate-900">${h.customer_name}<br><span class="text-xs text-slate-500 font-mono">${h.customer_phone}</span></td>
                  <td class="py-3 px-4 font-medium text-slate-900">${h.model} <span class="text-xs text-slate-500">(${h.color})</span><br><span class="text-xs font-mono text-slate-400">VIN: ${h.vin}</span></td>
                  <td class="py-3 px-4 text-emerald-700 font-semibold text-xs"><i class="fa-solid fa-circle-check"></i> Cleared</td>
                  <td class="py-3 px-4 text-xs text-slate-600">✔ 2 Smart Keys<br>✔ Jack & Tool Kit<br>✔ Fastag Affixed</td>
                  <td class="py-3 px-4 font-bold text-emerald-700 text-sm"><span class="bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-mono">${h.csi_rating} / 10 ★</span></td>
                  <td class="py-3 px-4 text-xs font-mono text-slate-500">${new Date(h.created_at).toLocaleDateString('en-IN')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  document.getElementById('vipHandoverBtn')?.addEventListener('click', () => showHandoverModal(readyBookings));
}

function showHandoverModal(readyBookings) {
  const modal = document.getElementById('appModal');
  const content = document.getElementById('modalContent');
  if (readyBookings.length === 0) return alert('No vehicle bookings are currently at READY_FOR_DELIVERY stage.');

  content.innerHTML = `
    <div class="flex items-center justify-between pb-3 border-b border-slate-200">
      <h3 class="text-lg font-bold text-slate-900">VIP Vehicle Handover Protocol</h3>
      <button id="closeModal" class="text-slate-400 hover:text-slate-600 p-2"><i class="fa-solid fa-xmark text-lg"></i></button>
    </div>
    <form id="handoverForm" class="space-y-4">
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Select Ready Booking *</label>
        <select id="hoBk" required class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none">
          ${readyBookings.map(b => `<option value="${b.id}">${b.otf_number} - ${b.customer_name} (${b.vehicle_model})</option>`).join('')}
        </select>
      </div>
      <div class="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-xs text-slate-700">
        <p class="font-bold text-slate-900 uppercase text-[10px] tracking-wider">Mandatory Handover Signoffs:</p>
        <label class="flex items-center space-x-2"><input type="checkbox" checked required class="w-4 h-4 text-emerald-600"> <span>Accounts Zero Ledger Balance Verified</span></label>
        <label class="flex items-center space-x-2"><input type="checkbox" checked required class="w-4 h-4 text-emerald-600"> <span>2 Original Smart Keys Handed Over</span></label>
        <label class="flex items-center space-x-2"><input type="checkbox" checked required class="w-4 h-4 text-emerald-600"> <span>Spare Wheel, Jack & Tool Kit Present</span></label>
        <label class="flex items-center space-x-2"><input type="checkbox" checked required class="w-4 h-4 text-emerald-600"> <span>Active Fastag Affixed on Windshield</span></label>
      </div>
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Customer CSI Rating (1 to 10) *</label>
        <input type="number" min="1" max="10" id="hoRating" value="10" required class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm font-mono focus:outline-none">
      </div>
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Ceremony Remarks</label>
        <input type="text" id="hoNotes" value="Delightful delivery ceremony with customer family." class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none">
      </div>
      <button type="submit" class="w-full min-h-[44px] bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-sm transition shadow-sm">Authorize Keys Handover & Close Order</button>
    </form>
  `;

  modal.classList.remove('hidden');
  document.getElementById('closeModal').onclick = () => modal.classList.add('hidden');

  document.getElementById('handoverForm').onsubmit = async (e) => {
    e.preventDefault();
    await api.post('/delivery/complete-vip', {
      booking_id: document.getElementById('hoBk').value,
      csi_rating: document.getElementById('hoRating').value,
      customer_remarks: document.getElementById('hoNotes').value
    });
    modal.classList.add('hidden');
    renderDeliveryProtocol(document.getElementById('viewContainer'));
  };
}
