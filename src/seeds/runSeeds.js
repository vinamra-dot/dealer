import { query, initDb } from '../config/db.js';
import { getCoreSeedData } from './seedCore.js';
import { getWorkflowSeedData } from './seedWorkflow.js';
import { runExtensionSeeds } from './runExtensionSeeds.js';

export async function runSeeds() {
  console.log('[Seeds] Seeding realistic enterprise dealership dataset...');
  await initDb();
  const { dealership, users, vehicles, leads } = await getCoreSeedData();
  const { testDrives, quotations, bookings, finance, payments, gatepasses, claims, usedCars, handovers, salesTargets } = getWorkflowSeedData();

  await query(
    `INSERT INTO dealerships (id, name, city, tier, oem_brand, address)
     VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING;`,
    [dealership.id, dealership.name, dealership.city, dealership.tier, dealership.oem_brand, dealership.address]
  );

  for (const u of users) {
    await query(
      `INSERT INTO users (id, dealership_id, name, email, password_hash, role, phone)
       VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO NOTHING;`,
      [u.id, u.dealership_id, u.name, u.email, u.password_hash, u.role, u.phone]
    );
  }

  for (const v of vehicles) {
    await query(
      `INSERT INTO vehicles (id, dealership_id, model, variant, color, fuel_type, transmission, ex_showroom_price, vin, engine_no, status, yard_location, holding_cost_per_day)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) ON CONFLICT (id) DO NOTHING;`,
      [v.id, v.dealership_id, v.model, v.variant, v.color, v.fuel, v.trans, v.price, v.vin, v.engine, v.status, v.yard, v.cost]
    );
  }

  for (const l of leads) {
    await query(
      `INSERT INTO leads (id, dealership_id, customer_name, phone, email, source, interested_model, budget, status, assigned_to_user_id, telecaller_user_id, remarks)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) ON CONFLICT (id) DO NOTHING;`,
      [l.id, l.dealership_id, l.customer_name, l.phone, l.email, l.source, l.interested_model, l.budget, l.status, l.assigned_to_user_id, l.telecaller_user_id, l.remarks]
    );
  }

  for (const t of testDrives) {
    await query(
      `INSERT INTO test_drives (id, dealership_id, lead_id, vehicle_id, consultant_id, scheduled_at, duration_mins, status, gm_approved, customer_feedback, rating, route_notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) ON CONFLICT (id) DO NOTHING;`,
      [t.id, t.dealership_id, t.lead_id, t.vehicle_id, t.consultant_id, t.scheduled_at, t.duration_mins, t.status, t.gm_approved, t.customer_feedback || null, t.rating || null, t.route_notes]
    );
  }

  for (const q of quotations) {
    await query(
      `INSERT INTO quotations (id, dealership_id, lead_id, vehicle_model, variant, ex_showroom_price, rto_tax, insurance_cost, fastag_fee, accessories_cost, discount_amount, final_on_road_price, created_by_user_id, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) ON CONFLICT (id) DO NOTHING;`,
      [q.id, q.dealership_id, q.lead_id, q.model, q.variant, q.ex_price, q.rto, q.ins, q.fastag, q.acc, q.disc, q.on_road, q.created_by, q.status]
    );
  }

  for (const b of bookings) {
    await query(
      `INSERT INTO bookings (id, dealership_id, lead_id, quotation_id, vehicle_id, otf_number, booking_amount, booking_status, eta_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (id) DO NOTHING;`,
      [b.id, b.dealership_id, b.lead_id, b.quote_id, b.vehicle_id, b.otf, b.amount, b.status, b.eta]
    );
  }

  for (const f of finance) {
    await query(
      `INSERT INTO finance_records (id, dealership_id, booking_id, bank_name, loan_amount, do_number, do_status, payout_percentage, payout_amount, remarks)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) ON CONFLICT (id) DO NOTHING;`,
      [f.id, f.dealership_id, f.booking_id, f.bank, f.loan, f.do_num, f.do_status, f.payout_pct, f.payout_amt, f.remarks]
    );
  }

  for (const p of payments) {
    await query(
      `INSERT INTO payments (id, dealership_id, booking_id, amount, payment_type, method, transaction_ref, cashier_verified, verified_by_user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (id) DO NOTHING;`,
      [p.id, p.dealership_id, p.booking_id, p.amount, p.type, p.method, p.ref, p.verified, p.verifier]
    );
  }

  for (const g of gatepasses) {
    await query(
      `INSERT INTO pdi_gatepasses (id, dealership_id, vehicle_id, booking_id, driver_id, pass_type, starting_odometer, ending_odometer, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (id) DO NOTHING;`,
      [g.id, g.dealership_id, g.vehicle_id, g.booking_id || null, g.driver_id, g.type, g.start_odo, g.end_odo || null, g.status]
    );
  }

  for (const c of claims) {
    await query(
      `INSERT INTO oem_claims (id, dealership_id, booking_id, claim_type, amount, submission_status, claim_reference_no)
       VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO NOTHING;`,
      [c.id, c.dealership_id, c.booking_id, c.type, c.amount, c.status, c.ref]
    );
  }

  for (const u of usedCars) {
    await query(
      `INSERT INTO used_car_exchanges (id, dealership_id, customer_name, phone, make, model, manufacturing_year, kilometers_run, proposed_value, approved_value, new_booking_id, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) ON CONFLICT (id) DO NOTHING;`,
      [u.id, u.dealership_id, u.name, u.phone, u.make, u.model, u.year, u.km, u.prop, u.app, u.bkid, u.status]
    );
  }

  for (const h of handovers) {
    await query(
      `INSERT INTO delivery_handovers (id, dealership_id, booking_id, ledger_balance_cleared, keys_handed_over, toolkit_verified, fastag_affixed, csi_rating, customer_remarks)
       VALUES ($1, $2, $3, true, true, true, true, $4, $5) ON CONFLICT (id) DO NOTHING;`,
      [h.id, h.dealership_id, h.bkid, h.csi, h.notes]
    );
  }

  for (const s of salesTargets) {
    await query(
      `INSERT INTO sales_targets (id, dealership_id, user_id, target_month, target_deliveries, achieved_deliveries, target_test_drives, achieved_test_drives)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO NOTHING;`,
      [s.id, s.dealership_id, s.user_id, s.month, s.t_del, s.a_del, s.t_td, s.a_td]
    );
  }

  await runExtensionSeeds();

  console.log('[Seeds] Successfully seeded complete realistic dealership operations database.');
}

if (process.argv[1].endsWith('runSeeds.js')) {
  runSeeds().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
}
