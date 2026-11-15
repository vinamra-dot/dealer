import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/db.js';

export async function listGatepasses(req, res, next) {
  try {
    const sql = `
      SELECT gp.*, 
             v.model, v.variant, v.vin, v.color,
             u.name AS driver_name,
             b.otf_number
      FROM pdi_gatepasses gp
      JOIN vehicles v ON gp.vehicle_id = v.id
      LEFT JOIN users u ON gp.driver_id = u.id
      LEFT JOIN bookings b ON gp.booking_id = b.id
      WHERE gp.dealership_id = $1
      ORDER BY gp.created_at DESC;
    `;
    const result = await query(sql, [req.user.dealership_id]);
    return res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    return next(err);
  }
}

export async function createGatepass(req, res, next) {
  try {
    const { vehicle_id, booking_id, driver_id, pass_type, starting_odometer, checklist_json, scratch_photo_url } = req.body;
    if (!vehicle_id) {
      return res.status(400).json({ success: false, error: 'Vehicle ID is required.' });
    }

    const id = `gp-${uuidv4().slice(0, 8)}`;
    const driver = driver_id || (req.user.role === 'DRIVER' ? req.user.id : null);

    const result = await query(
      `INSERT INTO pdi_gatepasses (id, dealership_id, vehicle_id, booking_id, driver_id, pass_type, starting_odometer, checklist_json, scratch_photo_url, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'IN_TRANSIT')
       RETURNING *;`,
      [id, req.user.dealership_id, vehicle_id, booking_id || null, driver, pass_type || 'YARD_TO_SHOWROOM', parseInt(starting_odometer || '12', 10), checklist_json || '{"body_dents":false,"battery_ok":true,"tool_kit":true}', scratch_photo_url || null]
    );

    // Update vehicle status to IN_TRANSIT
    await query(`UPDATE vehicles SET status = 'IN_TRANSIT' WHERE id = $1;`, [vehicle_id]);

    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    return next(err);
  }
}

export async function completeGatepass(req, res, next) {
  try {
    const { id } = req.params;
    const { ending_odometer, inspection_remarks } = req.body;

    const gpResult = await query(
      `UPDATE pdi_gatepasses 
       SET status = 'COMPLETED', ending_odometer = $1
       WHERE id = $2 AND dealership_id = $3
       RETURNING *;`,
      [parseInt(ending_odometer || '28', 10), id, req.user.dealership_id]
    );

    if (gpResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Gate pass not found.' });
    }

    const gp = gpResult.rows[0];
    // Update vehicle to AVAILABLE in Showroom
    await query(`UPDATE vehicles SET status = 'AVAILABLE', yard_location = 'Showroom Floor PDI Cleared' WHERE id = $1;`, [gp.vehicle_id]);

    return res.json({ success: true, message: 'Vehicle transit completed and PDI cleared.', data: gp });
  } catch (err) {
    return next(err);
  }
}
