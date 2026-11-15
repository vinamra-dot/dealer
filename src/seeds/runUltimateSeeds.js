import { query } from '../config/db.js';
import { getUltimateSeedData } from './seedUltimate.js';

export async function runUltimateSeeds() {
  const { accidentalClaims, auctions, compliance } = getUltimateSeedData();

  for (const c of accidentalClaims) {
    await query(
      `INSERT INTO accidental_claims (id, dealership_id, claim_number, customer_name, customer_phone, vehicle_model, reg_number, insurance_company, policy_number, surveyor_name, surveyor_phone, estimated_loss, approved_amount, customer_deductible, claim_status, damage_description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
       ON CONFLICT (id) DO NOTHING;`,
      [c.id, c.dealership_id, c.claim_number, c.customer_name, c.customer_phone, c.vehicle_model, c.reg_number, c.insurance_company, c.policy_number, c.surveyor_name, c.surveyor_phone, c.estimated_loss, c.approved_amount, c.customer_deductible, c.claim_status, c.damage_description]
    );
  }

  for (const a of auctions) {
    await query(
      `INSERT INTO exchange_auctions (id, dealership_id, used_car_id, vehicle_name, reg_number, evaluator_name, starting_bid, current_highest_bid, highest_bidder, auction_status, total_bids)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (id) DO NOTHING;`,
      [a.id, a.dealership_id, a.used_car_id, a.vehicle_name, a.reg_number, a.evaluator_name, a.starting_bid, a.current_highest_bid, a.highest_bidder, a.auction_status, a.total_bids]
    );
  }

  for (const f of compliance) {
    await query(
      `INSERT INTO compliance_fitment (id, dealership_id, booking_id, otf_number, customer_name, vehicle_model, vin, reg_number, front_hsrp_laser_code, rear_hsrp_laser_code, fastag_barcode, fastag_bank, fastag_status, hsrp_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       ON CONFLICT (id) DO NOTHING;`,
      [f.id, f.dealership_id, f.booking_id, f.otf_number, f.customer_name, f.vehicle_model, f.vin, f.reg_number, f.front_hsrp_laser_code, f.rear_hsrp_laser_code, f.fastag_barcode, f.fastag_bank, f.fastag_status, f.hsrp_status]
    );
  }
}
