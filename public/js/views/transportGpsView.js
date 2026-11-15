import { api } from '../api.js';

export async function renderTransportGps(container, customIdentifier = 'OTF-892101') {
  container.innerHTML = '<div class="text-center py-12 text-slate-400"><i class="fa-solid fa-spinner fa-spin text-2xl text-cyan-600"></i><p class="mt-2 text-sm">Connecting to Vehicle GPS Satellites...</p></div>';
  
  const res = await api.get(`/transport/tracking/${customIdentifier}`);
  const t = res.data;
  const progressPct = Math.round((t.route.distance_covered_km / t.route.total_distance_km) * 100);

  container.innerHTML = `
    <div class="max-w-4xl mx-auto space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-50 text-cyan-700 border border-cyan-200">
              <i class="fa-solid fa-satellite mr-1 animate-pulse"></i> LIVE GPS TELEMETRY
            </span>
            <span class="text-xs font-mono text-slate-400">${t.tracking_id}</span>
          </div>
          <h2 class="text-2xl font-bold text-slate-900 tracking-tight mt-1">Factory to Dealership Carrier Radar</h2>
          <p class="text-sm text-slate-500">Live GPS tracking of new vehicle trailer dispatch from Tata Motors Plant to Mumbai Stockyard.</p>
        </div>
        <button id="refreshGpsBtn" class="min-h-[40px] px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-2xs transition">
          <i class="fa-solid fa-arrows-rotate text-cyan-600"></i>
          <span>Refresh GPS Ping</span>
        </button>
      </div>

      <!-- Live Radar Status Card -->
      <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-4 border-b border-slate-100">
          <div>
            <p class="text-[10px] font-bold uppercase text-slate-400">Current Position</p>
            <p class="text-xs font-bold text-slate-900 mt-0.5 truncate">${t.route.current_location_landmark}</p>
          </div>
          <div>
            <p class="text-[10px] font-bold uppercase text-slate-400">Live Transit Speed</p>
            <p class="text-xs font-bold text-emerald-600 mt-0.5"><i class="fa-solid fa-gauge-high mr-1"></i>${t.route.current_speed_kmh} km/h</p>
          </div>
          <div>
            <p class="text-[10px] font-bold uppercase text-slate-400">Remaining Distance</p>
            <p class="text-xs font-bold text-slate-900 mt-0.5 font-mono">${t.route.distance_remaining_km} km remaining</p>
          </div>
          <div>
            <p class="text-[10px] font-bold uppercase text-slate-400">Expected Stockyard ETA</p>
            <p class="text-xs font-bold text-blue-700 mt-0.5">${t.route.estimated_arrival}</p>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="space-y-1.5">
          <div class="flex justify-between text-xs font-medium text-slate-600">
            <span>Pune Plant (MH-12)</span>
            <span class="font-bold text-cyan-700">${progressPct}% Transit Cleared</span>
            <span>Mumbai Stockyard (MH-02)</span>
          </div>
          <div class="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div class="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full transition-all duration-500" style="width: ${progressPct}%"></div>
          </div>
        </div>

        <!-- Carrier & Driver Info -->
        <div class="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center font-bold">
              <i class="fa-solid fa-truck-moving text-base text-cyan-700"></i>
            </div>
            <div>
              <p class="font-bold text-slate-900 font-mono">${t.carrier.truck_number} • <span class="text-slate-600 font-sans">${t.carrier.transporter_name}</span></p>
              <p class="text-slate-500 text-[11px]">Driver: <strong>${t.carrier.driver_name}</strong> (${t.carrier.driver_phone})</p>
            </div>
          </div>
          <a href="tel:${t.carrier.driver_phone}" class="min-h-[34px] px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold flex items-center justify-center space-x-1 shadow-2xs self-start sm:self-auto">
            <i class="fa-solid fa-phone text-xs mr-1"></i>
            <span>Call Driver</span>
          </a>
        </div>
      </div>

      <!-- Route Milestones -->
      <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
        <h3 class="text-sm font-bold text-slate-900 flex items-center gap-2">
          <i class="fa-solid fa-route text-indigo-600"></i>
          <span>Expressway Transit Waypoints</span>
        </h3>
        <div class="space-y-3 relative pl-6 border-l-2 border-slate-200 ml-3">
          ${t.milestones.map(m => `
            <div class="relative">
              <span class="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center text-[9px] ${
                m.status === 'COMPLETED' ? 'bg-emerald-500 text-white' :
                m.status === 'IN_TRANSIT' ? 'bg-cyan-500 text-white animate-pulse' : 'bg-slate-300 text-transparent'
              }">
                ${m.status === 'COMPLETED' ? '✓' : ''}
              </span>
              <div class="text-xs">
                <div class="flex items-center gap-2">
                  <span class="font-bold text-slate-900">${m.title}</span>
                  <span class="text-[10px] font-mono px-2 py-0.5 rounded ${
                    m.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' :
                    m.status === 'IN_TRANSIT' ? 'bg-cyan-50 text-cyan-700 font-bold' : 'bg-slate-100 text-slate-500'
                  }">${m.time}</span>
                </div>
                <p class="text-slate-500 text-[11px] mt-0.5">${m.location}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  document.getElementById('refreshGpsBtn')?.addEventListener('click', () => {
    renderTransportGps(container, customIdentifier);
  });
}
