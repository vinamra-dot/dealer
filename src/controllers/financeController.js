import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/db.js';

export async function listFinanceRecords(req, res, next) {
  try {
    const sql = `
      SELECT f.*, b.otf_number, l.customer_name, l.phone AS customer_phone
      FROM finance_records f
      JOIN bookings b ON f.booking_id = b.id
      JOIN leads l ON b.lead_id = l.id
      WHERE f.dealership_id = $1
      ORDER BY f.created_at DESC;
    `;
    const result = await query(sql, [req.user.dealership_id]);
    return res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    return next(err);
  }
}

export async function logFinanceRecord(req, res, next) {
  try {
    const { booking_id, bank_name, loan_amount, do_number, do_status, payout_percentage, remarks } = req.body;
    if (!booking_id || !bank_name || !loan_amount) {
      return res.status(400).json({ success: false, error: 'Booking ID, bank name, and loan amount are required.' });
    }

    const id = `fin-${uuidv4().slice(0, 8)}`;
    const payoutPct = parseFloat(payout_percentage || 1.25);
    const loanAmt = parseFloat(loan_amount);
    const payoutAmt = Math.round((loanAmt * payoutPct) / 100);

    const result = await query(
      `INSERT INTO finance_records (id, dealership_id, booking_id, bank_name, loan_amount, do_number, do_status, payout_percentage, payout_amount, remarks)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *;`,
      [id, req.user.dealership_id, booking_id, bank_name, loanAmt, do_number || null, do_status || 'PENDING', payoutPct, payoutAmt, remarks || null]
    );

    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    return next(err);
  }
}

export async function recordPayment(req, res, next) {
  try {
    const { booking_id, amount, payment_type, method, transaction_ref, cashier_verified } = req.body;
    if (!booking_id || !amount || !payment_type || !method) {
      return res.status(400).json({ success: false, error: 'Booking ID, amount, payment type, and payment method are required.' });
    }

    const id = `pay-${uuidv4().slice(0, 8)}`;
    const result = await query(
      `INSERT INTO payments (id, dealership_id, booking_id, amount, payment_type, method, transaction_ref, cashier_verified, verified_by_user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *;`,
      [id, req.user.dealership_id, booking_id, parseFloat(amount), payment_type, method, transaction_ref || null, cashier_verified ?? true, req.user.id]
    );

    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    return next(err);
  }
}

export async function listPayments(req, res, next) {
  try {
    const sql = `
      SELECT p.*, b.otf_number, l.customer_name, u.name AS cashier_name
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      JOIN leads l ON b.lead_id = l.id
      LEFT JOIN users u ON p.verified_by_user_id = u.id
      WHERE p.dealership_id = $1
      ORDER BY p.created_at DESC;
    `;
    const result = await query(sql, [req.user.dealership_id]);
    return res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    return next(err);
  }
}
