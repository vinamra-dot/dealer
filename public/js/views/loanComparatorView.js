import { openWhatsAppChat } from '../utils/whatsapp.js';

export function renderLoanComparator(container) {
  container.innerHTML = `
    <div class="space-y-6">
      <div>
        <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Live Bank EMI & Loan Comparator</h2>
        <p class="text-sm text-slate-500">Instant multi-bank financing comparison across HDFC, SBI, ICICI & Kotak.</p>
      </div>

      <!-- Interactive Calculator Controls -->
      <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">On-Road Vehicle Price (₹)</label>
            <input type="number" id="calcPrice" value="2000000" step="50000" class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-base font-bold font-mono text-slate-900 focus:outline-none focus:border-indigo-500">
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Customer Down Payment (₹)</label>
            <input type="number" id="calcDownPay" value="400000" step="25000" class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-base font-bold font-mono text-slate-900 focus:outline-none focus:border-indigo-500">
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Loan Tenure</label>
            <select id="calcTenure" class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-base font-bold text-slate-900 focus:outline-none focus:border-indigo-500">
              <option value="36">3 Years (36 Months)</option>
              <option value="60" selected>5 Years (60 Months)</option>
              <option value="84">7 Years (84 Months)</option>
            </select>
          </div>
        </div>

        <div class="flex items-center justify-between p-3.5 bg-indigo-50 border border-indigo-100 rounded-lg">
          <div>
            <span class="text-xs text-indigo-700 font-semibold uppercase">Net Finance Principal:</span>
            <span id="dispPrincipal" class="text-lg font-black text-indigo-950 font-mono ml-2">₹16,00,000</span>
          </div>
          <button id="shareEmiWhatsAppBtn" class="min-h-[40px] px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs flex items-center space-x-1.5 transition shadow-2xs">
            <i class="fa-brands fa-whatsapp text-sm"></i>
            <span>Share Comparison on WhatsApp</span>
          </button>
        </div>
      </div>

      <!-- Bank Cards Grid -->
      <div id="bankCardsGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"></div>
    </div>
  `;

  const banks = [
    { name: 'HDFC Bank', rate: 8.75, tag: 'Instant Digital DO', color: 'border-blue-300 bg-blue-50/30' },
    { name: 'State Bank of India', rate: 8.65, tag: 'Lowest Interest Rate', color: 'border-emerald-300 bg-emerald-50/30' },
    { name: 'ICICI Bank', rate: 8.85, tag: 'Pre-Approved Sanction', color: 'border-amber-300 bg-amber-50/30' },
    { name: 'Kotak Prime', rate: 8.90, tag: '100% On-Road Funding', color: 'border-purple-300 bg-purple-50/30' }
  ];

  function calculateEmi(p, annualRate, months) {
    const r = annualRate / 12 / 100;
    const emi = (p * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
    const totalPayable = emi * months;
    const totalInterest = totalPayable - p;
    return { emi: Math.round(emi), totalPayable: Math.round(totalPayable), totalInterest: Math.round(totalInterest) };
  }

  function updateCards() {
    const price = parseFloat(document.getElementById('calcPrice').value || 0);
    const down = parseFloat(document.getElementById('calcDownPay').value || 0);
    const months = parseInt(document.getElementById('calcTenure').value || 60);
    const principal = Math.max(0, price - down);

    document.getElementById('dispPrincipal').textContent = `₹${principal.toLocaleString('en-IN')}`;
    const grid = document.getElementById('bankCardsGrid');

    grid.innerHTML = banks.map(b => {
      const { emi, totalInterest } = calculateEmi(principal, b.rate, months);
      return `
        <div class="bg-white border ${b.color} rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 class="font-bold text-slate-900 text-sm">${b.name}</h3>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">${b.rate}% p.a.</span>
            </div>
            <p class="text-[11px] font-semibold text-indigo-600 mt-2">${b.tag}</p>
            <div class="mt-4">
              <span class="text-[11px] uppercase tracking-wider font-bold text-slate-400">Monthly EMI</span>
              <p class="text-2xl font-black text-slate-900 font-mono mt-0.5">₹${emi.toLocaleString('en-IN')}</p>
            </div>
          </div>
          <div class="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-1">
            <div class="flex justify-between">
              <span>Total Interest:</span>
              <span class="font-mono font-medium text-slate-700">₹${totalInterest.toLocaleString('en-IN')}</span>
            </div>
            <div class="flex justify-between">
              <span>Tenure:</span>
              <span class="font-medium text-slate-700">${months / 12} Years (${months} Mo)</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  document.getElementById('calcPrice').addEventListener('input', updateCards);
  document.getElementById('calcDownPay').addEventListener('input', updateCards);
  document.getElementById('calcTenure').addEventListener('change', updateCards);

  document.getElementById('shareEmiWhatsAppBtn').onclick = () => {
    const price = parseFloat(document.getElementById('calcPrice').value || 0);
    const down = parseFloat(document.getElementById('calcDownPay').value || 0);
    const months = parseInt(document.getElementById('calcTenure').value || 60);
    const principal = Math.max(0, price - down);

    let msg = `*APEX MOBILITY MOTORS — LIVE BANK EMI COMPARISON*\n`;
    msg += `• Vehicle On-Road Price: ₹${price.toLocaleString('en-IN')}\n`;
    msg += `• Down Payment: ₹${down.toLocaleString('en-IN')}\n`;
    msg += `• Loan Principal: ₹${principal.toLocaleString('en-IN')} (${months / 12} Yrs)\n---------------------------------\n`;
    banks.forEach(b => {
      const { emi } = calculateEmi(principal, b.rate, months);
      msg += `⭐ *${b.name}* (${b.rate}%): ₹${emi.toLocaleString('en-IN')}/month\n`;
    });
    msg += `---------------------------------\nReply to book your test drive or get instant DO sanction!`;
    openWhatsAppChat('+919876543210', msg);
  };

  updateCards();
}