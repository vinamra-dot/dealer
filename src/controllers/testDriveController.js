import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/db.js';

export async function listTestDrives(req, res, next) {
  try {
    const sql = `
      SELECT td.*, 
             l.customer_name, l.phone AS customer_phone,
             v.model AS vehicle_model, v.variant AS vehicle_variant, v.vin AS vehicle_vin,
             u.name AS consultant_name
      FROM test_drives td
      JOIN leads l ON td.lead_id = l.id
      LEFT JOIN vehicles v ON td.vehicle_id = v.id
      JOIN users u ON td.consultant_id = u.id
      WHERE td.dealership_id = $1
      ORDER BY td.scheduled_at DESC;
    `;
    const result = await query(sql, [req.user.dealership_id]);
    return res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    return next(err);
  }
}

export async function scheduleTestDrive(req, res, next) {
  try {
    const { lead_id, vehicle_id, scheduled_at, duration_mins, route_notes } = req.body;
    if (!lead_id || !scheduled_at) {
      return res.status(400).json({ success: false, error: 'Lead ID and scheduled time are required.' });
    }

    const id = `td-${uuidv4().slice(0, 8)}`;
    const consultantId = req.user.role === 'SALES_CONSULTANT' ? req.user.id : req.body.consultant_id || req.user.id;

    const result = await query(
      `INSERT INTO test_drives (id, dealership_id, lead_id, vehicle_id, consultant_id, scheduled_at, duration_mins, status, route_notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'SCHEDULED', $8)
       RETURNING *;`,
      [id, req.user.dealership_id, lead_id, vehicle_id || null, consultantId, scheduled_at, duration_mins || 30, route_notes || null]
    );

    // Update lead status
    await query(
      `UPDATE leads SET status = 'TEST_DRIVE_SCHEDULED' WHERE id = $1 AND dealership_id = $2;`,
      [lead_id, req.user.dealership_id]
    );

    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    return next(err);
  }
}

export async function approveTestDrive(req, res, next) {
  try {
    const { id } = req.params;
    const result = await query(
      `UPDATE test_drives 
       SET gm_approved = TRUE, status = 'GM_APPROVED'
       WHERE id = $1 AND dealership_id = $2
       RETURNING *;`,
      [id, req.user.dealership_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Test drive record not found.' });
    }

    return res.json({ success: true, message: 'Test drive approved by General Manager.', data: result.rows[0] });
  } catch (err) {
    return next(err);
  }
}

export async function completeTestDrive(req, res, next) {
  try {
    const { id } = req.params;
    const { customer_feedback, rating } = req.body;

    const result = await query(
      `UPDATE test_drives 
       SET status = 'COMPLETED', customer_feedback = $1, rating = $2
       WHERE id = $3 AND dealership_id = $4
       RETURNING *;`,
      [customer_feedback || 'Completed successfully', rating || 5, id, req.user.dealership_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Test drive record not found.' });
    }

    return res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    return next(err);
  }
}
