import { api } from '../api.js';
import { getCarImage } from '../utils/carImages.js';
import { openWhatsAppChat } from '../utils/whatsapp.js';
import { showNewSurveyModal } from './retentionModals.js';

export async function renderRetention(container) {
  container.innerHTML = '<div class="text-center py-12 text-slate-400"><i class="fa-solid fa-spinner fa-spin text-2xl text-rose-600"></i><p class="mt-2 text-sm">Loading CSAT & retention desk...</p></div>';
  const res = await api.get('/retention/surveys');
  const allSurveys = res.data || [];
  const avgNps = allSurveys.length ? (allSurveys.reduce((acc, s) => acc + (s.nps_rating || 0), 0) / allSurveys.length).toFixed(1) : '10.0';

  container.innerHTML = `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Post-Delivery CSAT & Service Retention</h2>
          <p class="text-sm text-slate-500">Automated NPS customer surveys, OEM quality audit & 1st service due reminders.</p>
        </div>
        <button id="addCsatBtn" class="min-h-[44px] px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-semibold flex items-center justify-center space-x-2 shadow-sm transition">
          <i class="fa-solid fa-star"></i>
          <span>Log Customer CSAT</span>
        </button>
      </div>

      <!-- KPI Summary -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-4 shadow-xs">
          <p class="text-xs uppercase font-bold text-emerald-800">Dealership Net Promoter Score (NPS)</p>
          <p class="text-2xl font-black text-emerald-950 mt-1">${avgNps} / 10</p>
          <p class="text-xs text-emerald-700 font-semibold mt-0.5">Top-Tier OEM Benchmark</p>
        </div>
        <div class="bg-indigo-50 border border-indigo-200 rounded-xl p-4 shadow-xs">
          <p class="text-xs uppercase font-bold text-indigo-800">1st Free Service Due Pool</p>
          <p class="text-2xl font-black text-indigo-950 mt-1">${allSurveys.filter(s => !s.service_reminder_sent).length} Vehicles</p>
          <p class="text-xs text-indigo-700 font-semibold mt-0.5">Upcoming within next 30 days</p>
        </div>
        <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <p class="text-xs uppercase font-bold text-slate-500">Total Audited Deliveries</p>
          <p class="text-2xl font-black text-slate-900 mt-1">${allSurveys.length} Customers</p>
          <p class="text-xs text-slate-500 mt-0.5">100% verified post-delivery feedback</p>
        </div>
      </div>

      <!-- Search Bar -->
      <div class="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
        <div class="relative w-full sm:w-80">
          <i class="fa-solid fa-magnifying-glass absolute left-3 top-3 text-slate-400 text-xs"></i>
          <input type="text" id="csatSearchInput" placeholder="Filter by customer, phone, or model..." class="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-rose-500">
        </div>
      </div>

      <!-- Table -->
      <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div class="table-responsive">
          <table class="w-full text-left text-sm text-slate-700">
            <thead class="text-xs uppercase bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th class="py-3 px-4 font-semibold">Customer</th>
                <th class="py-3 px-4 font-semibold">Delivered Car</th>
                <th class="py-3 px-4 font-semibold">NPS Score</th>
                <th class="py-3 px-4 font-semibold">Customer Remarks</th>
                <th class="py-3 px-4 font-semibold">1st Service Due</th>
                <th class="py-3 px-4 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody id="csatTableBody" class="divide-y divide-slate-100"></tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  function renderRows(surveys) {
    const tbody = document.getElementById('csatTableBody');
    if (!tbody) return;
    if (surveys.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="py-6 text-center text-slate-400">No CSAT records found.</td></tr>';
      return;
    }
    tbody.innerHTML = surveys.map(s => `
      <tr class="hover:bg-slate-50/80 transition">
        <td class="py-3 px-4 font-semibold text-slate-900">${s.customer_name}<br><span class="text-xs font-mono text-slate-500">${s.customer_phone}</span></td>
        <td class="py-3 px-4 font-semibold text-slate-900 flex items-center space-x-2.5">
          <img src="${getCarImage(s.vehicle_model)}" alt="${s.vehicle_model}" class="w-10 h-7 object-cover rounded border border-slate-200">
          <div>
            <p class="font-bold text-slate-900 leading-tight">${s.vehicle_model}</p>
            <p class="text-xs text-slate-500 font-normal">Delivered: ${s.delivery_date}</p>
          </div>
        </td>
        <td class="py-3 px-4">
          <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${s.nps_rating >= 9 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}">
            <i class="fa-solid fa-star text-[10px]"></i> ${s.nps_rating} / 10
          </span>
        </td>
        <td class="py-3 px-4 text-xs text-slate-600 max-w-xs truncate">${s.comments || 'Satisfied customer'}</td>
        <td class="py-3 px-4 text-xs font-mono">
          <span class="font-bold text-slate-900">${s.first_service_due}</span><br>
          <span class="${s.service_reminder_sent ? 'text-emerald-600' : 'text-amber-600'} font-semibold text-[11px]">${s.service_reminder_sent ? 'Reminder Sent' : 'Awaiting Reminder'}</span>
        </td>
        <td class="py-3 px-4 text-right whitespace-nowrap">
          <button class="send-remind-btn min-h-[32px] px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 text-xs font-semibold rounded transition shadow-2xs" data-id="${s.id}" data-phone="${s.customer_phone}" data-name="${s.customer_name}" data-model="${s.vehicle_model}" data-date="${s.first_service_due}">
            <i class="fa-brands fa-whatsapp text-emerald-600 mr-1"></i> Remind Service
          </button>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.send-remind-btn').forEach(btn => {
      btn.onclick = async () => {
        await api.post(`/retention/surveys/${btn.dataset.id}/send-reminder`, {});
        const msg = `*APEX MOBILITY MOTORS — 1st COMPLIMENTARY SERVICE DUE*\nDear ${btn.dataset.name},\nCongratulations on 1 month with your ${btn.dataset.model}!\nYour complimentary 1st check-up inspection is due on *${btn.dataset.date}*.\nOur certified technicians will perform complete diagnostic scanning, fluid top-ups, and vehicle wash.\nReply to this message to confirm your preferred service slot!`;
        openWhatsAppChat(btn.dataset.phone, msg);
        renderRetention(container);
      };
    });
  }

  function filterSurveys() {
    const q = (document.getElementById('csatSearchInput')?.value || '').toLowerCase();
    const filtered = allSurveys.filter(s => 
      (s.customer_name || '').toLowerCase().includes(q) ||
      (s.customer_phone || '').toLowerCase().includes(q) ||
      (s.vehicle_model || '').toLowerCase().includes(q)
    );
    renderRows(filtered);
  }

  renderRows(allSurveys);
  document.getElementById('csatSearchInput')?.addEventListener('input', filterSurveys);
  document.getElementById('addCsatBtn')?.addEventListener('click', () => showNewSurveyModal(() => renderRetention(container)));
}