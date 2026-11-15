import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/db.js';

export async function listBookings(req, res, next) {
  try {
    const sql = `
      SELECT b.*, 
             l.customer_name, l.phone AS customer_phone, l.email AS customer_email,
             v.model AS vehicle_model, v.variant AS vehicle_variant, v.vin, v.color,
             v.engine_no, v.ex_showroom_price,
             q.final_on_road_price, q.rto_tax, q.insurance_cost
      FROM bookings b
      JOIN leads l ON b.lead_id = l.id
      LEFT JOIN vehicles v ON b.vehicle_id = v.id
      LEFT JOIN quotations q ON b.quotation_id = q.id
      WHERE b.dealership_id = $1
      ORDER BY b.created_at DESC;
    `;
    const result = await query(sql, [req.user.dealership_id]);
    return res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    return next(err);
  }
}

export async function createBooking(req, res, next) {
  try {
    const { lead_id, quotation_id, vehicle_id, booking_amount, eta_date } = req.body;
    if (!lead_id || !booking_amount) {
      return res.status(400).json({ success: false, error: 'Lead ID and booking amount are required.' });
    }

    const id = `bk-${uuidv4().slice(0, 8)}`;
    const otfNumber = `OTF-${Date.now().toString().slice(-6)}`;

    const result = await query(
      `INSERT INTO bookings (id, dealership_id, lead_id, quotation_id, vehicle_id, otf_number, booking_amount, booking_status, eta_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'ALLOCATED', $8)
       RETURNING *;`,
      [id, req.user.dealership_id, lead_id, quotation_id || null, vehicle_id || null, otfNumber, parseFloat(booking_amount), eta_date || null]
    );

    if (vehicle_id) {
      await query(`UPDATE vehicles SET status = 'ALLOCATED' WHERE id = $1;`, [vehicle_id]);
    }
    await query(`UPDATE leads SET status = 'BOOKED' WHERE id = $1;`, [lead_id]);

    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    return next(err);
  }
}

export async function updateBookingStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { booking_status } = req.body;

    const result = await query(
      `UPDATE bookings SET booking_status = $1 WHERE id = $2 AND dealership_id = $3 RETURNING *;`,
      [booking_status, id, req.user.dealership_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Booking not found.' });
    }

    if (booking_status === 'DELIVERED' && result.rows[0].vehicle_id) {
      await query(`UPDATE vehicles SET status = 'DELIVERED' WHERE id = $1;`, [result.rows[0].vehicle_id]);
    }

    return res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    return next(err);
  }
}

export async function swapChassis(req, res, next) {
  try {
    const { id } = req.params;
    const { new_vehicle_id } = req.body;

    const bkRes = await query(`SELECT vehicle_id FROM bookings WHERE id = $1 AND dealership_id = $2;`, [id, req.user.dealership_id]);
    if (bkRes.rows.length === 0) return res.status(404).json({ success: false, error: 'Booking not found.' });

    const oldVehId = bkRes.rows[0].vehicle_id;
    if (oldVehId) {
      await query(`UPDATE vehicles SET status = 'AVAILABLE' WHERE id = $1;`, [oldVehId]);
    }
    if (new_vehicle_id) {
      await query(`UPDATE vehicles SET status = 'ALLOCATED' WHERE id = $1;`, [new_vehicle_id]);
    }

    const updated = await query(
      `UPDATE bookings SET vehicle_id = $1 WHERE id = $2 RETURNING *;`,
      [new_vehicle_id, id]
    );
    return res.json({ success: true, message: 'Chassis swapped successfully.', data: updated.rows[0] });
  } catch (err) {
    return next(err);
  }
}

export async function cancelBooking(req, res, next) {
  try {
    const { id } = req.params;
    const { cancellation_reason } = req.body;

    const bookingRes = await query(`SELECT vehicle_id FROM bookings WHERE id = $1 AND dealership_id = $2;`, [id, req.user.dealership_id]);
    if (bookingRes.rows.length === 0) return res.status(404).json({ success: false, error: 'Booking not found.' });

    if (bookingRes.rows[0].vehicle_id) {
      await query(`UPDATE vehicles SET status = 'AVAILABLE' WHERE id = $1;`, [bookingRes.rows[0].vehicle_id]);
    }

    const updated = await query(
      `UPDATE bookings SET booking_status = 'CANCELLED', cancellation_reason = $1, vehicle_id = NULL WHERE id = $2 RETURNING *;`,
      [cancellation_reason || 'Customer cancellation', id]
    );

    return res.json({ success: true, message: 'Booking cancelled. Vehicle returned to stockyard pool.', data: updated.rows[0] });
  } catch (err) {
    return next(err);
  }
}
