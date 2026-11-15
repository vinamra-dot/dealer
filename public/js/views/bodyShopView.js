import { api } from '../api.js';
import { exportTableToCsv } from '../utils/exportCsv.js';

export async function renderBodyShop(container) {
  container.innerHTML = '<div class="text-center py-12 text-slate-400"><i class="fa-solid fa-spinner fa-spin text-2xl text-rose-600"></i><p class="mt-2 text-sm">Loading Accidental Insurance Body Shop Records...</p></div>';
  const res = await api.get('/bodyshop/claims');
  const claims = res.data || [];

  container.innerHTML = `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Accidental Insurance & Body Shop Desk</h2>
          <p class="text-sm text-slate-500">Surveyor coordination, cashless approvals with HDFC ERGO, ICICI Lombard, and paint booth repair tracking.</p>
        </div>
        <div class="flex items-center gap-2">
          <button id="exportClaimsCsvBtn" class="min-h-[42px] px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-2xs transition">
            <i class="fa-solid fa-file-excel text-emerald-600"></i>
            <span>Export (.csv)</span>
          </button>
          <button id="addClaimBtn" class="min-h-[42px] px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition">
            <i class="fa-solid fa-car-burst"></i>
            <span>Intake Accidental Car</span>
          </button>
        </div>
      </div>

      <!-- Claims Table -->
      <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div class="table-responsive">
          <table class="w-full text-left text-sm text-slate-700">
            <thead class="text-xs uppercase bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th class="py-3 px-4 font-semibold">Claim # / Reg</th>
                <th class="py-3 px-4 font-semibold">Customer</th>
                <th class="py-3 px-4 font-semibold">Insurance Company</th>
                <th class="py-3 px-4 font-semibold">Surveyor Name</th>
                <th class="py-3 px-4 font-semibold">Estimate / Sanction</th>
                <th class="py-3 px-4 font-semibold">Repair Status</th>
                <th class="py-3 px-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody id="claimsTableBody" class="divide-y divide-slate-100">
              ${claims.map(c => `
                <tr class="hover:bg-slate-50/80 transition">
                  <td class="py-3 px-4 font-semibold text-slate-900">
                    <span class="font-mono text-rose-700">${c.claim_number}</span><br>
                    <span class="text-xs font-mono font-bold text-slate-700">${c.reg_number}</span>
                  </td>
                  <td class="py-3 px-4">
                    <span class="font-bold text-slate-900">${c.customer_name}</span><br>
                    <span class="text-xs text-slate-500">${c.vehicle_model}</span>
                  </td>
                  <td class="py-3 px-4 text-xs font-medium text-slate-800">
                    <span class="font-semibold text-blue-900">${c.insurance_company}</span><br>
                    <span class="text-[11px] font-mono text-slate-500">${c.policy_number}</span>
                  </td>
                  <td class="py-3 px-4 text-xs font-semibold text-slate-700">
                    <i class="fa-solid fa-user-tie text-slate-400 mr-1"></i>${c.surveyor_name || 'Unassigned'}
                  </td>
                  <td class="py-3 px-4 font-mono text-xs">
                    <span class="text-slate-500">Est: ₹${parseFloat(c.estimated_loss).toLocaleString('en-IN')}</span><br>
                    <span class="font-bold text-emerald-700">Approved: ₹${parseFloat(c.approved_amount || 0).toLocaleString('en-IN')}</span>
                  </td>
                  <td class="py-3 px-4">
                    <span class="px-2.5 py-1 rounded-full text-xs font-semibold ${
                      c.claim_status === 'CASHLESS_SANCTIONED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      c.claim_status === 'IN_PAINT_BOOTH' ? 'bg-cyan-50 text-cyan-700 border border-cyan-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }">${c.claim_status}</span>
                  </td>
                  <td class="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                    ${c.claim_status !== 'CASHLESS_SANCTIONED' ? `
                      <button class="approve-claim-btn min-h-[32px] px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded shadow-2xs transition" data-id="${c.id}" data-est="${c.estimated_loss}">
                        Sanction Cashless
                      </button>
                    ` : '<span class="text-xs text-emerald-700 font-semibold"><i class="fa-solid fa-shield-check"></i> Cashless Approved</span>'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  container.querySelectorAll('.approve-claim-btn').forEach(btn => {
    btn.onclick = async () => {
      const amt = prompt('Enter Surveyor Sanctioned Cashless Amount (INR):', btn.dataset.est);
      if (amt) {
        await api.patch(`/bodyshop/claims/${btn.dataset.id}/surveyor-approve`, { approved_amount: amt });
        renderBodyShop(container);
      }
    };
  });

  document.getElementById('exportClaimsCsvBtn')?.addEventListener('click', () => {
    const headers = ['Claim No', 'Reg Number', 'Customer', 'Vehicle', 'Insurance Co', 'Policy No', 'Surveyor', 'Estimated', 'Approved', 'Status'];
    const rows = claims.map(c => [c.claim_number, c.reg_number, c.customer_name, c.vehicle_model, c.insurance_company, c.policy_number, c.surveyor_name, c.estimated_loss, c.approved_amount, c.claim_status]);
    exportTableToCsv('Accidental_Insurance_Claims', headers, rows);
  });
}
