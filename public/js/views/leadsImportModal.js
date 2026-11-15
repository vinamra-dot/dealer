import { api } from '../api.js';

export function showCsvImportModal(onSuccess) {
  const modal = document.getElementById('appModal');
  const content = document.getElementById('modalContent');
  content.innerHTML = `
    <div class="flex items-center justify-between pb-3 border-b border-slate-200">
      <div>
        <h3 class="text-base font-bold text-slate-900">Bulk Import Leads (CSV / Excel)</h3>
        <p class="text-xs text-slate-500">Paste raw CSV data or CarDekho / Meta ads lead lists</p>
      </div>
      <button id="closeModal" class="text-slate-400 hover:text-slate-600 p-2"><i class="fa-solid fa-xmark text-lg"></i></button>
    </div>
    <form id="csvForm" class="space-y-4 mt-2">
      <div>
        <div class="flex justify-between items-center mb-1">
          <label class="block text-xs font-semibold text-slate-700">CSV Data (Header: Name,Phone,Email,Model,Budget)</label>
          <button type="button" id="loadSampleBtn" class="text-xs text-blue-600 font-semibold hover:underline">Load Sample</button>
        </div>
        <textarea id="csvData" rows="6" required class="w-full font-mono text-xs bg-slate-50 border border-slate-300 rounded-lg p-3 text-slate-800 focus:outline-none focus:border-blue-500" placeholder="Rohit Sen,+91-9829112233,rohit@gmail.com,Harrier,2500000"></textarea>
      </div>
      <button type="submit" class="w-full min-h-[44px] bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-sm transition shadow-sm">
        <i class="fa-solid fa-file-import mr-1.5"></i> Parse & Batch Import
      </button>
    </form>
  `;

  modal.classList.remove('hidden');
  document.getElementById('closeModal').onclick = () => modal.classList.add('hidden');

  document.getElementById('loadSampleBtn').onclick = () => {
    document.getElementById('csvData').value = 
`Anil Kapoor,+91-9414099881,anil.k@gmail.com,Safari,2800000
Megha Singhal,+91-9829077665,megha.s@tech.in,Nexon EV,1950000
Gaurav Verma,+91-9928133445,gaurav@corp.co.in,Curvv EV,2200000
Sunil Bohra,+91-9414066554,sunil.b@jewels.com,Punch,980000`;
  };

  document.getElementById('csvForm').onsubmit = async (e) => {
    e.preventDefault();
    const raw = document.getElementById('csvData').value.trim();
    const lines = raw.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const leads = lines.map(line => {
      const parts = line.split(',').map(p => p.trim());
      return {
        customer_name: parts[0] || 'Enquiry Customer',
        phone: parts[1] || '+91-9829000000',
        email: parts[2] || null,
        interested_model: parts[3] || 'Harrier',
        budget: parts[4] || 2000000,
        source: 'CSV_IMPORT'
      };
    });

    await api.post('/leads/bulk-import', { leads });
    modal.classList.add('hidden');
    onSuccess();
  };
}
