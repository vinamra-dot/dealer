import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/db.js';

export async function listHandovers(req, res, next) {
  try {
    const sql = `
      SELECT dh.*, b.otf_number, l.customer_name, l.phone AS customer_phone,
             v.model, v.variant, v.vin, v.color
      FROM delivery_handovers dh
      JOIN bookings b ON dh.booking_id = b.id
      JOIN leads l ON b.lead_id = l.id
      LEFT JOIN vehicles v ON b.vehicle_id = v.id
      WHERE dh.dealership_id = $1
      ORDER BY dh.created_at DESC;
    `;
    const result = await query(sql, [req.user.dealership_id]);
    return res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    return next(err);
  }
}

export async function completeHandover(req, res, next) {
  try {
    const { booking_id, csi_rating, customer_remarks } = req.body;
    if (!booking_id) {
      return res.status(400).json({ success: false, error: 'Booking ID is required.' });
    }

    const id = `dh-${uuidv4().slice(0, 8)}`;
    const rating = parseInt(csi_rating || '10', 10);

    const result = await query(
      `INSERT INTO delivery_handovers (id, dealership_id, booking_id, ledger_balance_cleared, keys_handed_over, toolkit_verified, fastag_affixed, csi_rating, customer_remarks)
       VALUES ($1, $2, $3, true, true, true, true, $4, $5)
       RETURNING *;`,
      [id, req.user.dealership_id, booking_id, rating, customer_remarks || 'Customer delighted with handover ceremonies.']
    );

    // Update booking status to DELIVERED
    await query(`UPDATE bookings SET booking_status = 'DELIVERED' WHERE id = $1;`, [booking_id]);

    // Also update vehicle to DELIVERED
    const bk = await query(`SELECT vehicle_id FROM bookings WHERE id = $1;`, [booking_id]);
    if (bk.rows[0]?.vehicle_id) {
      await query(`UPDATE vehicles SET status = 'DELIVERED', yard_location = 'Delivered to Customer' WHERE id = $1;`, [bk.rows[0].vehicle_id]);
    }

    return res.status(201).json({ success: true, message: 'VIP delivery completed and CSI recorded.', data: result.rows[0] });
  } catch (err) {
    return next(err);
  }
}
