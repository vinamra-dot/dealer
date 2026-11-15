import { query } from '../config/db.js';

export async function listVehicles(req, res, next) {
  try {
    const { status, yard_location } = req.query;
    let sql = `
      SELECT id, dealership_id, model, variant, color, fuel_type, 
             transmission, ex_showroom_price, vin, engine_no, 
             status, yard_location, holding_cost_per_day AS daily_holding_cost, created_at
      FROM vehicles
      WHERE dealership_id = $1
    `;
    const params = [req.user.dealership_id];

    if (status) {
      params.push(status);
      sql += ` AND status = $${params.length}`;
    }

    if (yard_location) {
      params.push(yard_location);
      sql += ` AND yard_location = $${params.length}`;
    }

    sql += ' ORDER BY model ASC, variant ASC;';
    const result = await query(sql, params);
    return res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    return next(err);
  }
}
