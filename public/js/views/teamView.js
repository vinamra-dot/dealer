import { api } from '../api.js';

export async function renderTeam(container) {
  container.innerHTML = '<div class="text-center py-12 text-slate-400"><i class="fa-solid fa-spinner fa-spin text-2xl text-blue-600"></i><p class="mt-2 text-sm">Loading staff members...</p></div>';
  const res = await api.get('/users');
  const users = res.data || [];

  container.innerHTML = `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Staff & Role Access Control</h2>
          <p class="text-sm text-slate-500">Manage showroom consultants, telecallers, cashier & stockyard drivers.</p>
        </div>
        <button id="addStaffBtn" class="min-h-[44px] px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold flex items-center justify-center space-x-2 shadow-sm transition">
          <i class="fa-solid fa-user-plus"></i>
          <span>Add Staff Member</span>
        </button>
      </div>

      <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div class="table-responsive">
          <table class="w-full text-left text-sm text-slate-700">
            <thead class="text-xs uppercase bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th class="py-3 px-4 font-semibold">Staff Name</th>
                <th class="py-3 px-4 font-semibold">Work Email</th>
                <th class="py-3 px-4 font-semibold">Phone</th>
                <th class="py-3 px-4 font-semibold">Assigned Role</th>
                <th class="py-3 px-4 font-semibold">Status</th>
                <th class="py-3 px-4 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${users.map(u => `
                <tr class="hover:bg-slate-50/80 transition">
                  <td class="py-3 px-4 font-semibold text-slate-900">${u.name}</td>
                  <td class="py-3 px-4 text-xs font-mono text-slate-600">${u.email}</td>
                  <td class="py-3 px-4 text-xs text-slate-500">${u.phone || 'N/A'}</td>
                  <td class="py-3 px-4">
                    <span class="px-2.5 py-1 rounded-full text-xs font-semibold ${
                      u.role === 'SYSTEM_ADMIN' || u.role === 'GENERAL_MANAGER' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                      u.role === 'SALES_CONSULTANT' || u.role === 'SALES_MANAGER' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      u.role === 'FINANCE_HEAD' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      'bg-slate-100 text-slate-700'
                    }">${u.role}</span>
                  </td>
                  <td class="py-3 px-4">
                    <span class="px-2 py-0.5 rounded text-xs font-semibold ${u.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}">
                      ${u.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td class="py-3 px-4 text-right">
                    <button class="toggle-user-btn min-h-[32px] px-2.5 py-1 text-xs rounded border transition ${u.is_active ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'}" data-id="${u.id}">
                      ${u.is_active ? 'Deactivate' : 'Activate'}
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

  document.querySelectorAll('.toggle-user-btn').forEach(btn => {
    btn.onclick = async () => {
      await api.patch(`/users/${btn.dataset.id}/toggle`, {});
      renderTeam(container);
    };
  });

  document.getElementById('addStaffBtn')?.addEventListener('click', () => showAddStaffModal(container));
}

function showAddStaffModal(container) {
  const modal = document.getElementById('appModal');
  const content = document.getElementById('modalContent');
  content.innerHTML = `
    <div class="flex items-center justify-between pb-3 border-b border-slate-200">
      <h3 class="text-base font-bold text-slate-900">Add New Staff Member</h3>
      <button id="closeModal" class="text-slate-400 hover:text-slate-600 p-2"><i class="fa-solid fa-xmark text-lg"></i></button>
    </div>
    <form id="staffForm" class="space-y-4 mt-2">
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
        <input type="text" id="staffName" required class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-blue-500" placeholder="e.g. Deepak Parekh">
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Work Email *</label>
          <input type="email" id="staffEmail" required class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-blue-500" placeholder="deepak@apexmotors.com">
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
          <input type="tel" id="staffPhone" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-blue-500" placeholder="+91-9829099999">
        </div>
      </div>
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Operational Role *</label>
        <select id="staffRole" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-blue-500">
          <option value="SALES_CONSULTANT">Sales Consultant</option>
          <option value="TELECALLER">Telecaller & Intake</option>
          <option value="FINANCE_HEAD">Finance & Accounts Head</option>
          <option value="LOGISTICS_PDI">Stockyard & PDI Lead</option>
          <option value="DRIVER">Transit Driver</option>
          <option value="SALES_MANAGER">Sales Manager</option>
        </select>
      </div>
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Temporary Password</label>
        <input type="password" id="staffPass" value="Password@123" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-blue-500">
      </div>
      <button type="submit" class="w-full min-h-[44px] bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition shadow-sm">Save & Send Credentials</button>
    </form>
  `;

  modal.classList.remove('hidden');
  document.getElementById('closeModal').onclick = () => modal.classList.add('hidden');
  document.getElementById('staffForm').onsubmit = async (e) => {
    e.preventDefault();
    await api.post('/users', {
      name: document.getElementById('staffName').value,
      email: document.getElementById('staffEmail').value,
      phone: document.getElementById('staffPhone').value,
      role: document.getElementById('staffRole').value,
      password: document.getElementById('staffPass').value
    });
    modal.classList.add('hidden');
    renderTeam(container);
  };
}
