import { api } from '../api.js';
import { exportTableToCsv } from '../utils/exportCsv.js';

export async function renderHsrpFastag(container) {
  container.innerHTML = '<div class="text-center py-12 text-slate-400"><i class="fa-solid fa-spinner fa-spin text-2xl text-blue-600"></i><p class="mt-2 text-sm">Loading HSRP & FASTag Fitment Records...</p></div>';
  const res = await api.get('/compliance');
  const fitments = res.data || [];

  container.innerHTML = `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-slate-900 tracking-tight">HSRP Plates & FASTag Activation Desk</h2>
          <p class="text-sm text-slate-500">Dual laser code mapping on High Security Registration Plates and NETC NPCI FASTag issuance.</p>
        </div>
        <div class="flex items-center gap-2">
          <button id="exportHsrpCsvBtn" class="min-h-[42px] px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-2xs transition">
            <i class="fa-solid fa-file-excel text-emerald-600"></i>
            <span>Export (.csv)</span>
          </button>
        </div>
      </div>

      <!-- Fitment Table -->
      <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div class="table-responsive">
          <table class="w-full text-left text-sm text-slate-700">
            <thead class="text-xs uppercase bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th class="py-3 px-4 font-semibold">OTF / Vehicle</th>
                <th class="py-3 px-4 font-semibold">Customer</th>
                <th class="py-3 px-4 font-semibold">VIN / Chassis</th>
                <th class="py-3 px-4 font-semibold">HSRP Laser Codes</th>
                <th class="py-3 px-4 font-semibold">FASTag Status</th>
                <th class="py-3 px-4 text-right font-semibold">Compliance Actions</th>
              </tr>
            </thead>
            <tbody id="hsrpTableBody" class="divide-y divide-slate-100">
              ${fitments.map(f => `
                <tr class="hover:bg-slate-50/80 transition">
                  <td class="py-3 px-4 font-semibold text-slate-900">
                    <span class="font-mono text-cyan-700 font-bold">${f.otf_number}</span><br>
                    <span class="text-xs text-slate-800">${f.vehicle_model}</span>
                  </td>
                  <td class="py-3 px-4 font-bold text-slate-900 text-xs">${f.customer_name}</td>
                  <td class="py-3 px-4 font-mono text-xs text-slate-700">${f.vin}</td>
                  <td class="py-3 px-4 text-xs font-mono">
                    <span class="text-slate-500">Front:</span> <strong class="text-slate-900">${f.front_hsrp_laser_code || 'Pending'}</strong><br>
                    <span class="text-slate-500">Rear:</span> <strong class="text-slate-900">${f.rear_hsrp_laser_code || 'Pending'}</strong>
                  </td>
                  <td class="py-3 px-4">
                    <span class="px-2.5 py-1 rounded-full text-xs font-semibold ${
                      f.fastag_status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }">
                      <i class="fa-solid fa-tag mr-1"></i> ${f.fastag_status} (${f.fastag_bank || 'IDBI'})
                    </span>
                  </td>
                  <td class="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                    ${f.hsrp_status !== 'AFFIXED' ? `
                      <button class="map-hsrp-btn min-h-[32px] px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold rounded shadow-2xs transition" data-id="${f.id}">
                        Map HSRP Laser
                      </button>
                    ` : '<span class="text-[11px] text-emerald-700 font-semibold mr-1"><i class="fa-solid fa-check"></i> HSRP Affixed</span>'}
                    ${f.fastag_status !== 'ACTIVE' ? `
                      <button class="activate-fastag-btn min-h-[32px] px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded shadow-2xs transition" data-id="${f.id}" data-barcode="${f.fastag_barcode}">
                        Activate FASTag
                      </button>
                    ` : '<span class="text-[11px] text-emerald-700 font-semibold"><i class="fa-solid fa-signal"></i> Active</span>'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  container.querySelectorAll('.map-hsrp-btn').forEach(btn => {
    btn.onclick = async () => {
      const front = prompt('Enter Front 9-Digit HSRP Laser Code:', 'MH02AA99012');
      const rear = prompt('Enter Rear 9-Digit HSRP Laser Code:', 'MH02AA99013');
      if (front && rear) {
        await api.post('/compliance/hsrp-map', { id: btn.dataset.id, front_laser_code: front, rear_laser_code: rear });
        renderHsrpFastag(container);
      }
    };
  });

  container.querySelectorAll('.activate-fastag-btn').forEach(btn => {
    btn.onclick = async () => {
      const barcode = prompt('Scan / Enter FASTag Barcode Number (16 Digits):', btn.dataset.barcode || '60741299881029');
      if (barcode) {
        await api.post('/compliance/fastag-activate', { id: btn.dataset.id, fastag_barcode: barcode, fastag_bank: 'IDBI_BANK' });
        renderHsrpFastag(container);
      }
    };
  });

  document.getElementById('exportHsrpCsvBtn')?.addEventListener('click', () => {
    const headers = ['OTF Number', 'Customer', 'Vehicle', 'VIN', 'Front Laser Code', 'Rear Laser Code', 'FASTag Barcode', 'Bank', 'FASTag Status', 'HSRP Status'];
    const rows = fitments.map(f => [f.otf_number, f.customer_name, f.vehicle_model, f.vin, f.front_hsrp_laser_code, f.rear_hsrp_laser_code, f.fastag_barcode, f.fastag_bank, f.fastag_status, f.hsrp_status]);
    exportTableToCsv('HSRP_FASTag_Compliance_Register', headers, rows);
  });
}
