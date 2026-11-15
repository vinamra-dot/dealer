import { api } from '../api.js';
import { showPaymentModal, showDoModal } from './financeModals.js';

export async function renderFinance(container) {
  container.innerHTML = '<div class="text-center py-12 text-slate-400"><i class="fa-solid fa-spinner fa-spin text-2xl text-indigo-600"></i><p class="mt-2 text-sm">Loading finance & payment records...</p></div>';
  const [finRes, payRes] = await Promise.all([
    api.get('/finance/records'),
    api.get('/finance/payments')
  ]);
  const finRecords = finRes.data || [];
  const payments = payRes.data || [];

  container.innerHTML = `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Finance Desk & Payment Gateway</h2>
          <p class="text-sm text-slate-500">Multi-bank loan DO verification, downpayment receipts & dealer commission tracking.</p>
        </div>
        <div class="flex items-center gap-2">
          <button id="recordPayBtn" class="min-h-[44px] px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold flex items-center space-x-2 shadow-sm transition">
            <i class="fa-solid fa-money-bill-transfer"></i>
            <span>Record Payment</span>
          </button>
          <button id="logDoBtn" class="min-h-[44px] px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-sm font-semibold flex items-center space-x-2 transition shadow-2xs">
            <i class="fa-solid fa-file-contract"></i>
            <span>Log Bank DO</span>
          </button>
        </div>
      </div>

      <!-- Bank DO Desk Table -->
      <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
        <h3 class="text-base font-bold text-slate-900">Bank Delivery Orders (DO) & Dealer Payout</h3>
        <div class="table-responsive">
          <table class="w-full text-left text-sm text-slate-700">
            <thead class="text-xs uppercase bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th class="py-3 px-4 font-semibold">OTF Number</th>
                <th class="py-3 px-4 font-semibold">Customer</th>
                <th class="py-3 px-4 font-semibold">Lending Bank</th>
                <th class="py-3 px-4 font-semibold">Sanctioned Loan</th>
                <th class="py-3 px-4 font-semibold">DO Reference</th>
                <th class="py-3 px-4 font-semibold">Dealer Commission</th>
                <th class="py-3 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${finRecords.length === 0 ? '<tr><td colspan="7" class="py-6 text-center text-slate-400">No bank loan files logged yet.</td></tr>' : ''}
              ${finRecords.map(f => `
                <tr class="hover:bg-slate-50/80 transition">
                  <td class="py-3 px-4 font-mono font-bold text-cyan-700">${f.otf_number}</td>
                  <td class="py-3 px-4 font-semibold text-slate-900">${f.customer_name}</td>
                  <td class="py-3 px-4 font-medium text-slate-800">${f.bank_name}</td>
                  <td class="py-3 px-4 font-mono">₹${parseFloat(f.loan_amount).toLocaleString('en-IN')}</td>
                  <td class="py-3 px-4 font-mono text-xs text-slate-500">${f.do_number || 'Awaiting DO'}</td>
                  <td class="py-3 px-4 font-mono text-emerald-700 font-medium">₹${parseFloat(f.payout_amount || 0).toLocaleString('en-IN')} (${f.payout_percentage}%)</td>
                  <td class="py-3 px-4">
                    <span class="px-2.5 py-1 rounded-full text-xs font-semibold ${
                      f.do_status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }">${f.do_status}</span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Payment Receipts Table -->
      <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
        <h3 class="text-base font-bold text-slate-900">Payment Receipts & Cashier Audit</h3>
        <div class="table-responsive">
          <table class="w-full text-left text-sm text-slate-700">
            <thead class="text-xs uppercase bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th class="py-3 px-4 font-semibold">Receipt Ref</th>
                <th class="py-3 px-4 font-semibold">OTF Number</th>
                <th class="py-3 px-4 font-semibold">Customer</th>
                <th class="py-3 px-4 font-semibold">Amount</th>
                <th class="py-3 px-4 font-semibold">Mode</th>
                <th class="py-3 px-4 font-semibold">Type</th>
                <th class="py-3 px-4 font-semibold">Cashier Signoff</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${payments.length === 0 ? '<tr><td colspan="7" class="py-6 text-center text-slate-400">No payment transactions recorded yet.</td></tr>' : ''}
              ${payments.map(p => `
                <tr class="hover:bg-slate-50/80 transition">
                  <td class="py-3 px-4 font-mono text-xs text-indigo-700 font-semibold">${p.id}</td>
                  <td class="py-3 px-4 font-mono text-slate-600">${p.otf_number}</td>
                  <td class="py-3 px-4 font-semibold text-slate-900">${p.customer_name}</td>
                  <td class="py-3 px-4 font-bold text-slate-900 font-mono">₹${parseFloat(p.amount).toLocaleString('en-IN')}</td>
                  <td class="py-3 px-4"><span class="px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-700 border border-slate-200">${p.method}</span></td>
                  <td class="py-3 px-4 text-xs">${p.payment_type}</td>
                  <td class="py-3 px-4 text-emerald-700 font-semibold text-xs flex items-center gap-1">
                    <i class="fa-solid fa-circle-check"></i> ${p.cashier_name || 'Verified'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  document.getElementById('recordPayBtn')?.addEventListener('click', () => {
    showPaymentModal(() => renderFinance(container));
  });

  document.getElementById('logDoBtn')?.addEventListener('click', () => {
    showDoModal(() => renderFinance(container));
  });
}
