import { api } from '../api.js';
import { printTaxInvoice } from '../utils/printDocument.js';
import { getCarImage } from '../utils/carImages.js';
import { sendInvoiceWhatsApp } from '../utils/whatsapp.js';
import { showBookingModal, showPaymentQrModal } from './bookingsModals.js';

export async function renderBookings(container) {
  container.innerHTML = '<div class="text-center py-12 text-slate-400"><i class="fa-solid fa-spinner fa-spin text-2xl text-cyan-600"></i><p class="mt-2 text-sm">Loading bookings...</p></div>';
  const res = await api.get('/bookings');
  const allBookings = res.data || [];

  container.innerHTML = `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Vehicle Bookings & OTF Allocation</h2>
          <p class="text-sm text-slate-500">Order Transfer Form (OTF) punching, chassis assignment, swapping & instant token collection.</p>
        </div>
        <button id="punchOtfBtn" class="min-h-[44px] px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-semibold flex items-center justify-center space-x-2 shadow-sm transition">
          <i class="fa-solid fa-stamp"></i>
          <span>Punch New OTF Booking</span>
        </button>
      </div>

      <!-- Search Bar -->
      <div class="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
        <div class="relative w-full sm:w-80">
          <i class="fa-solid fa-magnifying-glass absolute left-3 top-3 text-slate-400 text-xs"></i>
          <input type="text" id="bkSearchInput" placeholder="Filter by OTF, customer, or chassis..." class="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-cyan-500 focus:bg-white transition">
        </div>
      </div>

      <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div class="table-responsive">
          <table class="w-full text-left text-sm text-slate-700">
            <thead class="text-xs uppercase bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th class="py-3 px-4 font-semibold">OTF</th>
                <th class="py-3 px-4 font-semibold">Customer</th>
                <th class="py-3 px-4 font-semibold">Vehicle & Chassis</th>
                <th class="py-3 px-4 font-semibold">Deposit</th>
                <th class="py-3 px-4 font-semibold">Status</th>
                <th class="py-3 px-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody id="bkTableBody" class="divide-y divide-slate-100"></tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  function renderRows(bookings) {
    const tbody = document.getElementById('bkTableBody');
    if (!tbody) return;
    if (bookings.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="py-6 text-center text-slate-400">No active bookings found.</td></tr>';
      return;
    }
    tbody.innerHTML = bookings.map(b => `
      <tr class="hover:bg-slate-50/80 transition">
        <td class="py-3 px-4 font-mono font-bold text-cyan-700 text-xs">${b.otf_number}</td>
        <td class="py-3 px-4 font-semibold text-slate-900">${b.customer_name}<br><span class="text-xs text-slate-500 font-mono">${b.customer_phone}</span></td>
        <td class="py-3 px-4 font-semibold text-slate-900 flex items-center space-x-2.5">
          <img src="${getCarImage(b.vehicle_model)}" alt="${b.vehicle_model || 'Car'}" class="w-10 h-7 object-cover rounded border border-slate-200">
          <div>
            <p class="font-bold text-slate-900 leading-tight">${b.vehicle_model || 'Unallocated'}</p>
            <p class="text-[11px] font-mono text-emerald-600">${b.vin ? 'VIN: ' + b.vin : 'Awaiting VIN'}</p>
          </div>
        </td>
        <td class="py-3 px-4 font-mono font-medium">₹${parseFloat(b.booking_amount).toLocaleString('en-IN')}</td>
        <td class="py-3 px-4">
          <span class="px-2.5 py-1 rounded-full text-xs font-semibold ${
            b.booking_status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
            b.booking_status === 'CANCELLED' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
            'bg-cyan-50 text-cyan-700 border border-cyan-200'
          }">${b.booking_status}</span>
        </td>
        <td class="py-3 px-4 text-right space-x-1 whitespace-nowrap">
          <button class="pay-qr-btn min-h-[32px] px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded border border-emerald-300 transition shadow-2xs" data-json="${encodeURIComponent(JSON.stringify(b))}">
            <i class="fa-solid fa-qrcode mr-1"></i> UPI QR
          </button>
          <button class="whatsapp-inv-btn min-h-[32px] px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded border border-slate-300 transition shadow-2xs" data-json="${encodeURIComponent(JSON.stringify(b))}">
            <i class="fa-brands fa-whatsapp text-emerald-600"></i>
          </button>
          <button class="print-inv-btn min-h-[32px] px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded border border-blue-200 transition" data-json="${encodeURIComponent(JSON.stringify(b))}">
            <i class="fa-solid fa-print"></i>
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
    `).join('');

    tbody.querySelectorAll('.pay-qr-btn').forEach(b => {
      b.onclick = () => showPaymentQrModal(JSON.parse(decodeURIComponent(b.dataset.json)), () => renderBookings(container));
    });

    tbody.querySelectorAll('.whatsapp-inv-btn').forEach(b => {
      b.onclick = () => sendInvoiceWhatsApp(JSON.parse(decodeURIComponent(b.dataset.json)));
    });

    tbody.querySelectorAll('.print-inv-btn').forEach(b => {
      b.onclick = () => printTaxInvoice(JSON.parse(decodeURIComponent(b.dataset.json)));
    });

    tbody.querySelectorAll('.advance-bk-btn').forEach(btn => {
      btn.onclick = async () => {
        const stages = ['ALLOCATED', 'INVOICED', 'RTO_PROCESSED', 'READY_FOR_DELIVERY', 'DELIVERED'];
        const nextStage = stages[stages.indexOf(btn.dataset.status) + 1] || 'DELIVERED';
        await api.patch(`/bookings/${btn.dataset.id}/status`, { booking_status: nextStage });
        renderBookings(container);
      };
    });

    tbody.querySelectorAll('.swap-bk-btn').forEach(btn => {
      btn.onclick = async () => {
        const vehRes = await api.get('/vehicles?status=AVAILABLE');
        const freeVehicles = vehRes.data || [];
        if (freeVehicles.length === 0) return alert('No free vehicles in stockyard to swap.');
        const newId = prompt(`Select New Vehicle to Swap:\n${freeVehicles.map(v => `${v.id} (${v.model} ${v.color} - VIN: ${v.vin})`).join('\n')}`, freeVehicles[0].id);
        if (newId) {
          await api.post(`/bookings/${btn.dataset.id}/swap-chassis`, { new_vehicle_id: newId });
          alert('Chassis successfully swapped!');
          renderBookings(container);
        }
      };
    });

    tbody.querySelectorAll('.cancel-bk-btn').forEach(btn => {
      btn.onclick = async () => {
        if (confirm('Cancel this booking, deduct ₹2,000 cancellation fee & release vehicle?')) {
          await api.post(`/bookings/${btn.dataset.id}/cancel`, { cancellation_reason: 'Customer requested cancellation' });
          renderBookings(container);
        }
      };
    });
  }

  function filterBookings() {
    const q = (document.getElementById('bkSearchInput')?.value || '').toLowerCase();
    const filtered = allBookings.filter(b => 
      (b.otf_number || '').toLowerCase().includes(q) ||
      (b.customer_name || '').toLowerCase().includes(q) ||
      (b.vehicle_model || '').toLowerCase().includes(q) ||
      (b.vin || '').toLowerCase().includes(q)
    );
    renderRows(filtered);
  }

  renderRows(allBookings);
  document.getElementById('bkSearchInput')?.addEventListener('input', filterBookings);
  document.getElementById('punchOtfBtn')?.addEventListener('click', () => showBookingModal(() => renderBookings(container)));
}