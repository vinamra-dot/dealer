import { api } from '../api.js';
import { exportTableToCsv } from '../utils/exportCsv.js';

export async function renderAuctions(container) {
  container.innerHTML = '<div class="text-center py-12 text-slate-400"><i class="fa-solid fa-spinner fa-spin text-2xl text-amber-600"></i><p class="mt-2 text-sm">Loading Live B2B Dealer Auctions...</p></div>';
  const res = await api.get('/auctions');
  const auctions = res.data || [];

  container.innerHTML = `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
            <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Used Car B2B Auction Bidding Desk</h2>
          </div>
          <p class="text-sm text-slate-500">Live multi-dealer auction engine connected with Spinny, Cars24 & CarDekho dealer procurement networks.</p>
        </div>
        <div class="flex items-center gap-2">
          <button id="exportAucCsvBtn" class="min-h-[42px] px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-2xs transition">
            <i class="fa-solid fa-file-excel text-emerald-600"></i>
            <span>Export (.csv)</span>
          </button>
        </div>
      </div>

      <!-- Active Auctions Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        ${auctions.map(a => `
          <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition">
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${a.auction_status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'}">
                  ${a.auction_status === 'ACTIVE' ? '● LIVE BIDDING' : '✓ DEAL ACCEPTED'}
                </span>
                <span class="text-xs font-mono font-bold text-slate-700">${a.reg_number}</span>
              </div>
              <h3 class="text-base font-bold text-slate-900 leading-snug">${a.vehicle_name}</h3>
              <p class="text-xs text-slate-500">Evaluator: <strong>${a.evaluator_name}</strong> • ${a.total_bids} bids placed</p>
            </div>

            <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
              <div class="flex justify-between text-slate-500">
                <span>Base Valuation:</span>
                <span class="font-mono">₹${parseFloat(a.starting_bid).toLocaleString('en-IN')}</span>
              </div>
              <div class="flex justify-between items-baseline pt-1 border-t border-slate-200">
                <span class="font-bold text-slate-800">Current High Bid:</span>
                <span class="text-lg font-black font-mono text-emerald-700">₹${parseFloat(a.current_highest_bid).toLocaleString('en-IN')}</span>
              </div>
              <p class="text-[11px] text-blue-700 font-semibold truncate"><i class="fa-solid fa-trophy mr-1 text-amber-500"></i> ${a.highest_bidder || 'Awaiting initial bid'}</p>
            </div>

            <div class="flex gap-2 pt-1">
              ${a.auction_status === 'ACTIVE' ? `
                <button class="place-bid-btn flex-1 min-h-[38px] bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1 shadow-xs transition" data-id="${a.id}" data-current="${a.current_highest_bid}">
                  <i class="fa-solid fa-gavel"></i>
                  <span>Simulate Bid (+15k)</span>
                </button>
                <button class="accept-bid-btn min-h-[38px] px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition" data-id="${a.id}">
                  Accept Offer
                </button>
              ` : `
                <div class="w-full text-center py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold">
                  <i class="fa-solid fa-circle-check mr-1"></i> Offer Accepted & Valuation Locked
                </div>
              `}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  container.querySelectorAll('.place-bid-btn').forEach(btn => {
    btn.onclick = async () => {
      const cur = parseFloat(btn.dataset.current);
      const partners = ['Spinny Direct Procurement', 'Cars24 B2B Network', 'CarDekho Auctions Pro', 'Autovert Maharashtra Hub'];
      const randomPartner = partners[Math.floor(Math.random() * partners.length)];
      await api.post(`/auctions/${btn.dataset.id}/bid`, { bidder_name: randomPartner, bid_amount: cur + 15000 });
      renderAuctions(container);
    };
  });

  container.querySelectorAll('.accept-bid-btn').forEach(btn => {
    btn.onclick = async () => {
      if (confirm('Accept this highest dealer offer to finalize the exchange vehicle price?')) {
        await api.patch(`/auctions/${btn.dataset.id}/accept`);
        renderAuctions(container);
      }
    };
  });

  document.getElementById('exportAucCsvBtn')?.addEventListener('click', () => {
    const headers = ['Vehicle', 'Reg Number', 'Evaluator', 'Base Price', 'Highest Bid', 'Winning Dealer', 'Status', 'Total Bids'];
    const rows = auctions.map(a => [a.vehicle_name, a.reg_number, a.evaluator_name, a.starting_bid, a.current_highest_bid, a.highest_bidder || '', a.auction_status, a.total_bids]);
    exportTableToCsv('Used_Car_B2B_Auctions', headers, rows);
  });
}
