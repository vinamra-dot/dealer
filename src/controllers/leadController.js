import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/db.js';

export async function listLeads(req, res, next) {
  try {
    const { status, assigned_to } = req.query;
    let sql = `
      SELECT l.*, 
             sc.name AS consultant_name, 
             tc.name AS telecaller_name
      FROM leads l
      LEFT JOIN users sc ON l.assigned_to_user_id = sc.id
      LEFT JOIN users tc ON l.telecaller_user_id = tc.id
      WHERE l.dealership_id = $1
    `;
    const params = [req.user.dealership_id];

    if (status) {
      params.push(status);
      sql += ` AND l.status = $${params.length}`;
    }

    if (assigned_to) {
      params.push(assigned_to);
      sql += ` AND l.assigned_to_user_id = $${params.length}`;
    }

    // Role-based filtering: Consultants only see their assigned leads unless manager/admin
    if (['SALES_CONSULTANT'].includes(req.user.role)) {
      params.push(req.user.id);
      sql += ` AND l.assigned_to_user_id = $${params.length}`;
    }

    sql += ' ORDER BY l.created_at DESC;';
    const result = await query(sql, params);
    return res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    return next(err);
  }
}

export async function createLead(req, res, next) {
  try {
    const { customer_name, phone, email, source, interested_model, budget, assigned_to_user_id, remarks } = req.body;
    if (!customer_name || !phone) {
      return res.status(400).json({ success: false, error: 'Customer name and phone number are required.' });
    }

    const id = `lead-${uuidv4().slice(0, 8)}`;
    const telecallerId = req.user.role === 'TELECALLER' ? req.user.id : null;
    const assignedConsultant = assigned_to_user_id || (req.user.role === 'SALES_CONSULTANT' ? req.user.id : null);

    const result = await query(
      `INSERT INTO leads (id, dealership_id, customer_name, phone, email, source, interested_model, budget, status, assigned_to_user_id, telecaller_user_id, remarks)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'NEW', $9, $10, $11)
       RETURNING *;`,
      [id, req.user.dealership_id, customer_name, phone, email || null, source || 'WALK_IN', interested_model || null, budget || null, assignedConsultant, telecallerId, remarks || null]
    );

    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    return next(err);
  }
}

export async function updateLeadStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, remarks, assigned_to_user_id } = req.body;

    const result = await query(
      `UPDATE leads 
       SET status = COALESCE($1, status),
           remarks = COALESCE($2, remarks),
           assigned_to_user_id = COALESCE($3, assigned_to_user_id)
       WHERE id = $4 AND dealership_id = $5
       RETURNING *;`,
      [status, remarks, assigned_to_user_id, id, req.user.dealership_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Lead not found or access denied.' });
    }

    return res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    return next(err);
  }
}

export async function bulkImportLeads(req, res, next) {
  try {
    const { leads } = req.body;
    if (!Array.isArray(leads) || leads.length === 0) {
      return res.status(400).json({ success: false, error: 'Array of leads is required.' });
    }

    const inserted = [];
    for (const l of leads) {
      if (!l.customer_name || !l.phone) continue;
      const id = `lead-${uuidv4().slice(0, 8)}`;
      const result = await query(
        `INSERT INTO leads (id, dealership_id, customer_name, phone, email, source, interested_model, budget, status, remarks)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'NEW', $9)
         RETURNING *;`,
        [id, req.user.dealership_id, l.customer_name, l.phone, l.email || null, l.source || 'CSV_IMPORT', l.interested_model || 'Undecided', l.budget ? parseFloat(l.budget) : null, l.remarks || 'Imported via CSV batch']
      );
      inserted.push(result.rows[0]);
    }

    return res.status(201).json({
      success: true,
      message: `Successfully imported ${inserted.length} leads into pipeline.`,
      count: inserted.length,
      data: inserted
    });
  } catch (err) {
    return next(err);
  }
}
