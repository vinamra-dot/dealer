import { api } from '../api.js';

export async function renderSalesTargets(container) {
  container.innerHTML = '<div class="text-center py-12 text-slate-400"><i class="fa-solid fa-spinner fa-spin text-2xl text-blue-600"></i><p class="mt-2 text-sm">Loading sales target leaderboard...</p></div>';
  const res = await api.get('/sales-targets');
  const targets = res.data || [];

  container.innerHTML = `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Sales Consultant Target & Performance Board</h2>
          <p class="text-sm text-slate-500">Monthly delivery quotas, test drive conversion metrics & team leaderboard.</p>
        </div>
      </div>

      <!-- Leaderboard Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${targets.map(st => {
          const delPct = Math.round((st.achieved_deliveries / (st.target_deliveries || 1)) * 100);
          const tdPct = Math.round((st.achieved_test_drives / (st.target_test_drives || 1)) * 100);

          return `
            <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="text-base font-bold text-slate-900">${st.consultant_name}</h3>
                  <p class="text-xs text-slate-500">${st.consultant_email} • ${st.phone}</p>
                </div>
                <span class="px-2.5 py-1 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">${st.target_month}</span>
              </div>

              <!-- Deliveries Bar -->
              <div class="space-y-1">
                <div class="flex justify-between text-xs font-semibold">
                  <span class="text-slate-600">Vehicle Deliveries (${st.achieved_deliveries} / ${st.target_deliveries})</span>
                  <span class="${delPct >= 80 ? 'text-emerald-600' : 'text-blue-600'} font-bold">${delPct}%</span>
                </div>
                <div class="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div class="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style="width: ${Math.min(delPct, 100)}%"></div>
                </div>
              </div>

              <!-- Test Drives Bar -->
              <div class="space-y-1">
                <div class="flex justify-between text-xs font-semibold">
                  <span class="text-slate-600">Customer Test Drives (${st.achieved_test_drives} / ${st.target_test_drives})</span>
                  <span class="text-emerald-600 font-bold">${tdPct}%</span>
                </div>
                <div class="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div class="bg-emerald-600 h-2.5 rounded-full transition-all duration-500" style="width: ${Math.min(tdPct, 100)}%"></div>
                </div>
              </div>

              <div class="pt-2 flex justify-end">
                <button class="update-target-btn px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition" data-id="${st.id}" data-del="${st.achieved_deliveries}" data-td="${st.achieved_test_drives}">
                  <i class="fa-solid fa-pen-to-square mr-1"></i> Update Achievement
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  document.querySelectorAll('.update-target-btn').forEach(btn => {
    btn.onclick = async () => {
      const newDel = prompt('Enter Updated Achieved Deliveries:', btn.dataset.del);
      const newTd = prompt('Enter Updated Achieved Test Drives:', btn.dataset.td);
      if (newDel !== null && newTd !== null) {
        await api.patch(`/sales-targets/${btn.dataset.id}`, {
          achieved_deliveries: parseInt(newDel, 10),
          achieved_test_drives: parseInt(newTd, 10)
        });
        renderSalesTargets(container);
      }
    };
  });
}
