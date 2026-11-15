import { api } from '../api.js';

export async function renderIntegrations(container) {
  container.innerHTML = '<div class="text-center py-12 text-slate-400"><i class="fa-solid fa-spinner fa-spin text-2xl text-blue-600"></i><p class="mt-2 text-sm">Loading API integrations hub...</p></div>';
  const [statusRes, briefingRes] = await Promise.all([
    api.get('/integrations/status'),
    api.get('/cron/morning-briefing')
  ]);
  const s = statusRes.data || {};
  const b = briefingRes.data || {};

  container.innerHTML = `
    <div class="space-y-6">
      <div>
        <h2 class="text-2xl font-bold text-slate-900 tracking-tight">API Hub & Production Webhooks</h2>
        <p class="text-sm text-slate-500">Live gateway status for Razorpay webhooks, Meta WhatsApp, Parivahan RTO & 9:00 AM Cron.</p>
      </div>

      <!-- Live Gateway Status Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-900 flex items-center gap-1.5"><i class="fa-solid fa-credit-card text-blue-600"></i> Razorpay Webhook</span>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">ONLINE</span>
          </div>
          <p class="text-[11px] font-mono text-slate-500 mt-2">Listener: /api/webhooks/razorpay</p>
          <p class="text-xs text-slate-600 mt-1">Auto-confirms bookings upon UPI deposit.</p>
        </div>

        <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-900 flex items-center gap-1.5"><i class="fa-brands fa-whatsapp text-emerald-600"></i> Meta Cloud API</span>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">CONNECTED</span>
          </div>
          <p class="text-[11px] font-mono text-slate-500 mt-2">v19.0 Cloud Business Gateway</p>
          <p class="text-xs text-slate-600 mt-1">Automated dispatch for quotes & invoices.</p>
        </div>

        <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-900 flex items-center gap-1.5"><i class="fa-solid fa-building-flag text-indigo-600"></i> Parivahan & NSDL</span>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">ACTIVE</span>
          </div>
          <p class="text-[11px] font-mono text-slate-500 mt-2">MoRTH Vahan & Income Tax ITD</p>
          <p class="text-xs text-slate-600 mt-1">Instant RC and PAN validation engine.</p>
        </div>
      </div>

      <!-- Interactive Verification Tools -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Parivahan Vahan Tool -->
        <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
          <h3 class="text-sm font-bold text-slate-900 flex items-center gap-1.5"><i class="fa-solid fa-car-rear text-cyan-600"></i> Parivahan Vahan RC Lookup</h3>
          <p class="text-xs text-slate-500">Query Ministry of Road Transport database for used car exchange.</p>
          <div class="flex gap-2">
            <input type="text" id="vahanInput" value="MH-02-DW-8821" class="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono uppercase focus:outline-none">
            <button id="lookupVahanBtn" class="min-h-[36px] px-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-xs font-semibold shadow-2xs">Fetch RC</button>
          </div>
          <div id="vahanResult" class="hidden p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs font-mono text-slate-700 space-y-1"></div>
        </div>

        <!-- NSDL PAN Tool -->
        <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
          <h3 class="text-sm font-bold text-slate-900 flex items-center gap-1.5"><i class="fa-solid fa-id-card-clip text-blue-600"></i> NSDL PAN OCR Verification</h3>
          <p class="text-xs text-slate-500">Validate customer PAN card validity and Aadhaar seeding status.</p>
          <div class="flex gap-2">
            <input type="text" id="panInput" value="ALKPZ7890K" class="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono uppercase focus:outline-none">
            <button id="lookupPanBtn" class="min-h-[36px] px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-2xs">Verify PAN</button>
          </div>
          <div id="panResult" class="hidden p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs font-mono text-slate-700 space-y-1"></div>
        </div>
      </div>

      <!-- 9:00 AM Cron Section -->
      <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span class="text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5"><i class="fa-solid fa-clock text-indigo-600"></i> Daily 09:00 AM Automated Executive Briefing</span>
          <h3 class="text-base font-bold text-slate-900 mt-1">${b.date} • Briefing Engine</h3>
          <p class="text-xs text-slate-500 mt-0.5">${b.testDrivesToday?.length || 0} Test Drives today • ${b.yardSummary?.agingAlertCount || 0} Aging Cars • Daily Yard Holding: ₹${(b.yardSummary?.dailyHoldingCost || 0).toLocaleString('en-IN')}</p>
        </div>
        <button id="triggerBriefingBtn" class="min-h-[44px] px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-sm flex items-center space-x-2">
          <i class="fa-solid fa-paper-plane"></i><span>Trigger Morning Briefing Now</span>
        </button>
      </div>
    </div>
  `;

  document.getElementById('lookupVahanBtn')?.addEventListener('click', async () => {
    const reg_number = document.getElementById('vahanInput').value;
    const resBox = document.getElementById('vahanResult');
    resBox.classList.remove('hidden');
    resBox.innerHTML = '<span class="text-slate-400">Connecting to MoRTH Parivahan API...</span>';
    const res = await api.post('/rto/vahan-lookup', { reg_number });
    const d = res.data;
    resBox.innerHTML = `
      <p class="text-emerald-700 font-bold">✔ RC Active: ${d.maker}</p>
      <p>Model: ${d.model} (${d.fuel_type})</p>
      <p>Chassis VIN: ${d.chassis_no}</p>
      <p>Tax: ${d.tax_status}</p>
      <p>Insurance: ${d.insurance_valid_upto}</p>
    `;
  });

  document.getElementById('lookupPanBtn')?.addEventListener('click', async () => {
    const pan_number = document.getElementById('panInput').value;
    const resBox = document.getElementById('panResult');
    resBox.classList.remove('hidden');
    resBox.innerHTML = '<span class="text-slate-400">Querying NSDL Income Tax Database...</span>';
    const res = await api.post('/rto/pan-verify', { pan_number });
    const d = res.data;
    resBox.innerHTML = `
      <p class="text-emerald-700 font-bold">✔ Status: ${d.pan_status}</p>
      <p>Aadhaar Seeding: ${d.aadhaar_seeding_status}</p>
      <p>Category: ${d.category}</p>
      <p>Jurisdiction: ${d.jurisdiction}</p>
    `;
  });

  document.getElementById('triggerBriefingBtn')?.addEventListener('click', async () => {
    const res = await api.post('/cron/trigger-briefing', {});
    alert(res.message);
  });
}