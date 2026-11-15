import { query } from '../config/db.js';
import { getExtensionSeedData } from './seedExtensions.js';

export async function runExtensionSeeds() {
  const { kycList, jobCards, spareParts, csatSurveys } = getExtensionSeedData();

  for (const k of kycList) {
    await query(
      `INSERT INTO customer_kyc (id, dealership_id, customer_name, customer_phone, pan_number, aadhaar_masked, doc_type, verification_status, uploaded_files, verified_by, remarks)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) ON CONFLICT (id) DO NOTHING;`,
      [k.id, k.dealership_id, k.customer_name, k.customer_phone, k.pan_number, k.aadhaar_masked, k.doc_type, k.verification_status, k.uploaded_files, k.verified_by, k.remarks]
    );
  }

  for (const j of jobCards) {
    await query(
      `INSERT INTO service_job_cards (id, dealership_id, job_card_number, customer_name, customer_phone, vehicle_model, reg_number, odometer_in, fuel_level, service_type, bay_number, advisor_name, technician_name, estimated_cost, actual_cost, status, complaints)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) ON CONFLICT (id) DO NOTHING;`,
      [j.id, j.dealership_id, j.job_card_number, j.customer_name, j.customer_phone, j.vehicle_model, j.reg_number, j.odometer_in, j.fuel_level, j.service_type, j.bay_number, j.advisor_name, j.technician_name, j.estimated_cost, j.actual_cost, j.status, j.complaints]
    );
  }

  for (const p of spareParts) {
    await query(
      `INSERT INTO spare_parts (id, dealership_id, part_number, part_name, category, bin_location, stock_quantity, min_stock_alert, unit_price, compatibility)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) ON CONFLICT (id) DO NOTHING;`,
      [p.id, p.dealership_id, p.part_number, p.part_name, p.category, p.bin_location, p.stock_quantity, p.min_stock_alert, p.unit_price, p.compatibility]
    );
  }

  for (const c of csatSurveys) {
    await query(
      `INSERT INTO csat_surveys (id, dealership_id, customer_name, customer_phone, vehicle_model, delivery_date, nps_rating, feedback_category, comments, survey_status, first_service_due, service_reminder_sent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) ON CONFLICT (id) DO NOTHING;`,
      [c.id, c.dealership_id, c.customer_name, c.customer_phone, c.vehicle_model, c.delivery_date, c.nps_rating, c.feedback_category, c.comments, c.survey_status, c.first_service_due, c.service_reminder_sent]
    );
  }
}