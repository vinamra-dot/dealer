import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/db.js';

export async function listUsedCars(req, res, next) {
  try {
    const sql = `
      SELECT uc.*, b.otf_number, l.customer_name AS booking_customer
      FROM used_car_exchanges uc
      LEFT JOIN bookings b ON uc.new_booking_id = b.id
      LEFT JOIN leads l ON b.lead_id = l.id
      WHERE uc.dealership_id = $1
      ORDER BY uc.created_at DESC;
    `;
    const result = await query(sql, [req.user.dealership_id]);
    return res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    return next(err);
  }
}

export async function evaluateUsedCar(req, res, next) {
  try {
    const { customer_name, phone, make, model, manufacturing_year, kilometers_run, proposed_value, approved_value, new_booking_id } = req.body;
    if (!customer_name || !make || !model || !proposed_value) {
      return res.status(400).json({ success: false, error: 'Customer name, make, model, and valuation are required.' });
    }

    const id = `uc-${uuidv4().slice(0, 8)}`;
    const val = parseFloat(approved_value || proposed_value);

    const result = await query(
      `INSERT INTO used_car_exchanges (id, dealership_id, customer_name, phone, make, model, manufacturing_year, kilometers_run, proposed_value, approved_value, new_booking_id, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'APPROVED')
       RETURNING *;`,
      [id, req.user.dealership_id, customer_name, phone, make, model, parseInt(manufacturing_year || 2018, 10), parseInt(kilometers_run || 45000, 10), parseFloat(proposed_value), val, new_booking_id || null]
    );

    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    return next(err);
  }
}

export async function adjustExchangeInBooking(req, res, next) {
  try {
    const { id } = req.params;
    const { new_booking_id } = req.body;

    const ucRes = await query(
      `UPDATE used_car_exchanges 
       SET status = 'ADJUSTED_IN_DOWNPAYMENT', new_booking_id = $1 
       WHERE id = $2 AND dealership_id = $3 RETURNING *;`,
      [new_booking_id, id, req.user.dealership_id]
    );

    if (ucRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Used car record not found.' });
    }

    // Automatically record an exchange payment in payments table
    const uc = ucRes.rows[0];
    const payId = `pay-${uuidv4().slice(0, 8)}`;
    await query(
      `INSERT INTO payments (id, dealership_id, booking_id, amount, payment_type, method, transaction_ref, cashier_verified, verified_by_user_id)
       VALUES ($1, $2, $3, $4, 'EXCHANGE_CREDIT', 'EXCHANGE_ADJUSTMENT', $5, true, $6);`,
      [payId, req.user.dealership_id, new_booking_id, uc.approved_value, `EXCH-${uc.make}-${uc.model}`, req.user.id]
    );

    return res.json({ success: true, message: `₹${parseFloat(uc.approved_value).toLocaleString('en-IN')} credited to downpayment.`, data: uc });
  } catch (err) {
    return next(err);
  }
}
