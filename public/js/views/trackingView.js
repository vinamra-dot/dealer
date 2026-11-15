import { api } from '../api.js';
import { printTaxInvoice, printQuotationDoc } from '../utils/printDocument.js';
import { openWhatsAppChat } from '../utils/whatsapp.js';
import { renderTransportGps } from './transportGpsView.js';

export function renderTracking(container) {
  container.innerHTML = `
    <div class="max-w-4xl mx-auto space-y-6">
      <div class="text-center space-y-2 py-4">
        <span class="px-3 py-1 bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-bold rounded-full uppercase tracking-wider">
          <i class="fa-solid fa-satellite-dish mr-1 text-cyan-600 animate-pulse"></i> Customer Self-Service Portal
        </span>
        <h2 class="text-3xl font-extrabold text-slate-900 tracking-tight">Track Your New Vehicle Order</h2>
        <p class="text-sm text-slate-500 max-w-lg mx-auto">Real-time status tracking from factory chassis allotment to VIP showroom handover.</p>
      </div>

      <!-- Tracking Search Box -->
      <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <form id="trackForm" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Registered Mobile Number *</label>
              <input type="tel" id="trackPhone" value="+91-9828067890" required class="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 font-mono text-sm focus:outline-none focus:border-cyan-500">
            </div>
            <div>
              <div class="flex justify-between items-center mb-1">
                <label class="block text-xs font-bold text-slate-700 uppercase">OTF Booking Number *</label>
                <button type="button" id="loadSampleOtfBtn" class="text-xs text-cyan-700 font-semibold hover:underline">Sample OTF</button>
              </div>
              <input type="text" id="trackOtf" value="OTF-892101" required class="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 font-mono uppercase text-sm focus:outline-none focus:border-cyan-500">
            </div>
          </div>
          <button type="submit" class="w-full min-h-[46px] bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl text-sm transition shadow-sm flex items-center justify-center space-x-2">
            <i class="fa-solid fa-magnifying-glass"></i>
            <span>Track Order Status</span>
          </button>
        </form>
      </div>

      <!-- Result Container -->
      <div id="trackResultContainer" class="hidden space-y-6"></div>
    </div>
  `;

  document.getElementById('loadSampleOtfBtn')?.addEventListener('click', () => {
    document.getElementById('trackPhone').value = '+91-9828067890';
    document.getElementById('trackOtf').value = 'OTF-892101';
  });

  document.getElementById('trackForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const phone = document.getElementById('trackPhone').value;
    const otf_number = document.getElementById('trackOtf').value;
    const resBox = document.getElementById('trackResultContainer');

    resBox.classList.remove('hidden');
    resBox.innerHTML = '<div class="text-center py-8 text-slate-400"><i class="fa-solid fa-spinner fa-spin text-2xl text-cyan-600"></i><p class="mt-2 text-xs">Querying central dealership database...</p></div>';

    try {
      const res = await api.post('/tracking/track', { phone, otf_number });
      const { order, steps } = res.data;

      resBox.innerHTML = `
        <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
            <div>
              <span class="text-xs font-mono font-bold text-cyan-700 uppercase">OTF #${order.otf_number}</span>
              <h3 class="text-xl font-black text-slate-900 mt-0.5">${order.vehicle_model} (${order.variant})</h3>
              <p class="text-xs text-slate-500 font-mono">Chassis VIN: <span class="text-emerald-700 font-bold">${order.vin}</span></p>
            </div>
            <div class="text-right">
              <span class="px-3 py-1 rounded-full text-xs font-bold bg-cyan-50 text-cyan-700 border border-cyan-200">${order.booking_status}</span>
              <p class="text-xs text-slate-500 mt-1">Est. Handover: <span class="font-bold text-slate-800">${order.eta_delivery}</span></p>
            </div>
          </div>

          <!-- Stepper -->
          <div class="space-y-4">
            <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Production & Delivery Timeline</h4>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
              ${steps.map(s => `
                <div class="p-3.5 rounded-xl border ${s.completed ? 'bg-emerald-50/50 border-emerald-200' : s.current ? 'bg-cyan-50/50 border-cyan-300 ring-2 ring-cyan-500/20' : 'bg-slate-50 border-slate-200'}">
                  <div class="flex items-center space-x-2">
                    <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${s.completed ? 'bg-emerald-600 text-white' : s.current ? 'bg-cyan-600 text-white' : 'bg-slate-300 text-slate-600'}">
                      ${s.completed ? '<i class="fa-solid fa-check text-[10px]"></i>' : s.step}
                    </span>
                    <span class="text-xs font-bold ${s.completed ? 'text-emerald-950' : s.current ? 'text-cyan-950' : 'text-slate-500'}">${s.title}</span>
                  </div>
                  <p class="text-[11px] text-slate-600 mt-2 leading-relaxed">${s.desc}</p>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Quick Action Buttons -->
          <div class="pt-4 border-t border-slate-100 flex flex-wrap gap-2.5">
            <button id="custInvBtn" class="min-h-[40px] px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-lg border border-slate-300 transition flex items-center space-x-1.5">
              <i class="fa-solid fa-file-invoice text-slate-600"></i><span>Download Tax Invoice</span>
            </button>
            <button id="custGpsBtn" class="min-h-[40px] px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-xs rounded-lg transition shadow-2xs flex items-center space-x-1.5">
              <i class="fa-solid fa-satellite-dish"></i><span>Factory Transit GPS</span>
            </button>
            <button id="custChatBtn" class="min-h-[40px] px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition shadow-2xs flex items-center space-x-1.5">
              <i class="fa-brands fa-whatsapp"></i><span>Chat with Relationship Manager</span>
            </button>
          </div>
        </div>
      `;

      document.getElementById('custInvBtn')?.addEventListener('click', () => {
        printTaxInvoice({ otf_number: order.otf_number, customer_name: order.customer_name, vehicle_model: order.vehicle_model, vin: order.vin, booking_amount: order.deposit_paid });
      });

      document.getElementById('custGpsBtn')?.addEventListener('click', () => {
        renderTransportGps(container, order.otf_number);
      });

      document.getElementById('custChatBtn')?.addEventListener('click', () => {
        const msg = `Hello Apex Mobility, I am tracking my vehicle order for OTF #${order.otf_number} (${order.vehicle_model}). Please share delivery updates!`;
        openWhatsAppChat('+919876543210', msg);
      });

    } catch (err) {
      resBox.innerHTML = `<div class="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">${err.message || 'Order not found.'}</div>`;
    }
  });
}