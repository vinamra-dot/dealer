import { api } from '../api.js';
import { printTaxInvoice } from '../utils/printDocument.js';

export async function renderBookings(container) {
  container.innerHTML = '<div class="text-center py-12 text-slate-400"><i class="fa-solid fa-spinner fa-spin text-2xl text-cyan-600"></i><p class="mt-2 text-sm">Loading bookings...</p></div>';
  const res = await api.get('/bookings');
  const bookings = res.data || [];

  container.innerHTML = `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Vehicle Bookings & OTF Allocation</h2>
          <p class="text-sm text-slate-500">Order Transfer Form (OTF) punching, chassis assignment, swapping & invoice printing.</p>
        </div>
        <button id="punchOtfBtn" class="min-h-[44px] px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-semibold flex items-center justify-center space-x-2 shadow-sm transition">
          <i class="fa-solid fa-stamp"></i>
          <span>Punch New OTF Booking</span>
        </button>
      </div>

      <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div class="table-responsive">
          <table class="w-full text-left text-sm text-slate-700">
            <thead class="text-xs uppercase bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th class="py-3 px-4 font-semibold">OTF Number</th>
                <th class="py-3 px-4 font-semibold">Customer</th>
                <th class="py-3 px-4 font-semibold">Assigned Chassis / VIN</th>
                <th class="py-3 px-4 font-semibold">Deposit</th>
                <th class="py-3 px-4 font-semibold">Status</th>
                <th class="py-3 px-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${bookings.length === 0 ? '<tr><td colspan="6" class="py-6 text-center text-slate-400">No active bookings found.</td></tr>' : ''}
              ${bookings.map(b => `
                <tr class="hover:bg-slate-50/80 transition">
                  <td class="py-3 px-4 font-mono font-bold text-cyan-700">${b.otf_number}</td>
                  <td class="py-3 px-4 font-semibold text-slate-900">${b.customer_name}<br><span class="text-xs text-slate-500 font-mono">${b.customer_phone}</span></td>
                  <td class="py-3 px-4 font-medium text-slate-900">
                    ${b.vehicle_model || 'Unallocated'}<br>
                    <span class="text-xs font-mono text-emerald-600">${b.vin ? 'VIN: ' + b.vin : 'No VIN'}</span>
                  </td>
                  <td class="py-3 px-4 font-mono font-medium">₹${parseFloat(b.booking_amount).toLocaleString('en-IN')}</td>
                  <td class="py-3 px-4">
                    <span class="px-2.5 py-1 rounded-full text-xs font-semibold ${
                      b.booking_status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      b.booking_status === 'CANCELLED' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                      'bg-cyan-50 text-cyan-700 border border-cyan-200'
                    }">${b.booking_status}</span>
                  </td>
                  <td class="py-3 px-4 text-right space-x-1">
                    <button class="print-inv-btn min-h-[32px] px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded border border-blue-200 transition" data-json="${encodeURIComponent(JSON.stringify(b))}">
                      <i class="fa-solid fa-print"></i> Invoice
                    </button>
                    ${b.booking_status !== 'DELIVERED' && b.booking_status !== 'CANCELLED' ? `
                      <button class="advance-bk-btn min-h-[32px] px-2 py-1 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-medium rounded transition" data-id="${b.id}" data-status="${b.booking_status}">
                        Advance
                      </button>
                      <button class="swap-bk-btn min-h-[32px] px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded border border-slate-300 transition" data-id="${b.id}">
                        Swap
                      </button>
                      <button class="cancel-bk-btn min-h-[32px] px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-medium rounded border border-rose-200 transition" data-id="${b.id}">
                        Cancel
                      </button>
                    ` : ''}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  document.querySelectorAll('.print-inv-btn').forEach(b => {
    b.onclick = () => printTaxInvoice(JSON.parse(decodeURIComponent(b.dataset.json)));
  });

  document.querySelectorAll('.advance-bk-btn').forEach(btn => {
    btn.onclick = async () => {
      const stages = ['ALLOCATED', 'INVOICED', 'RTO_PROCESSED', 'READY_FOR_DELIVERY', 'DELIVERED'];
      const nextStage = stages[stages.indexOf(btn.dataset.status) + 1] || 'DELIVERED';
      await api.patch(`/bookings/${btn.dataset.id}/status`, { booking_status: nextStage });
      renderBookings(container);
    };
  });

  document.querySelectorAll('.swap-bk-btn').forEach(btn => {
    btn.onclick = async () => {
      const vehRes = await api.get('/vehicles?status=AVAILABLE');
      const freeVehicles = vehRes.data || [];
      if (freeVehicles.length === 0) return alert('No free vehicles in stockyard to swap.');

      const newId = prompt(`Select New Vehicle to Swap:\n${freeVehicles.map(v => `${v.id} (${v.model} ${v.color} - VIN: ${v.vin})`).join('\n')}`, freeVehicles[0].id);
      if (newId) {
        await api.post(`/bookings/${btn.dataset.id}/swap-chassis`, { new_vehicle_id: newId });
        alert('Chassis successfully swapped! Old vehicle returned to yard pool.');
        renderBookings(container);
      }
    };
  });

  document.querySelectorAll('.cancel-bk-btn').forEach(btn => {
    btn.onclick = async () => {
      if (confirm('Cancel this booking, deduct ₹2,000 cancellation fee & release vehicle?')) {
        await api.post(`/bookings/${btn.dataset.id}/cancel`, { cancellation_reason: 'Customer requested cancellation' });
        renderBookings(container);
      }
    };
  });

  document.getElementById('punchOtfBtn')?.addEventListener('click', () => showBookingModal(container));
}

async function showBookingModal(container) {
  const modal = document.getElementById('appModal');
  const content = document.getElementById('modalContent');
  const [leadsRes, vehRes] = await Promise.all([api.get('/leads'), api.get('/vehicles?status=AVAILABLE')]);
  const leads = leadsRes.data || [];
  const vehicles = vehRes.data || [];

  content.innerHTML = `
    <div class="flex items-center justify-between pb-3 border-b border-slate-200">
      <h3 class="text-lg font-bold text-slate-900">Punch OTF Booking</h3>
      <button id="closeModal" class="text-slate-400 hover:text-slate-600 p-2"><i class="fa-solid fa-xmark text-lg"></i></button>
    </div>
    <form id="bkForm" class="space-y-4">
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Select Customer Lead *</label>
        <select id="bkLead" required class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none">
          ${leads.map(l => `<option value="${l.id}">${l.customer_name} - ${l.phone}</option>`).join('')}
        </select>
      </div>
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Available Vehicle (Chassis / VIN) *</label>
        <select id="bkVehicle" required class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none">
          ${vehicles.map(v => `<option value="${v.id}">${v.model} (${v.color}) - VIN: ${v.vin}</option>`).join('')}
        </select>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Deposit (₹) *</label>
          <input type="number" id="bkAmount" value="21000" required class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm font-mono focus:outline-none">
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">ETA Delivery</label>
          <input type="date" id="bkEta" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none">
        </div>
      </div>
      <button type="submit" class="w-full min-h-[44px] bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg text-sm transition shadow-sm">Allot Chassis & Confirm Booking</button>
    </form>
  `;

  modal.classList.remove('hidden');
  document.getElementById('closeModal').onclick = () => modal.classList.add('hidden');
  document.getElementById('bkForm').onsubmit = async (e) => {
    e.preventDefault();
    await api.post('/bookings/punch-otf', {
      lead_id: document.getElementById('bkLead').value,
      vehicle_id: document.getElementById('bkVehicle').value,
      booking_amount: document.getElementById('bkAmount').value,
      eta_date: document.getElementById('bkEta').value || null
    });
    modal.classList.add('hidden');
    renderBookings(container);
  };
}
