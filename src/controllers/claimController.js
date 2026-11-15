import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/db.js';

export async function listClaims(req, res, next) {
  try {
    const sql = `
      SELECT c.*, b.otf_number, l.customer_name, v.model AS vehicle_model, v.vin
      FROM oem_claims c
      JOIN bookings b ON c.booking_id = b.id
      JOIN leads l ON b.lead_id = l.id
      LEFT JOIN vehicles v ON b.vehicle_id = v.id
      WHERE c.dealership_id = $1
      ORDER BY c.created_at DESC;
    `;
    const result = await query(sql, [req.user.dealership_id]);
    return res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    return next(err);
  }
}

export async function generateBookingClaims(req, res, next) {
  try {
    const { booking_id } = req.body;
    if (!booking_id) {
      return res.status(400).json({ success: false, error: 'Booking ID is required.' });
    }

    const bookingRes = await query(
      `SELECT b.*, v.model FROM bookings b 
       LEFT JOIN vehicles v ON b.vehicle_id = v.id
       WHERE b.id = $1 AND b.dealership_id = $2;`,
      [booking_id, req.user.dealership_id]
    );

    if (bookingRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Booking not found.' });
    }

    // Auto-create standard OEM Incentive Claims:
    // 1. Retail Target Incentive: Rs 25,000
    // 2. Exchange Bonus Scheme: Rs 20,000
    // 3. Corporate Scheme Reimbursement: Rs 10,000
    const claims = [
      { type: 'OEM_RETAIL_INCENTIVE', amount: 25000 },
      { type: 'EXCHANGE_BONUS_SCHEME', amount: 20000 },
      { type: 'CORPORATE_SCHEME_CLAIM', amount: 10000 }
    ];

    const createdClaims = [];
    for (const c of claims) {
      const claimId = `clm-${uuidv4().slice(0, 8)}`;
      const refNo = `OEM-CLM-${Date.now().toString().slice(-6)}`;
      const ins = await query(
        `INSERT INTO oem_claims (id, dealership_id, booking_id, claim_type, amount, submission_status, claim_reference_no)
         VALUES ($1, $2, $3, $4, $5, 'PENDING_OEM', $6)
         RETURNING *;`,
        [claimId, req.user.dealership_id, booking_id, c.type, c.amount, refNo]
      );
      createdClaims.push(ins.rows[0]);
    }

    return res.status(201).json({ success: true, count: createdClaims.length, data: createdClaims });
  } catch (err) {
    return next(err);
  }
}

export async function updateClaimStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { submission_status, claim_reference_no } = req.body;

    const result = await query(
      `UPDATE oem_claims 
       SET submission_status = COALESCE($1, submission_status),
           claim_reference_no = COALESCE($2, claim_reference_no)
       WHERE id = $3 AND dealership_id = $4
       RETURNING *;`,
      [submission_status, claim_reference_no, id, req.user.dealership_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Claim record not found.' });
    }

    return res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    return next(err);
  }
}
