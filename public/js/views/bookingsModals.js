import { api } from '../api.js';

export async function showBookingModal(onSuccess) {
  const modal = document.getElementById('appModal');
  const content = document.getElementById('modalContent');
  const [leadsRes, vehRes] = await Promise.all([api.get('/leads'), api.get('/vehicles?status=AVAILABLE')]);
  const leads = leadsRes.data || [];
  const vehicles = vehRes.data || [];

  content.innerHTML = `
    <div class="flex items-center justify-between pb-3 border-b border-slate-200">
      <h3 class="text-base font-bold text-slate-900">Punch OTF Vehicle Booking</h3>
      <button id="closeModal" class="text-slate-400 hover:text-slate-600 p-2"><i class="fa-solid fa-xmark text-lg"></i></button>
    </div>
    <form id="bkForm" class="space-y-4 mt-2">
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Select Customer Lead *</label>
        <select id="bkLead" required class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-cyan-500">
          ${leads.map(l => `<option value="${l.id}">${l.customer_name} - ${l.phone}</option>`).join('')}
        </select>
      </div>
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Available Vehicle (Chassis / VIN) *</label>
        <select id="bkVehicle" required class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-cyan-500">
          ${vehicles.map(v => `<option value="${v.id}">${v.model} (${v.color}) - VIN: ${v.vin}</option>`).join('')}
        </select>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Token Deposit (₹) *</label>
          <input type="number" id="bkAmount" value="21000" required class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm font-mono focus:outline-none focus:border-cyan-500">
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">ETA Delivery Date</label>
          <input type="date" id="bkEta" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-cyan-500">
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
    onSuccess();
  };
}

export function showPaymentQrModal(booking, onSuccess) {
  const modal = document.getElementById('appModal');
  const content = document.getElementById('modalContent');
  const amount = parseFloat(booking.booking_amount || 21000);
  const upiUrl = `upi://pay?pa=apexmotors@hdfcbank&pn=ApexMobilityMotors&am=${amount}&cu=INR&tn=OTF_${booking.otf_number}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiUrl)}`;

  content.innerHTML = `
    <div class="flex items-center justify-between pb-3 border-b border-slate-200">
      <div>
        <h3 class="text-base font-bold text-slate-900">Instant UPI Payment Intent</h3>
        <p class="text-xs text-slate-500">OTF #${booking.otf_number} • ${booking.customer_name}</p>
      </div>
      <button id="closeModal" class="text-slate-400 hover:text-slate-600 p-2"><i class="fa-solid fa-xmark text-lg"></i></button>
    </div>
    <div class="flex flex-col items-center py-4 space-y-4">
      <div class="p-3 bg-white border border-slate-300 rounded-2xl shadow-sm">
        <img src="${qrUrl}" alt="UPI QR Code" class="w-48 h-48 rounded-lg">
      </div>
      <div class="text-center">
        <p class="text-xs uppercase font-bold text-slate-500 tracking-wider">Scan to Pay via Any UPI App</p>
        <p class="text-2xl font-black text-slate-900 mt-1">₹${amount.toLocaleString('en-IN')}</p>
        <p class="text-xs text-slate-500 font-mono mt-1">VPA: apexmotors@hdfcbank</p>
      </div>
      <div class="flex gap-2 w-full pt-2">
        <a href="${upiUrl}" class="flex-1 min-h-[44px] bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg text-xs flex items-center justify-center border border-slate-300 transition">
          <i class="fa-solid fa-mobile-screen mr-1.5"></i> Open UPI App
        </a>
        <button id="confirmPayBtn" class="flex-1 min-h-[44px] bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs flex items-center justify-center transition shadow-sm">
          <i class="fa-solid fa-check-circle mr-1.5"></i> Mark Token Received
        </button>
      </div>
    </div>
  `;

  modal.classList.remove('hidden');
  document.getElementById('closeModal').onclick = () => modal.classList.add('hidden');
  document.getElementById('confirmPayBtn').onclick = () => {
    alert(`Token deposit of ₹${amount.toLocaleString('en-IN')} recorded successfully!`);
    modal.classList.add('hidden');
    onSuccess();
  };
}