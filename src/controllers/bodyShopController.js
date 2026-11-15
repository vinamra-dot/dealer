import { query } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

export async function listClaims(req, res, next) {
  try {
    const result = await query(
      `SELECT * FROM accidental_claims WHERE dealership_id = $1 ORDER BY created_at DESC;`,
      [req.user.dealership_id]
    );
    return res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    return next(err);
  }
}

export async function createClaim(req, res, next) {
  try {
    const { customer_name, customer_phone, vehicle_model, reg_number, insurance_company, policy_number, surveyor_name, surveyor_phone, estimated_loss, damage_description } = req.body;
    if (!customer_name || !reg_number || !insurance_company) {
      return res.status(400).json({ success: false, error: 'Customer name, vehicle registration number, and insurance company are required.' });
    }

    const id = `claim-${uuidv4().slice(0, 8)}`;
    const claimNumber = `CLM-2026-${Date.now().toString().slice(-4)}`;

    const result = await query(
      `INSERT INTO accidental_claims (id, dealership_id, claim_number, customer_name, customer_phone, vehicle_model, reg_number, insurance_company, policy_number, surveyor_name, surveyor_phone, estimated_loss, approved_amount, customer_deductible, claim_status, damage_description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 0.00, 1000.00, 'SURVEY_SCHEDULED', $13)
       RETURNING *;`,
      [id, req.user.dealership_id, claimNumber, customer_name, customer_phone || '+91-9820000000', vehicle_model || 'Harrier', reg_number, insurance_company, policy_number || 'POLICY-NEW', surveyor_name || 'Assigned Surveyor', surveyor_phone || null, parseFloat(estimated_loss || 35000), damage_description || 'Accidental repair intake']
    );

    return res.status(201).json({ success: true, message: 'Accidental insurance claim registered.', data: result.rows[0] });
  } catch (err) {
    return next(err);
  }
}

export async function approveSurveyorClaim(req, res, next) {
  try {
    const { id } = req.params;
    const { approved_amount, surveyor_remarks } = req.body;

    const current = await query(`SELECT * FROM accidental_claims WHERE id = $1;`, [id]);
    if (current.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Claim record not found.' });
    }

    const sanctioned = parseFloat(approved_amount || current.rows[0].estimated_loss);
    const updated = await query(
      `UPDATE accidental_claims
       SET approved_amount = $1, claim_status = 'CASHLESS_SANCTIONED'
       WHERE id = $2
       RETURNING *;`,
      [sanctioned, id]
    );

    return res.json({ success: true, message: `Cashless sanction of ₹${sanctioned.toLocaleString('en-IN')} approved by insurance surveyor.`, data: updated.rows[0] });
  } catch (err) {
    return next(err);
  }
}
