import { query } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

export async function getParts(req, res, next) {
  try {
    const result = await query(
      `SELECT * FROM spare_parts 
       WHERE dealership_id = $1 
       ORDER BY category ASC, part_name ASC;`,
      [req.user.dealership_id]
    );
    return res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    return next(err);
  }
}

export async function createPart(req, res, next) {
  try {
    const { part_number, part_name, category, bin_location, stock_quantity, min_stock_alert, unit_price, compatibility } = req.body;
    if (!part_number || !part_name || !unit_price) {
      return res.status(400).json({ success: false, error: 'Part number, name, and unit price are required.' });
    }

    const id = `part-${uuidv4().slice(0, 8)}`;
    const result = await query(
      `INSERT INTO spare_parts (id, dealership_id, part_number, part_name, category, bin_location, stock_quantity, min_stock_alert, unit_price, compatibility)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *;`,
      [id, req.user.dealership_id, part_number, part_name, category || 'GENERAL', bin_location || 'BIN-GEN-01', parseInt(stock_quantity) || 0, parseInt(min_stock_alert) || 5, parseFloat(unit_price), compatibility || 'Universal']
    );

    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    return next(err);
  }
}

export async function issuePart(req, res, next) {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const deductQty = parseInt(quantity) || 1;

    const current = await query(`SELECT stock_quantity FROM spare_parts WHERE id = $1 AND dealership_id = $2;`, [id, req.user.dealership_id]);
    if (current.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Spare part not found.' });
    }

    if (current.rows[0].stock_quantity < deductQty) {
      return res.status(400).json({ success: false, error: 'Insufficient stock in warehouse.' });
    }

    const newStock = parseInt(current.rows[0].stock_quantity) - deductQty;
    const result = await query(
      `UPDATE spare_parts 
       SET stock_quantity = $1 
       WHERE id = $2 AND dealership_id = $3
       RETURNING *;`,
      [newStock, id, req.user.dealership_id]
    );

    return res.json({ success: true, message: `Successfully issued ${deductQty} unit(s) to workshop.`, data: result.rows[0] });
  } catch (err) {
    return next(err);
  }
}

export async function restockPart(req, res, next) {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const addQty = parseInt(quantity) || 5;

    const current = await query(`SELECT stock_quantity FROM spare_parts WHERE id = $1 AND dealership_id = $2;`, [id, req.user.dealership_id]);
    if (current.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Spare part not found.' });
    }

    const newStock = parseInt(current.rows[0].stock_quantity) + addQty;
    const result = await query(
      `UPDATE spare_parts 
       SET stock_quantity = $1 
       WHERE id = $2 AND dealership_id = $3
       RETURNING *;`,
      [newStock, id, req.user.dealership_id]
    );

    return res.json({ success: true, message: `Successfully restocked ${addQty} unit(s).`, data: result.rows[0] });
  } catch (err) {
    return next(err);
  }
}