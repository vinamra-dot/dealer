import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/db.js';

export async function listQuotes(req, res, next) {
  try {
    const { lead_id } = req.query;
    let sql = `
      SELECT q.*, l.customer_name, l.phone AS customer_phone, u.name AS consultant_name
      FROM quotations q
      JOIN leads l ON q.lead_id = l.id
      JOIN users u ON q.created_by_user_id = u.id
      WHERE q.dealership_id = $1
    `;
    const params = [req.user.dealership_id];

    if (lead_id) {
      params.push(lead_id);
      sql += ` AND q.lead_id = $${params.length}`;
    }

    sql += ' ORDER BY q.created_at DESC;';
    const result = await query(sql, params);
    return res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    return next(err);
  }
}

export async function createQuote(req, res, next) {
  try {
    const { lead_id, vehicle_model, variant, ex_showroom_price, accessories_cost, discount_amount } = req.body;
    if (!lead_id || !vehicle_model || !ex_showroom_price) {
      return res.status(400).json({ success: false, error: 'Lead ID, vehicle model, and ex-showroom price are required.' });
    }

    const price = parseFloat(ex_showroom_price);
    const accCost = parseFloat(accessories_cost || 0);
    const discount = parseFloat(discount_amount || 0);

    // Realistic Tier-1/Tier-2 Indian automotive tax calculation:
    // RTO Road Tax ~ 10% of Ex-Showroom
    // Comprehensive Zero-Dep Insurance ~ 3.5%
    // Fastag + Registration ~ 600
    const rtoTax = Math.round(price * 0.10);
    const insurance = Math.round(price * 0.035);
    const fastag = 600;
    const finalOnRoadPrice = Math.round(price + rtoTax + insurance + fastag + accCost - discount);

    const id = `quote-${uuidv4().slice(0, 8)}`;
    const result = await query(
      `INSERT INTO quotations (id, dealership_id, lead_id, vehicle_model, variant, ex_showroom_price, rto_tax, insurance_cost, fastag_fee, accessories_cost, discount_amount, final_on_road_price, created_by_user_id, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'SENT')
       RETURNING *;`,
      [id, req.user.dealership_id, lead_id, vehicle_model, variant || 'Base', price, rtoTax, insurance, fastag, accCost, discount, finalOnRoadPrice, req.user.id]
    );

    await query(
      `UPDATE leads SET status = 'QUOTED' WHERE id = $1 AND dealership_id = $2;`,
      [lead_id, req.user.dealership_id]
    );

    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    return next(err);
  }
}
