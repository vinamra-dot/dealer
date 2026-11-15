import { api } from '../api.js';

export function showAddKycModal(onSuccess) {
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
    onSuccess();
  };
}
