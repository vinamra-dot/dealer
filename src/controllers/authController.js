import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import { config } from '../config/env.js';

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    const result = await query(
      `SELECT u.id, u.dealership_id, u.name, u.email, u.password_hash, u.role, u.phone, u.is_active, d.name AS dealership_name
       FROM users u
       JOIN dealerships d ON u.dealership_id = d.id
       WHERE LOWER(u.email) = LOWER($1) LIMIT 1;`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const user = result.rows[0];
    if (!user.is_active) {
      return res.status(403).json({ success: false, error: 'Account is deactivated. Contact dealership admin.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        dealership_id: user.dealership_id,
        role: user.role,
        email: user.email,
        name: user.name
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    return res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          dealership_id: user.dealership_id,
          dealership_name: user.dealership_name
        }
      }
    });
  } catch (err) {
    return next(err);
  }
}

export async function getMe(req, res, next) {
  try {
    const result = await query(
      `SELECT u.id, u.dealership_id, u.name, u.email, u.role, u.phone, d.name AS dealership_name, d.city
       FROM users u
       JOIN dealerships d ON u.dealership_id = d.id
       WHERE u.id = $1 LIMIT 1;`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    return res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    return next(err);
  }
}

export async function listUsers(req, res, next) {
  try {
    const result = await query(
      `SELECT id, name, email, role, phone, is_active FROM users
       WHERE dealership_id = $1 ORDER BY role, name;`,
      [req.user.dealership_id]
    );
    return res.json({ success: true, data: result.rows });
  } catch (err) {
    return next(err);
  }
}
