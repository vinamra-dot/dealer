import { api } from '../api.js';
export { showCsvImportModal } from './leadsImportModal.js';

export function showAddLeadModal(onSuccess) {
  const modal = document.getElementById('appModal');
  const content = document.getElementById('modalContent');
  content.innerHTML = `
    <div class="flex items-center justify-between pb-3 border-b border-slate-200">
      <h3 class="text-base font-bold text-slate-900">Capture New Customer Lead</h3>
      <button id="closeModal" class="text-slate-400 hover:text-slate-600 p-2"><i class="fa-solid fa-xmark text-lg"></i></button>
    </div>
    <form id="leadForm" class="space-y-4 mt-2">
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Customer Full Name *</label>
        <input type="text" id="custName" required class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-blue-500" placeholder="e.g. Rahul Sharma">
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
          <input type="tel" id="custPhone" required class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-blue-500" placeholder="+91-9876543210">
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Email</label>
          <input type="email" id="custEmail" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-blue-500" placeholder="rahul@example.com">
        </div>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Lead Source</label>
          <select id="leadSource" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-blue-500">
            <option value="WALK_IN">Walk-in Showroom</option>
            <option value="DIGITAL_AD">Google / Meta Ads</option>
            <option value="OEM_DMS_SYNC">OEM Salesforce / DMS</option>
            <option value="REFERRAL">Customer Referral</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Interested Model</label>
          <select id="leadModel" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-blue-500">
            <option value="Nexon EV">Nexon EV</option>
            <option value="Harrier">Harrier</option>
            <option value="Safari">Safari</option>
            <option value="Punch">Punch</option>
            <option value="Curvv EV">Curvv EV</option>
          </select>
        </div>
      </div>
      <button type="submit" class="w-full min-h-[44px] bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition shadow-sm">Save & Assign Lead</button>
    </form>
  `;

  modal.classList.remove('hidden');
  document.getElementById('closeModal').onclick = () => modal.classList.add('hidden');
  document.getElementById('leadForm').onsubmit = async (e) => {
    e.preventDefault();
    await api.post('/leads', {
      customer_name: document.getElementById('custName').value,
      phone: document.getElementById('custPhone').value,
      email: document.getElementById('custEmail').value,
      source: document.getElementById('leadSource').value,
      interested_model: document.getElementById('leadModel').value
    });
    modal.classList.add('hidden');
    onSuccess();
  };
}

export function showUpdateStageModal(leadId, currentStatus, customerName, onSuccess) {
  const modal = document.getElementById('appModal');
  const content = document.getElementById('modalContent');
  const stages = [
    { key: 'NEW', label: 'NEW — Fresh Walk-in / Online' },
    { key: 'CONTACTED', label: 'CONTACTED — Telecaller Followed Up' },
    { key: 'TEST_DRIVE_SCHEDULED', label: 'TEST DRIVE — Demo Scheduled' },
    { key: 'QUOTED', label: 'QUOTED — Pricing Sent' },
    { key: 'BOOKED', label: 'BOOKED — Token Deposited' },
    { key: 'LOST', label: 'LOST — Customer Drop' }
  ];

  content.innerHTML = `
    <div class="flex items-center justify-between pb-3 border-b border-slate-200">
      <div>
        <h3 class="text-base font-bold text-slate-900">Update Lead Sales Stage</h3>
        <p class="text-xs text-slate-500">${customerName}</p>
      </div>
      <button id="closeModal" class="text-slate-400 hover:text-slate-600 p-2"><i class="fa-solid fa-xmark text-lg"></i></button>
    </div>
    <form id="stageForm" class="space-y-4 mt-2">
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Pipeline Stage *</label>
        <select id="newStage" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-blue-500">
          ${stages.map(s => `<option value="${s.key}" ${s.key === currentStatus ? 'selected' : ''}>${s.label}</option>`).join('')}
        </select>
      </div>
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Follow-up Remarks</label>
        <textarea id="stageRemarks" rows="2" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-blue-500" placeholder="e.g. Customer requested dark edition pricing"></textarea>
      </div>
      <button type="submit" class="w-full min-h-[44px] bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition shadow-sm">Save & Move Lead</button>
    </form>
  `;

  modal.classList.remove('hidden');
  document.getElementById('closeModal').onclick = () => modal.classList.add('hidden');
  document.getElementById('stageForm').onsubmit = async (e) => {
    e.preventDefault();
    await api.patch(`/leads/${leadId}/status`, {
      status: document.getElementById('newStage').value,
      remarks: document.getElementById('stageRemarks').value || undefined
    });
    modal.classList.add('hidden');
    onSuccess();
  };
}
