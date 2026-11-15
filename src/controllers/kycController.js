import { query } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

export async function getKycRecords(req, res, next) {
  try {
    const result = await query(
      `SELECT * FROM customer_kyc 
       WHERE dealership_id = $1 
       ORDER BY created_at DESC;`,
      [req.user.dealership_id]
    );
    return res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    return next(err);
  }
}

export async function createKycRecord(req, res, next) {
  try {
    const { customer_name, customer_phone, pan_number, aadhaar_masked, doc_type, remarks } = req.body;
    if (!customer_name || !customer_phone) {
      return res.status(400).json({ success: false, error: 'Customer name and phone are required.' });
    }

    const id = `kyc-${uuidv4().slice(0, 8)}`;
    const result = await query(
      `INSERT INTO customer_kyc (id, dealership_id, customer_name, customer_phone, pan_number, aadhaar_masked, doc_type, verification_status, remarks)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDING', $8)
       RETURNING *;`,
      [id, req.user.dealership_id, customer_name, customer_phone, pan_number || null, aadhaar_masked || null, doc_type || 'AADHAAR_PAN', remarks || 'Uploaded for RTO documentation']
    );

    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    return next(err);
  }
}

export async function verifyKycRecord(req, res, next) {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;
    const result = await query(
      `UPDATE customer_kyc 
       SET verification_status = $1, remarks = COALESCE($2, remarks), verified_by = $3
       WHERE id = $4 AND dealership_id = $5
       RETURNING *;`,
      [status || 'VERIFIED', remarks, req.user.name, id, req.user.dealership_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'KYC record not found.' });
    }
    return res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    return next(err);
  }
}