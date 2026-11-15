export function printTaxInvoice(booking) {
  const modal = document.getElementById('appModal');
  const content = document.getElementById('modalContent');

  const price = parseFloat(booking.ex_showroom_price || 1929000);
  const basePrice = Math.round(price / 1.43); // 28% GST + 15% Cess = 43%
  const gstAmount = Math.round(basePrice * 0.28);
  const cessAmount = Math.round(basePrice * 0.15);

  content.innerHTML = `
    <div id="printArea" class="bg-white p-6 rounded-xl text-slate-900 font-sans space-y-6 text-xs border border-slate-200">
      <!-- Letterhead -->
      <div class="flex justify-between items-start border-b border-slate-300 pb-4">
        <div>
          <h2 class="text-xl font-black text-blue-900 tracking-tight">APEX MOBILITY MOTORS PVT. LTD.</h2>
          <p class="text-slate-600">Apex Towers, New Link Road, Andheri West, Mumbai - 400053 (Pune: Baner Road)</p>
          <p class="text-slate-600 font-mono">GSTIN: 27AAACA1234F1Z8 • State Code: 27 (Maharashtra)</p>
        </div>
        <div class="text-right">
          <span class="bg-slate-100 text-slate-800 font-bold px-2.5 py-1 rounded border border-slate-300 uppercase tracking-wider text-[11px]">Tax Invoice</span>
          <p class="font-mono mt-1 font-semibold">INV-2026-${booking.otf_number || '892101'}</p>
          <p class="text-slate-500">${new Date().toLocaleDateString('en-IN')}</p>
        </div>
      </div>

      <!-- Customer & Financier Details -->
      <div class="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
        <div>
          <p class="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Billed To (Customer):</p>
          <p class="font-bold text-sm text-slate-900">${booking.customer_name || 'Valued Customer'}</p>
          <p class="text-slate-600">Contact: ${booking.customer_phone || '+91-9828067890'}</p>
          <p class="text-slate-600">Email: ${booking.customer_email || 'customer@example.com'}</p>
        </div>
        <div>
          <p class="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Hypothecation & Vehicle Details:</p>
          <p class="text-slate-800">Financier: <strong class="text-blue-900">HDFC Bank Auto Loan Ltd.</strong></p>
          <p class="text-slate-800">Chassis / VIN: <strong class="font-mono text-emerald-800">${booking.vin || 'MAT621001PA001'}</strong></p>
          <p class="text-slate-800">Engine No: <strong class="font-mono">${booking.engine_no || 'ENG-D20-802'}</strong></p>
        </div>
      </div>

      <!-- Itemized Tax Table -->
      <table class="w-full text-left border border-slate-200">
        <thead class="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
          <tr>
            <th class="p-2">Description of Goods</th>
            <th class="p-2">HSN Code</th>
            <th class="p-2 text-right">Taxable Value</th>
            <th class="p-2 text-right">GST (28%)</th>
            <th class="p-2 text-right">Cess (15%)</th>
            <th class="p-2 text-right">Total (₹)</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200">
          <tr>
            <td class="p-2 font-semibold">${booking.vehicle_model || 'Nexon EV'} (${booking.variant || 'Empowered'})</td>
            <td class="p-2 font-mono">8703</td>
            <td class="p-2 text-right font-mono">₹${basePrice.toLocaleString('en-IN')}</td>
            <td class="p-2 text-right font-mono">₹${gstAmount.toLocaleString('en-IN')}</td>
            <td class="p-2 text-right font-mono">₹${cessAmount.toLocaleString('en-IN')}</td>
            <td class="p-2 text-right font-bold font-mono">₹${price.toLocaleString('en-IN')}</td>
          </tr>
        </tbody>
      </table>

      <!-- Signatures -->
      <div class="flex justify-between items-end pt-6">
        <div class="text-[10px] text-slate-500 max-w-xs">
          Certified that vehicle particulars above are true and goods are delivered in sound physical condition.
        </div>
        <div class="text-center">
          <div class="border-b border-slate-400 w-44 pb-8 text-slate-400 text-[10px]">Authorized Dealership Signatory</div>
          <p class="font-bold text-[10px] mt-1 text-slate-700">For APEX MOBILITY MOTORS</p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-end gap-2 pt-4 border-t border-slate-200 no-print">
        <button id="closeModal" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg">Close</button>
        <button id="printBtn" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm">
          <i class="fa-solid fa-print mr-1"></i> Print Tax Invoice (PDF)
        </button>
      </div>
    </div>
  `;

  modal.classList.remove('hidden');
  document.getElementById('closeModal').onclick = () => modal.classList.add('hidden');
  document.getElementById('printBtn').onclick = () => window.print();
}

export function printQuotationDoc(q) {
  const modal = document.getElementById('appModal');
  const content = document.getElementById('modalContent');

  content.innerHTML = `
    <div id="printArea" class="bg-white p-6 rounded-xl text-slate-900 font-sans space-y-6 text-xs border border-slate-200">
      <div class="flex justify-between items-start border-b border-slate-300 pb-4">
        <div>
          <h2 class="text-xl font-black text-blue-900 tracking-tight">APEX MOBILITY MOTORS PVT. LTD.</h2>
          <p class="text-slate-600">Official On-Road Price Quotation</p>
        </div>
        <div class="text-right">
          <span class="bg-purple-50 text-purple-700 border border-purple-200 font-bold px-2 py-0.5 rounded text-[11px]">Quote #${q.id}</span>
          <p class="text-slate-500 mt-1">${new Date().toLocaleDateString('en-IN')}</p>
        </div>
      </div>

      <div class="space-y-2">
        <p>Customer: <strong>${q.customer_name}</strong> (${q.customer_phone})</p>
        <p>Vehicle: <strong>${q.vehicle_model}</strong> (${q.variant})</p>
      </div>

      <table class="w-full text-left border border-slate-200 divide-y divide-slate-200">
        <tr class="bg-slate-50"><td class="p-2">1. Ex-Showroom Price</td><td class="p-2 text-right font-mono font-semibold">₹${parseFloat(q.ex_showroom_price).toLocaleString('en-IN')}</td></tr>
        <tr><td class="p-2">2. RTO Registration & Road Tax</td><td class="p-2 text-right font-mono">₹${parseFloat(q.rto_tax).toLocaleString('en-IN')}</td></tr>
        <tr><td class="p-2">3. Comprehensive Zero-Dep Insurance</td><td class="p-2 text-right font-mono">₹${parseFloat(q.insurance_cost).toLocaleString('en-IN')}</td></tr>
        <tr><td class="p-2">4. Accessories Kit & VAS</td><td class="p-2 text-right font-mono">₹${parseFloat(q.accessories_cost || 0).toLocaleString('en-IN')}</td></tr>
        <tr><td class="p-2">5. Fastag & Registration Charges</td><td class="p-2 text-right font-mono">₹${parseFloat(q.fastag_fee || 600).toLocaleString('en-IN')}</td></tr>
        <tr class="text-rose-700 font-semibold"><td class="p-2">6. Special Festive / Dealer Discount</td><td class="p-2 text-right font-mono">-₹${parseFloat(q.discount_amount || 0).toLocaleString('en-IN')}</td></tr>
        <tr class="bg-blue-50 font-black text-sm text-blue-950"><td class="p-2.5">Final On-Road Price</td><td class="p-2.5 text-right font-mono text-base">₹${parseFloat(q.final_on_road_price).toLocaleString('en-IN')}</td></tr>
      </table>

      <div class="flex justify-end gap-2 pt-4 border-t border-slate-200 no-print">
        <button id="closeModal" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg">Close</button>
        <button id="printBtn" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-sm">
          <i class="fa-solid fa-print mr-1"></i> Print Quotation (PDF)
        </button>
      </div>
    </div>
  `;

  modal.classList.remove('hidden');
  document.getElementById('closeModal').onclick = () => modal.classList.add('hidden');
  document.getElementById('printBtn').onclick = () => window.print();
}
