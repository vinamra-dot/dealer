export function getWorkflowSeedData() {
  const dId = 'dealership-apex-01';

  const testDrives = [
    { id: 'td-01', lead_id: 'lead-01', vehicle_id: 'veh-02', consultant_id: 'usr-sc1', scheduled_at: new Date(Date.now() + 86400000).toISOString(), duration_mins: 45, status: 'GM_APPROVED', gm_approved: true, route_notes: 'JLN Marg to Airport flyover' },
    { id: 'td-02', lead_id: 'lead-04', vehicle_id: 'veh-05', consultant_id: 'usr-sc2', scheduled_at: new Date(Date.now() - 86400000).toISOString(), duration_mins: 30, status: 'COMPLETED', gm_approved: true, customer_feedback: 'Loved the fast charging and coupe design.', rating: 5, route_notes: 'Ajmer road highway loop' },
    { id: 'td-03', lead_id: 'lead-08', vehicle_id: 'veh-06', consultant_id: 'usr-sc2', scheduled_at: new Date(Date.now() + 172800000).toISOString(), duration_mins: 30, status: 'SCHEDULED', gm_approved: false, route_notes: 'C-Scheme city traffic test' }
  ].map(t => ({ ...t, dealership_id: dId }));

  const quotations = [
    { id: 'qt-101', lead_id: 'lead-02', model: 'Nexon EV', variant: 'Empowered Plus LR', ex_price: 1929000, rto: 192900, ins: 67515, fastag: 600, acc: 25000, disc: 20000, on_road: 2195015, created_by: 'usr-sc1', status: 'ACCEPTED' },
    { id: 'qt-102', lead_id: 'lead-04', model: 'Curvv EV', variant: 'Empowered Plus A 55', ex_price: 2199000, rto: 219900, ins: 76965, fastag: 600, acc: 30000, disc: 15000, on_road: 2511465, created_by: 'usr-sc2', status: 'SENT' },
    { id: 'qt-103', lead_id: 'lead-05', model: 'Punch', variant: 'Creative Flagship DT', ex_price: 960000, rto: 96000, ins: 33600, fastag: 600, acc: 15000, disc: 10000, on_road: 1095200, created_by: 'usr-sc2', status: 'ACCEPTED' },
    { id: 'qt-104', lead_id: 'lead-07', model: 'Harrier', variant: 'Adventure Plus A', ex_price: 2399000, rto: 239900, ins: 83965, fastag: 600, acc: 28000, disc: 25000, on_road: 2726465, created_by: 'usr-sc1', status: 'SENT' }
  ].map(q => ({ ...q, dealership_id: dId }));

  const bookings = [
    { id: 'bk-01', lead_id: 'lead-02', quote_id: 'qt-101', vehicle_id: 'veh-03', otf: 'OTF-892101', amount: 51000, status: 'READY_FOR_DELIVERY', eta: '2026-11-20' },
    { id: 'bk-02', lead_id: 'lead-05', quote_id: 'qt-103', vehicle_id: 'veh-09', otf: 'OTF-892102', amount: 21000, status: 'ALLOCATED', eta: '2026-11-25' },
    { id: 'bk-03', lead_id: 'lead-01', quote_id: 'qt-104', vehicle_id: 'veh-02', otf: 'OTF-892103', amount: 50000, status: 'INVOICED', eta: '2026-11-22' }
  ].map(b => ({ ...b, dealership_id: dId }));

  const finance = [
    { id: 'fin-01', booking_id: 'bk-01', bank: 'HDFC Auto Finance', loan: 1800000, do_num: 'HDFC-DO-88910', do_status: 'APPROVED', payout_pct: 1.5, payout_amt: 27000, remarks: 'DO copy received via branch manager.' },
    { id: 'fin-02', booking_id: 'bk-02', bank: 'SBI Auto Loans', loan: 850000, do_num: 'SBI-DO-12903', do_status: 'PENDING', payout_pct: 1.25, payout_amt: 10625, remarks: 'Awaiting signature from customer.' },
    { id: 'fin-03', booking_id: 'bk-03', bank: 'ICICI Bank Auto Loan', loan: 2200000, do_num: 'ICICI-DO-90311', do_status: 'APPROVED', payout_pct: 1.4, payout_amt: 30800, remarks: 'Subvention scheme approved.' }
  ].map(f => ({ ...f, dealership_id: dId }));

  const payments = [
    { id: 'pay-01', booking_id: 'bk-01', amount: 51000, type: 'BOOKING_DEPOSIT', method: 'UPI', ref: 'UPI-RAZORPAY-89101', verified: true, verifier: 'usr-fin' },
    { id: 'pay-02', booking_id: 'bk-01', amount: 344015, type: 'DOWNPAYMENT', method: 'NEFT', ref: 'NEFT-HDFC-99128', verified: true, verifier: 'usr-fin' },
    { id: 'pay-03', booking_id: 'bk-02', amount: 21000, type: 'BOOKING_DEPOSIT', method: 'CARD', ref: 'POS-PINE-44120', verified: true, verifier: 'usr-fin' },
    { id: 'pay-04', booking_id: 'bk-03', amount: 50000, type: 'BOOKING_DEPOSIT', method: 'CHEQUE', ref: 'CHQ-SBI-001298', verified: true, verifier: 'usr-fin' }
  ].map(p => ({ ...p, dealership_id: dId }));

  const gatepasses = [
    { id: 'gp-01', vehicle_id: 'veh-03', booking_id: 'bk-01', driver_id: 'usr-drv', type: 'YARD_TO_SHOWROOM', start_odo: 14, end_odo: 36, status: 'COMPLETED' },
    { id: 'gp-02', vehicle_id: 'veh-05', driver_id: 'usr-drv', type: 'YARD_TO_SHOWROOM', start_odo: 8, status: 'IN_TRANSIT' },
    { id: 'gp-03', vehicle_id: 'veh-09', booking_id: 'bk-02', driver_id: 'usr-drv', type: 'YARD_TO_SHOWROOM', start_odo: 11, status: 'IN_TRANSIT' }
  ].map(g => ({ ...g, dealership_id: dId }));

  const claims = [
    { id: 'clm-01', booking_id: 'bk-01', type: 'OEM_RETAIL_INCENTIVE', amount: 25000, status: 'PENDING_OEM', ref: 'CLM-OEM-771' },
    { id: 'clm-02', booking_id: 'bk-01', type: 'EXCHANGE_BONUS_SCHEME', amount: 20000, status: 'PENDING_OEM', ref: 'CLM-OEM-772' },
    { id: 'clm-03', booking_id: 'bk-03', type: 'CORPORATE_SCHEME_CLAIM', amount: 15000, status: 'APPROVED', ref: 'CLM-OEM-773' }
  ].map(c => ({ ...c, dealership_id: dId }));

  const usedCars = [
    { id: 'uc-01', name: 'Priyanka Mittal', phone: '+91-9828067890', make: 'Maruti Suzuki', model: 'Swift Dzire VXI', year: 2018, km: 52000, prop: 360000, app: 350000, bkid: 'bk-01', status: 'ADJUSTED_IN_DOWNPAYMENT' },
    { id: 'uc-02', name: 'Dr. Alok Nath', phone: '+91-9414012345', make: 'Hyundai', model: 'Creta 1.6 SX', year: 2017, km: 68000, prop: 580000, app: 560000, bkid: 'bk-03', status: 'APPROVED' },
    { id: 'uc-03', name: 'Ramesh Kumawat', phone: '+91-9988776655', make: 'Honda', model: 'Amaze VX', year: 2019, km: 41000, prop: 420000, app: 410000, bkid: null, status: 'EVALUATED' }
  ].map(u => ({ ...u, dealership_id: dId }));

  const handovers = [
    { id: 'dh-01', bkid: 'bk-01', csi: 10, notes: 'Special flower decoration and family cake cutting celebrated.' }
  ].map(h => ({ ...h, dealership_id: dId }));

  const salesTargets = [
    { id: 'st-01', user_id: 'usr-sc1', month: 'November 2026', t_del: 12, a_del: 7, t_td: 25, a_td: 18 },
    { id: 'st-02', user_id: 'usr-sc2', month: 'November 2026', t_del: 10, a_del: 5, t_td: 20, a_td: 14 }
  ].map(s => ({ ...s, dealership_id: dId }));

  return { testDrives, quotations, bookings, finance, payments, gatepasses, claims, usedCars, handovers, salesTargets };
}
