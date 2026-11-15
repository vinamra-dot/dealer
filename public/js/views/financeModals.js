import { api } from '../api.js';

export async function showPaymentModal(onSuccess) {
  const modal = document.getElementById('appModal');
  const content = document.getElementById('modalContent');
  const bkRes = await api.get('/bookings');
  const bookings = bkRes.data || [];

  content.innerHTML = `
    <div class="flex items-center justify-between pb-3 border-b border-slate-200">
      <h3 class="text-lg font-bold text-slate-900">Record Customer Downpayment</h3>
      <button id="closeModal" class="text-slate-400 hover:text-slate-600 p-2"><i class="fa-solid fa-xmark text-lg"></i></button>
    </div>
    <form id="payForm" class="space-y-4">
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Select Active Booking *</label>
        <select id="payBk" required class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-indigo-500">
          ${bookings.map(b => `<option value="${b.id}">${b.otf_number} - ${b.customer_name} (${b.vehicle_model})</option>`).join('')}
        </select>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Payment Amount (₹) *</label>
          <input type="number" id="payAmount" value="250000" required class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm font-mono focus:outline-none focus:border-indigo-500">
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Payment Mode</label>
          <select id="payMethod" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-indigo-500">
            <option value="UPI">UPI Instant</option>
            <option value="NEFT">NEFT / RTGS</option>
            <option value="CHEQUE">Banker's Cheque</option>
            <option value="CARD">POS Card Terminal</option>
          </select>
        </div>
      </div>
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Transaction / UTR Reference</label>
        <input type="text" id="payRef" placeholder="e.g. UTR-9821839210" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm font-mono focus:outline-none focus:border-indigo-500">
      </div>
      <button type="submit" class="w-full min-h-[44px] bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm transition shadow-sm">Generate Receipt & Post to Ledger</button>
    </form>
  `;

  modal.classList.remove('hidden');
  document.getElementById('closeModal').onclick = () => modal.classList.add('hidden');

  document.getElementById('payForm').onsubmit = async (e) => {
    e.preventDefault();
    await api.post('/finance/record-payment', {
      booking_id: document.getElementById('payBk').value,
      amount: document.getElementById('payAmount').value,
      payment_type: 'DOWNPAYMENT',
      method: document.getElementById('payMethod').value,
      transaction_ref: document.getElementById('payRef').value,
      cashier_verified: true
    });
    modal.classList.add('hidden');
    onSuccess();
  };
}

export async function showDoModal(onSuccess) {
  const modal = document.getElementById('appModal');
  const content = document.getElementById('modalContent');
  const bkRes = await api.get('/bookings');
  const bookings = bkRes.data || [];

  content.innerHTML = `
    <div class="flex items-center justify-between pb-3 border-b border-slate-200">
      <h3 class="text-lg font-bold text-slate-900">Log Bank Delivery Order (DO)</h3>
      <button id="closeModal" class="text-slate-400 hover:text-slate-600 p-2"><i class="fa-solid fa-xmark text-lg"></i></button>
    </div>
    <form id="doForm" class="space-y-4">
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Select Booking *</label>
        <select id="doBk" required class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-blue-500">
          ${bookings.map(b => `<option value="${b.id}">${b.otf_number} - ${b.customer_name}</option>`).join('')}
        </select>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Bank Name *</label>
          <input type="text" id="doBank" value="HDFC Auto Finance" required class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-blue-500">
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Sanctioned Amount (₹) *</label>
          <input type="number" id="doAmount" value="1500000" required class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm font-mono focus:outline-none focus:border-blue-500">
        </div>
      </div>
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Bank DO Reference Number *</label>
        <input type="text" id="doNum" value="HDFC-DO-2026-904" required class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm font-mono focus:outline-none focus:border-blue-500">
      </div>
      <button type="submit" class="w-full min-h-[44px] bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg text-sm transition shadow-sm">Authorize & Clear File</button>
    </form>
  `;

  modal.classList.remove('hidden');
  document.getElementById('closeModal').onclick = () => modal.classList.add('hidden');

  document.getElementById('doForm').onsubmit = async (e) => {
    e.preventDefault();
    await api.post('/finance/record-do', {
      booking_id: document.getElementById('doBk').value,
      bank_name: document.getElementById('doBank').value,
      loan_amount: document.getElementById('doAmount').value,
      do_number: document.getElementById('doNum').value,
      do_status: 'APPROVED',
      payout_percentage: 1.50
    });
    modal.classList.add('hidden');
    onSuccess();
  };
}
