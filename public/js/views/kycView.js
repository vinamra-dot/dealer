import { api } from '../api.js';

export async function renderKyc(container) {
  container.innerHTML = '<div class="text-center py-12 text-slate-400"><i class="fa-solid fa-spinner fa-spin text-2xl text-blue-600"></i><p class="mt-2 text-sm">Loading KYC records...</p></div>';
  const res = await api.get('/kyc');
  const allRecords = res.data || [];

  container.innerHTML = `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Digital Customer KYC Vault</h2>
          <p class="text-sm text-slate-500">Aadhaar, PAN & RTO compliance verification desk for vehicle registration.</p>
        </div>
        <button id="addKycBtn" class="min-h-[44px] px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold flex items-center justify-center space-x-2 shadow-sm transition">
          <i class="fa-solid fa-id-card"></i>
          <span>Upload New KYC</span>
        </button>
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
        <td class="py-3 px-4 text-right whitespace-nowrap">
          ${k.verification_status !== 'VERIFIED' ? `
            <button class="verify-kyc-btn min-h-[32px] px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded transition shadow-2xs" data-id="${k.id}">
              Verify & Approve
            </button>
          ` : '<span class="text-xs text-emerald-600 font-semibold"><i class="fa-solid fa-shield-halved"></i> Cleared</span>'}
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.verify-kyc-btn').forEach(b => {
      b.onclick = async () => {
        await api.patch(`/kyc/${b.dataset.id}/verify`, { status: 'VERIFIED', remarks: 'Manually verified by Compliance Officer' });
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
  document.getElementById('addKycBtn')?.addEventListener('click', () => showAddKycModal(container));
}

function showAddKycModal(container) {
  const modal = document.getElementById('appModal');
  const content = document.getElementById('modalContent');
  content.innerHTML = `
    <div class="flex items-center justify-between pb-3 border-b border-slate-200">
      <h3 class="text-base font-bold text-slate-900">Upload Customer KYC</h3>
      <button id="closeModal" class="text-slate-400 hover:text-slate-600 p-2"><i class="fa-solid fa-xmark text-lg"></i></button>
    </div>
    <form id="kycForm" class="space-y-4 mt-2">
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Customer Name *</label>
        <input type="text" id="kName" required class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-blue-500" placeholder="e.g. Anand Mahindra">
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
          <input type="tel" id="kPhone" required class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-blue-500" placeholder="+91-9829012345">
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">PAN Card Number</label>
          <input type="text" id="kPan" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm font-mono uppercase focus:outline-none focus:border-blue-500" placeholder="ABCDE1234F">
        </div>
      </div>
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Masked Aadhaar Number</label>
        <input type="text" id="kAadhaar" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm font-mono focus:outline-none focus:border-blue-500" placeholder="XXXX-XXXX-1234">
      </div>
      <button type="submit" class="w-full min-h-[44px] bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition shadow-sm">Save & Stage in KYC Vault</button>
    </form>
  `;

  modal.classList.remove('hidden');
  document.getElementById('closeModal').onclick = () => modal.classList.add('hidden');
  document.getElementById('kycForm').onsubmit = async (e) => {
    e.preventDefault();
    await api.post('/kyc', {
      customer_name: document.getElementById('kName').value,
      customer_phone: document.getElementById('kPhone').value,
      pan_number: document.getElementById('kPan').value,
      aadhaar_masked: document.getElementById('kAadhaar').value
    });
    modal.classList.add('hidden');
    renderKyc(container);
  };
}