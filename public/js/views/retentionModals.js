import { api } from '../api.js';

export function showNewSurveyModal(onSuccess) {
  const modal = document.getElementById('appModal');
  const content = document.getElementById('modalContent');

  content.innerHTML = `
    <div class="flex items-center justify-between pb-3 border-b border-slate-200">
      <h3 class="text-base font-bold text-slate-900">Record Post-Delivery CSAT Survey</h3>
      <button id="closeModal" class="text-slate-400 hover:text-slate-600 p-2"><i class="fa-solid fa-xmark text-lg"></i></button>
    </div>
    <form id="csatForm" class="space-y-4 mt-2">
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Customer Full Name *</label>
          <input type="text" id="csatName" required class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-rose-500" placeholder="e.g. Rahul Sharma">
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
          <input type="tel" id="csatPhone" required class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-rose-500" placeholder="+91-9876543210">
        </div>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Delivered Vehicle Model *</label>
          <select id="csatModel" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-rose-500">
            <option value="Nexon EV">Nexon EV</option>
            <option value="Harrier">Harrier</option>
            <option value="Safari">Safari</option>
            <option value="Punch">Punch</option>
            <option value="Curvv EV">Curvv EV</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">NPS Rating (1 to 10) *</label>
          <select id="csatRating" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm font-bold focus:outline-none focus:border-rose-500">
            <option value="10">10 / 10 — Promoter (Delighted)</option>
            <option value="9" selected>9 / 10 — Promoter (Very Satisfied)</option>
            <option value="8">8 / 10 — Passive (Good)</option>
            <option value="7">7 / 10 — Passive (Average)</option>
            <option value="5">5 / 10 — Detractor (Unhappy)</option>
          </select>
        </div>
      </div>
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Customer Testimonial / Feedback</label>
        <textarea id="csatComments" rows="2" class="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 text-xs focus:outline-none focus:border-rose-500" placeholder="e.g. Excellent experience during car delivery! Vehicle was gleaming and cake cutting was memorable."></textarea>
      </div>
      <button type="submit" class="w-full min-h-[44px] bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg text-sm transition shadow-sm">Record CSAT & Schedule 1st Service</button>
    </form>
  `;

  modal.classList.remove('hidden');
  document.getElementById('closeModal').onclick = () => modal.classList.add('hidden');
  document.getElementById('csatForm').onsubmit = async (e) => {
    e.preventDefault();
    await api.post('/retention/surveys', {
      customer_name: document.getElementById('csatName').value,
      customer_phone: document.getElementById('csatPhone').value,
      vehicle_model: document.getElementById('csatModel').value,
      nps_rating: document.getElementById('csatRating').value,
      comments: document.getElementById('csatComments').value
    });
    modal.classList.add('hidden');
    onSuccess();
  };
}