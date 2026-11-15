import { api } from '../api.js';

export async function renderDashboard(container) {
  container.innerHTML = '<div class="text-center py-12 text-slate-400"><i class="fa-solid fa-spinner fa-spin text-2xl text-blue-600"></i><p class="mt-2 text-sm">Loading metrics...</p></div>';
  const res = await api.get('/analytics/dashboard');
  const d = res.data;

  const totalHoldingCost = (d.inventorySummary || []).reduce((acc, curr) => acc + parseFloat(curr.daily_holding_cost || 0), 0);
  const totalVehicles = (d.vehicles || []).length;
  const availableVehicles = (d.vehicles || []).filter(v => v.status === 'AVAILABLE').length;

  container.innerHTML = `
    <div class="space-y-6">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Executive Dealership Cockpit</h2>
          <p class="text-sm text-slate-500">Live operational throughput, stockyard holding cost & department aging.</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span class="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span> Live PostgreSQL Sync
          </span>
        </div>
      </div>

      <!-- KPI Grid (Clean Light Theme) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Daily Stock Holding Cost</p>
          <p class="text-2xl font-extrabold text-amber-600 mt-2">₹${totalHoldingCost.toLocaleString('en-IN')}<span class="text-xs text-slate-400 font-normal"> /day</span></p>
          <p class="text-xs text-slate-500 mt-1">Carried bank interest on yard inventory</p>
        </div>
        <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Fleet Inventory</p>
          <p class="text-2xl font-extrabold text-slate-900 mt-2">${totalVehicles} <span class="text-xs text-slate-500 font-normal">(${availableVehicles} Ready to Sell)</span></p>
          <p class="text-xs text-emerald-600 font-medium mt-1">Stockyard Bay-A & Showroom</p>
        </div>
        <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Leads</p>
          <p class="text-2xl font-extrabold text-blue-600 mt-2">${(d.leadsSummary || []).reduce((acc, l) => acc + parseInt(l.count), 0)}</p>
          <p class="text-xs text-slate-500 mt-1">Walk-in & Online Campaigns</p>
        </div>
        <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending OEM Claims</p>
          <p class="text-2xl font-extrabold text-rose-600 mt-2">₹${((d.claimsSummary || []).reduce((acc, c) => acc + parseFloat(c.total_claims_val || 0), 0)).toLocaleString('en-IN')}</p>
          <p class="text-xs text-slate-500 mt-1">Ready for incentive recovery</p>
        </div>
      </div>

      <!-- Inventory Table (Clean Light Theme) -->
      <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <h3 class="text-base font-bold text-slate-900 mb-4">Stockyard & Showroom Fleet Status</h3>
        <div class="table-responsive">
          <table class="w-full text-left text-sm text-slate-700">
            <thead class="text-xs uppercase bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th class="py-3 px-4 font-semibold">Model & Variant</th>
                <th class="py-3 px-4 font-semibold">Color</th>
                <th class="py-3 px-4 font-semibold">VIN / Chassis</th>
                <th class="py-3 px-4 font-semibold">Ex-Showroom</th>
                <th class="py-3 px-4 font-semibold">Location</th>
                <th class="py-3 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${(d.vehicles || []).map(v => `
                <tr class="hover:bg-slate-50/80 transition">
                  <td class="py-3 px-4 font-semibold text-slate-900">${v.model} <span class="text-xs text-slate-500 font-normal">(${v.variant})</span></td>
                  <td class="py-3 px-4">${v.color}</td>
                  <td class="py-3 px-4 font-mono text-xs text-slate-600">${v.vin || 'N/A'}</td>
                  <td class="py-3 px-4 font-medium text-slate-900">₹${parseFloat(v.ex_showroom_price).toLocaleString('en-IN')}</td>
                  <td class="py-3 px-4 text-xs text-slate-500">${v.yard_location}</td>
                  <td class="py-3 px-4">
                    <span class="px-2.5 py-1 rounded-full text-xs font-semibold ${
                      v.status === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      v.status === 'DEMO' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                      v.status === 'ALLOCATED' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-blue-50 text-blue-700 border border-blue-200'
                    }">${v.status}</span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}
