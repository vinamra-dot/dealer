import { api } from '../api.js';

export function showNewJobCardModal(onSuccess) {
  const modal = document.getElementById('appModal');
  const content = document.getElementById('modalContent');

  content.innerHTML = `
    <div class="flex items-center justify-between pb-3 border-b border-slate-200">
      <h3 class="text-base font-bold text-slate-900">Open Service Workshop Job Card</h3>
      <button id="closeModal" class="text-slate-400 hover:text-slate-600 p-2"><i class="fa-solid fa-xmark text-lg"></i></button>
    </div>
    <form id="jcForm" class="space-y-4 mt-2">
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Customer Full Name *</label>
          <input type="text" id="jcCustName" required class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-indigo-500" placeholder="e.g. Harish Choudhary">
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
          <input type="tel" id="jcCustPhone" required class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-indigo-500" placeholder="+91-9414055667">
        </div>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Vehicle Model *</label>
          <select id="jcModel" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-indigo-500">
            <option value="Harrier">Harrier</option>
            <option value="Safari">Safari</option>
            <option value="Nexon EV">Nexon EV</option>
            <option value="Punch">Punch</option>
            <option value="Curvv EV">Curvv EV</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Registration Plate *</label>
          <input type="text" id="jcReg" required class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm uppercase font-mono focus:outline-none focus:border-indigo-500" placeholder="RJ-14-CE-8821">
        </div>
      </div>
      <div class="grid grid-cols-3 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Odometer (km) *</label>
          <input type="number" id="jcOdo" value="15000" required class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm font-mono focus:outline-none focus:border-indigo-500">
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Fuel / Charge</label>
          <input type="text" id="jcFuel" value="65%" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm font-mono focus:outline-none focus:border-indigo-500">
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Allocated Bay</label>
          <select id="jcBay" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-indigo-500">
            <option value="BAY-01 (EV DIAGNOSTIC)">Bay-01 (EV)</option>
            <option value="BAY-02 (HYDRAULIC)">Bay-02 (Lift)</option>
            <option value="BAY-03 (QUICK)">Bay-03 (Quick)</option>
            <option value="BAY-04 (WASHING)">Bay-04 (Wash)</option>
          </select>
        </div>
      </div>
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Customer Reported Complaints</label>
        <textarea id="jcComplaints" rows="2" class="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 text-xs focus:outline-none focus:border-indigo-500" placeholder="e.g. 10,000 km general service, wheel alignment, brake noise"></textarea>
      </div>
      <button type="submit" class="w-full min-h-[44px] bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm transition shadow-sm">Authorize & Print Job Card</button>
    </form>
  `;

  modal.classList.remove('hidden');
  document.getElementById('closeModal').onclick = () => modal.classList.add('hidden');

  document.getElementById('jcForm').onsubmit = async (e) => {
    e.preventDefault();
    await api.post('/workshop/jobs', {
      customer_name: document.getElementById('jcCustName').value,
      customer_phone: document.getElementById('jcCustPhone').value,
      vehicle_model: document.getElementById('jcModel').value,
      reg_number: document.getElementById('jcReg').value,
      odometer_in: document.getElementById('jcOdo').value,
      fuel_level: document.getElementById('jcFuel').value,
      bay_number: document.getElementById('jcBay').value,
      complaints: document.getElementById('jcComplaints').value
    });
    modal.classList.add('hidden');
    onSuccess();
  };
}