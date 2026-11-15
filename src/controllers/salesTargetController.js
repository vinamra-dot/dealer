import { query } from '../config/db.js';

export async function listSalesTargets(req, res, next) {
  try {
    const sql = `
      SELECT st.*, u.name AS consultant_name, u.email AS consultant_email, u.phone
      FROM sales_targets st
      JOIN users u ON st.user_id = u.id
      WHERE st.dealership_id = $1
      ORDER BY st.target_deliveries DESC;
    `;
    const result = await query(sql, [req.user.dealership_id]);
    return res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    return next(err);
  }
}

export async function updateSalesTarget(req, res, next) {
  try {
    const { id } = req.params;
    const { achieved_deliveries, achieved_test_drives } = req.body;

    const result = await query(
      `UPDATE sales_targets
       SET achieved_deliveries = COALESCE($1, achieved_deliveries),
           achieved_test_drives = COALESCE($2, achieved_test_drives)
       WHERE id = $3 AND dealership_id = $4
       RETURNING *;`,
      [achieved_deliveries, achieved_test_drives, id, req.user.dealership_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Sales target record not found.' });
    }

    return res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    return next(err);
  }
}
