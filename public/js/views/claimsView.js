import { api } from '../api.js';

export async function renderClaims(container) {
  container.innerHTML = '<div class="text-center py-12 text-slate-400"><i class="fa-solid fa-spinner fa-spin text-2xl text-rose-600"></i><p class="mt-2 text-sm">Loading OEM claims pipeline...</p></div>';
  const res = await api.get('/claims');
  const claims = res.data || [];
  const totalAmount = claims.reduce((acc, c) => acc + parseFloat(c.amount || 0), 0);

  container.innerHTML = `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-slate-900 tracking-tight">OEM Incentive Recovery & Claims Desk</h2>
          <p class="text-sm text-slate-500">Automated submission of retail, exchange, corporate & festive scheme claims to OEM.</p>
        </div>
        <button id="autoClaimBtn" class="min-h-[44px] px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-semibold flex items-center justify-center space-x-2 shadow-sm transition">
          <i class="fa-solid fa-wand-magic-sparkles"></i>
          <span>Auto-Compile Claims for Booking</span>
        </button>
      </div>

      <!-- Overview Banner (Clean Light Theme) -->
      <div class="bg-gradient-to-r from-rose-50 via-white to-white border border-rose-200 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div>
          <p class="text-xs uppercase tracking-wider text-rose-700 font-bold">Total Recoverable OEM Subsidies</p>
          <p class="text-3xl font-extrabold text-slate-900 mt-1">₹${totalAmount.toLocaleString('en-IN')}</p>
        </div>
        <div class="text-xs text-slate-500 max-w-sm">
          Claims are verified against sales invoices to prevent margin erosion and ensure 100% manufacturer reimbursement recovery.
        </div>
      </div>

      <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div class="table-responsive">
          <table class="w-full text-left text-sm text-slate-700">
            <thead class="text-xs uppercase bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th class="py-3 px-4 font-semibold">Claim Ref</th>
                <th class="py-3 px-4 font-semibold">Booking / OTF</th>
                <th class="py-3 px-4 font-semibold">Customer</th>
                <th class="py-3 px-4 font-semibold">Claim Scheme Type</th>
                <th class="py-3 px-4 font-semibold">Amount</th>
                <th class="py-3 px-4 font-semibold">OEM Submission</th>
                <th class="py-3 px-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${claims.length === 0 ? '<tr><td colspan="7" class="py-6 text-center text-slate-400">No OEM claims generated yet. Auto-compile for a booking above.</td></tr>' : ''}
              ${claims.map(c => `
                <tr class="hover:bg-slate-50/80 transition">
                  <td class="py-3 px-4 font-mono font-bold text-rose-700 text-xs">${c.claim_reference_no || c.id}</td>
                  <td class="py-3 px-4 font-mono text-slate-600">${c.otf_number}</td>
                  <td class="py-3 px-4 font-semibold text-slate-900">${c.customer_name}</td>
                  <td class="py-3 px-4 font-medium text-slate-800">${c.claim_type.replace(/_/g, ' ')}</td>
                  <td class="py-3 px-4 font-bold text-slate-900 font-mono">₹${parseFloat(c.amount).toLocaleString('en-IN')}</td>
                  <td class="py-3 px-4">
                    <span class="px-2.5 py-1 rounded-full text-xs font-semibold ${
                      c.submission_status === 'SETTLED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }">${c.submission_status}</span>
                  </td>
                  <td class="py-3 px-4 text-right">
                    ${c.submission_status !== 'SETTLED' ? `
                      <button class="settle-btn min-h-[36px] px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded transition shadow-2xs" data-id="${c.id}">
                        Mark Settled
                      </button>
                    ` : '<span class="text-xs text-slate-400 font-medium">Reimbursed</span>'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  document.querySelectorAll('.settle-btn').forEach(btn => {
    btn.onclick = async () => {
      await api.patch(`/claims/${btn.dataset.id}/status`, { submission_status: 'SETTLED' });
      renderClaims(container);
    };
  });

  document.getElementById('autoClaimBtn')?.addEventListener('click', () => showAutoClaimModal());
}

async function showAutoClaimModal() {
  const modal = document.getElementById('appModal');
  const content = document.getElementById('modalContent');
  const bkRes = await api.get('/bookings');
  const bookings = bkRes.data || [];

  content.innerHTML = `
    <div class="flex items-center justify-between pb-3 border-b border-slate-200">
      <h3 class="text-lg font-bold text-slate-900">Auto-Compile OEM Claims</h3>
      <button id="closeModal" class="text-slate-400 hover:text-slate-600 p-2"><i class="fa-solid fa-xmark text-lg"></i></button>
    </div>
    <form id="claimForm" class="space-y-4">
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Select Customer Booking *</label>
        <select id="claimBk" required class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-rose-500">
          ${bookings.map(b => `<option value="${b.id}">${b.otf_number} - ${b.customer_name} (${b.vehicle_model})</option>`).join('')}
        </select>
      </div>
      <div class="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1">
        <p class="font-semibold text-slate-900">Incentives automatically created:</p>
        <p>1. Retail Target Incentive: ₹25,000</p>
        <p>2. Exchange Bonus Scheme: ₹20,000</p>
        <p>3. Corporate Scheme Claim: ₹10,000</p>
      </div>
      <button type="submit" class="w-full min-h-[44px] bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg text-sm transition shadow-sm">Compile & Submit Claims</button>
    </form>
  `;

  modal.classList.remove('hidden');
  document.getElementById('closeModal').onclick = () => modal.classList.add('hidden');

  document.getElementById('claimForm').onsubmit = async (e) => {
    e.preventDefault();
    await api.post('/claims/auto-generate', {
      booking_id: document.getElementById('claimBk').value
    });
    modal.classList.add('hidden');
    renderClaims(document.getElementById('viewContainer'));
  };
}
