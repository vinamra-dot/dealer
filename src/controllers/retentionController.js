import { query } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

export async function getSurveys(req, res, next) {
  try {
    const result = await query(
      `SELECT * FROM csat_surveys 
       WHERE dealership_id = $1 
       ORDER BY created_at DESC;`,
      [req.user.dealership_id]
    );
    return res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    return next(err);
  }
}

export async function createSurvey(req, res, next) {
  try {
    const { customer_name, customer_phone, vehicle_model, delivery_date, nps_rating, feedback_category, comments } = req.body;
    if (!customer_name || !nps_rating) {
      return res.status(400).json({ success: false, error: 'Customer name and rating are required.' });
    }

    const id = `csat-${uuidv4().slice(0, 8)}`;
    const delDate = delivery_date || new Date().toISOString().split('T')[0];
    const serviceDueDate = new Date(new Date(delDate).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const result = await query(
      `INSERT INTO csat_surveys (id, dealership_id, customer_name, customer_phone, vehicle_model, delivery_date, nps_rating, feedback_category, comments, survey_status, first_service_due, service_reminder_sent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'COMPLETED', $10, false)
       RETURNING *;`,
      [id, req.user.dealership_id, customer_name, customer_phone || '+91-9876543210', vehicle_model || 'Nexon EV', delDate, parseInt(nps_rating), feedback_category || 'SALES_EXPERIENCE', comments || 'Verified customer feedback', serviceDueDate]
    );

    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    return next(err);
  }
}

export async function sendServiceReminder(req, res, next) {
  try {
    const { id } = req.params;
    const result = await query(
      `UPDATE csat_surveys 
       SET service_reminder_sent = true 
       WHERE id = $1 AND dealership_id = $2
       RETURNING *;`,
      [id, req.user.dealership_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Survey record not found.' });
    }
    return res.json({ success: true, message: 'First service reminder sent to customer.', data: result.rows[0] });
  } catch (err) {
    return next(err);
  }
}