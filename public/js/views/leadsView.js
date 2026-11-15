import { api } from '../api.js';

export async function renderLeads(container) {
  container.innerHTML = '<div class="text-center py-12 text-slate-400"><i class="fa-solid fa-spinner fa-spin text-2xl text-blue-600"></i><p class="mt-2 text-sm">Loading leads...</p></div>';
  const res = await api.get('/leads');
  const leads = res.data || [];

  container.innerHTML = `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Lead Pipeline & Intake</h2>
          <p class="text-sm text-slate-500">Capture walk-ins, digital campaigns & OEM DMS auto-sync leads.</p>
        </div>
        <button id="addLeadBtn" class="min-h-[44px] px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold flex items-center justify-center space-x-2 shadow-sm transition">
          <i class="fa-solid fa-user-plus"></i>
          <span>Capture New Lead</span>
        </button>
      </div>

      <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div class="table-responsive">
          <table class="w-full text-left text-sm text-slate-700">
            <thead class="text-xs uppercase bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th class="py-3 px-4 font-semibold">Customer</th>
                <th class="py-3 px-4 font-semibold">Phone / Email</th>
                <th class="py-3 px-4 font-semibold">Source</th>
                <th class="py-3 px-4 font-semibold">Interested Model</th>
                <th class="py-3 px-4 font-semibold">Assigned Consultant</th>
                <th class="py-3 px-4 font-semibold">Status</th>
                <th class="py-3 px-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${leads.length === 0 ? '<tr><td colspan="7" class="py-6 text-center text-slate-400">No leads found. Capture one above.</td></tr>' : ''}
              ${leads.map(l => `
                <tr class="hover:bg-slate-50/80 transition">
                  <td class="py-3 px-4 font-semibold text-slate-900">${l.customer_name}</td>
                  <td class="py-3 px-4 text-xs font-mono text-slate-600">${l.phone}<br><span class="text-slate-400">${l.email || ''}</span></td>
                  <td class="py-3 px-4"><span class="px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-700 border border-slate-200">${l.source}</span></td>
                  <td class="py-3 px-4 font-medium text-slate-900">${l.interested_model || 'Undecided'}</td>
                  <td class="py-3 px-4 text-xs">${l.consultant_name || '<span class="text-amber-600 font-medium">Unassigned</span>'}</td>
                  <td class="py-3 px-4">
                    <span class="px-2.5 py-1 rounded-full text-xs font-semibold ${
                      l.status === 'NEW' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      l.status === 'TEST_DRIVE_SCHEDULED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      l.status === 'BOOKED' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                      'bg-slate-100 text-slate-700'
                    }">${l.status}</span>
                  </td>
                  <td class="py-3 px-4 text-right">
                    <button class="stage-btn min-h-[36px] px-3 py-1 bg-white hover:bg-slate-100 text-xs rounded border border-slate-300 text-slate-700 font-medium transition shadow-2xs" data-id="${l.id}">
                      Advance Stage
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  document.getElementById('addLeadBtn')?.addEventListener('click', () => showAddLeadModal());
}

function showAddLeadModal() {
  const modal = document.getElementById('appModal');
  const content = document.getElementById('modalContent');
  content.innerHTML = `
    <div class="flex items-center justify-between pb-3 border-b border-slate-200">
      <h3 class="text-lg font-bold text-slate-900">Capture Lead Intake</h3>
      <button id="closeModal" class="text-slate-400 hover:text-slate-600 p-2"><i class="fa-solid fa-xmark text-lg"></i></button>
    </div>
    <form id="leadForm" class="space-y-4">
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Customer Full Name *</label>
        <input type="text" id="custName" required class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="e.g. Rahul Sharma">
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
          <input type="tel" id="custPhone" required class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-blue-500" placeholder="+91-9876543210">
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Email (Optional)</label>
          <input type="email" id="custEmail" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-blue-500" placeholder="rahul@example.com">
        </div>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
    renderLeads(document.getElementById('viewContainer'));
  };
}
