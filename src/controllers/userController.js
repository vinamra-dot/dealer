import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/db.js';

export async function listDealershipUsers(req, res, next) {
  try {
    const sql = `
      SELECT id, name, email, role, phone, is_active, created_at
      FROM users
      WHERE dealership_id = $1
      ORDER BY role ASC, name ASC;
    `;
    const result = await query(sql, [req.user.dealership_id]);
    return res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    return next(err);
  }
}

export async function createDealershipUser(req, res, next) {
  try {
    const { name, email, role, phone, password } = req.body;
    if (!name || !email || !role) {
      return res.status(400).json({ success: false, error: 'Name, email, and role are required.' });
    }

    const check = await query('SELECT id FROM users WHERE LOWER(email) = LOWER($1);', [email]);
    if (check.rows.length > 0) {
      return res.status(409).json({ success: false, error: 'User with this work email already exists.' });
    }

    const id = `usr-${uuidv4().slice(0, 8)}`;
    const passHash = await bcrypt.hash(password || 'Password@123', 10);

    const result = await query(
      `INSERT INTO users (id, dealership_id, name, email, password_hash, role, phone, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true)
       RETURNING id, name, email, role, phone, is_active, created_at;`,
      [id, req.user.dealership_id, name, email, passHash, role, phone || null]
    );

    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    return next(err);
  }
}

export async function toggleUserStatus(req, res, next) {
  try {
    const { id } = req.params;
    const result = await query(
      `UPDATE users 
       SET is_active = NOT is_active
       WHERE id = $1 AND dealership_id = $2
       RETURNING id, name, email, role, is_active;`,
      [id, req.user.dealership_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    return res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    return next(err);
  }
}
