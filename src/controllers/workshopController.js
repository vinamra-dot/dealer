import { query } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

export async function getJobCards(req, res, next) {
  try {
    const result = await query(
      `SELECT * FROM service_job_cards 
       WHERE dealership_id = $1 
       ORDER BY created_at DESC;`,
      [req.user.dealership_id]
    );
    return res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    return next(err);
  }
}

export async function createJobCard(req, res, next) {
  try {
    const { customer_name, customer_phone, vehicle_model, reg_number, odometer_in, fuel_level, service_type, bay_number, complaints, estimated_cost } = req.body;
    if (!customer_name || !reg_number) {
      return res.status(400).json({ success: false, error: 'Customer name and vehicle registration number are required.' });
    }

    const id = `jc-${uuidv4().slice(0, 8)}`;
    const jcNo = `JC-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const result = await query(
      `INSERT INTO service_job_cards (id, dealership_id, job_card_number, customer_name, customer_phone, vehicle_model, reg_number, odometer_in, fuel_level, service_type, bay_number, advisor_name, estimated_cost, complaints, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'ARRIVED')
       RETURNING *;`,
      [id, req.user.dealership_id, jcNo, customer_name, customer_phone, vehicle_model || 'Harrier', reg_number, parseInt(odometer_in) || 10000, fuel_level || '50%', service_type || 'PERIODIC_MAINTENANCE', bay_number || 'BAY-01', req.user.name, parseFloat(estimated_cost) || 0.00, complaints || 'Periodic service checkup']
    );

    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    return next(err);
  }
}

export async function updateJobCardStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, technician_name, actual_cost } = req.body;
    const result = await query(
      `UPDATE service_job_cards 
       SET status = $1, technician_name = COALESCE($2, technician_name), actual_cost = COALESCE($3, actual_cost)
       WHERE id = $4 AND dealership_id = $5
       RETURNING *;`,
      [status, technician_name, actual_cost, id, req.user.dealership_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Job Card not found.' });
    }
    return res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    return next(err);
  }
}