import { api } from '../api.js';
import { showAddKycModal } from './kycModals.js';
import { exportTableToCsv } from '../utils/exportCsv.js';

export async function renderKyc(container) {
  container.innerHTML = '<div class="text-center py-12 text-slate-400"><i class="fa-solid fa-spinner fa-spin text-2xl text-blue-600"></i><p class="mt-2 text-sm">Loading KYC records...</p></div>';
  const res = await api.get('/kyc');
  const allRecords = res.data || [];

  container.innerHTML = `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Digital Customer KYC Vault</h2>
          <p class="text-sm text-slate-500">NSDL PAN OCR, masked Aadhaar & RTO compliance verification desk for vehicle registration.</p>
        </div>
        <div class="flex items-center gap-2">
          <button id="exportKycCsvBtn" class="min-h-[44px] px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-sm font-semibold flex items-center space-x-1.5 shadow-2xs transition">
            <i class="fa-solid fa-file-excel text-emerald-600"></i>
            <span>Export (.csv)</span>
          </button>
          <button id="addKycBtn" class="min-h-[44px] px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold flex items-center justify-center space-x-2 shadow-sm transition">
            <i class="fa-solid fa-id-card"></i>
            <span>Upload New KYC</span>
          </button>
        </div>
      </div>

      <!-- Search & Status Filter -->
      <div class="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div class="relative w-full sm:w-80">
          <i class="fa-solid fa-magnifying-glass absolute left-3 top-3 text-slate-400 text-xs"></i>
          <input type="text" id="kycSearchInput" placeholder="Search by customer, phone, PAN..." class="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500">
        </div>
        <div class="flex items-center gap-2 w-full sm:w-auto">
          <span class="text-xs font-semibold text-slate-500">Status:</span>
          <select id="kycStatusFilter" class="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none">
            <option value="ALL">All Documents</option>
            <option value="VERIFIED">VERIFIED</option>
            <option value="PENDING">PENDING</option>
          </select>
        </div>
      </div>

      <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div class="table-responsive">
          <table class="w-full text-left text-sm text-slate-700">
            <thead class="text-xs uppercase bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th class="py-3 px-4 font-semibold">Customer</th>
                <th class="py-3 px-4 font-semibold">PAN / Aadhaar</th>
                <th class="py-3 px-4 font-semibold">Doc Type</th>
                <th class="py-3 px-4 font-semibold">Verification</th>
                <th class="py-3 px-4 font-semibold">Auditor Remarks</th>
                <th class="py-3 px-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody id="kycTableBody" class="divide-y divide-slate-100"></tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  function renderRows(records) {
    const tbody = document.getElementById('kycTableBody');
    if (!tbody) return;
    if (records.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="py-6 text-center text-slate-400">No KYC records match filter.</td></tr>';
      return;
    }
    tbody.innerHTML = records.map(k => `
      <tr class="hover:bg-slate-50/80 transition">
        <td class="py-3 px-4 font-semibold text-slate-900">${k.customer_name}<br><span class="text-xs font-mono text-slate-500">${k.customer_phone}</span></td>
        <td class="py-3 px-4 text-xs font-mono text-slate-700">
          <span class="font-bold text-slate-900">PAN:</span> ${k.pan_number || 'N/A'}<br>
          <span class="font-bold text-slate-900">UID:</span> ${k.aadhaar_masked || 'N/A'}
        </td>
        <td class="py-3 px-4 text-xs"><span class="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">${k.doc_type}</span></td>
        <td class="py-3 px-4">
          <span class="px-2.5 py-1 rounded-full text-xs font-semibold ${k.verification_status === 'VERIFIED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}">
            ${k.verification_status === 'VERIFIED' ? '<i class="fa-solid fa-check-circle mr-1"></i> Verified' : '<i class="fa-solid fa-clock mr-1"></i> Pending'}
          </span>
        </td>
        <td class="py-3 px-4 text-xs text-slate-600 max-w-xs truncate">${k.remarks || 'Standard intake'}</td>
        <td class="py-3 px-4 text-right space-x-1 whitespace-nowrap">
          ${k.pan_number ? `
            <button class="pan-check-btn min-h-[32px] px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded border border-blue-200 transition shadow-2xs" data-pan="${k.pan_number}">
              <i class="fa-solid fa-bolt mr-1"></i> NSDL Check
            </button>
          ` : ''}
          ${k.verification_status !== 'VERIFIED' ? `
            <button class="verify-kyc-btn min-h-[32px] px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded transition shadow-2xs" data-id="${k.id}">
              Approve
            </button>
          ` : '<span class="text-xs text-emerald-600 font-semibold"><i class="fa-solid fa-shield-halved"></i> Cleared</span>'}
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.pan-check-btn').forEach(b => {
      b.onclick = async () => {
        try {
          const r = await api.post('/rto/pan-verify', { pan_number: b.dataset.pan });
          alert(`NSDL Tax Department Verified!\nPAN: ${r.data.pan}\nStatus: ${r.data.pan_status}\nAadhaar Seeding: ${r.data.aadhaar_seeding_status}`);
        } catch (err) {
          alert('NSDL PAN check failed: ' + err.message);
        }
      };
    });

    tbody.querySelectorAll('.verify-kyc-btn').forEach(b => {
      b.onclick = async () => {
        await api.patch(`/kyc/${b.dataset.id}/verify`, { status: 'VERIFIED', remarks: 'Manually verified via NSDL ITD API' });
        renderKyc(container);
      };
    });
  }

  function filterKyc() {
    const q = (document.getElementById('kycSearchInput')?.value || '').toLowerCase();
    const st = document.getElementById('kycStatusFilter')?.value || 'ALL';
    const filtered = allRecords.filter(k => {
      const matchQ = (k.customer_name || '').toLowerCase().includes(q) || (k.customer_phone || '').toLowerCase().includes(q) || (k.pan_number || '').toLowerCase().includes(q);
      const matchSt = st === 'ALL' || k.verification_status === st;
      return matchQ && matchSt;
    });
    renderRows(filtered);
  }

  renderRows(allRecords);
  document.getElementById('kycSearchInput')?.addEventListener('input', filterKyc);
  document.getElementById('kycStatusFilter')?.addEventListener('change', filterKyc);
  document.getElementById('addKycBtn')?.addEventListener('click', () => showAddKycModal(() => renderKyc(container)));

  document.getElementById('exportKycCsvBtn')?.addEventListener('click', () => {
    const headers = ['Customer Name', 'Phone', 'PAN', 'Masked Aadhaar', 'Doc Type', 'Verification Status', 'Remarks'];
    const rows = allRecords.map(k => [k.customer_name, k.customer_phone, k.pan_number || '', k.aadhaar_masked || '', k.doc_type, k.verification_status, k.remarks || '']);
    exportTableToCsv('Customer_KYC_Register', headers, rows);
  });
}
