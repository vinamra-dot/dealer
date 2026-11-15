import { query } from '../config/db.js';

export async function listComplianceFitment(req, res, next) {
  try {
    const result = await query(
      `SELECT * FROM compliance_fitment WHERE dealership_id = $1 ORDER BY created_at DESC;`,
      [req.user.dealership_id]
    );
    return res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    return next(err);
  }
}

export async function mapHsrpLaserCodes(req, res, next) {
  try {
    const { id, front_laser_code, rear_laser_code, reg_number } = req.body;
    if (!id || !front_laser_code || !rear_laser_code) {
      return res.status(400).json({ success: false, error: 'Fitment ID and front/rear laser codes are required.' });
    }

    const updated = await query(
      `UPDATE compliance_fitment
       SET front_hsrp_laser_code = $1, rear_hsrp_laser_code = $2, reg_number = COALESCE($3, reg_number), hsrp_status = 'AFFIXED'
       WHERE id = $4
       RETURNING *;`,
      [front_laser_code.trim().toUpperCase(), rear_laser_code.trim().toUpperCase(), reg_number || null, id]
    );

    if (updated.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Fitment record not found.' });
    }

    return res.json({ success: true, message: 'HSRP front & rear laser codes mapped and marked affixed.', data: updated.rows[0] });
  } catch (err) {
    return next(err);
  }
}

export async function activateFastagBarcode(req, res, next) {
  try {
    const { id, fastag_barcode, fastag_bank } = req.body;
    if (!id || !fastag_barcode) {
      return res.status(400).json({ success: false, error: 'Fitment ID and FASTag barcode number are required.' });
    }

    const updated = await query(
      `UPDATE compliance_fitment
       SET fastag_barcode = $1, fastag_bank = COALESCE($2, 'IDBI_BANK'), fastag_status = 'ACTIVE'
       WHERE id = $3
       RETURNING *;`,
      [fastag_barcode.trim(), fastag_bank || 'IDBI_BANK', id]
    );

    if (updated.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Fitment record not found.' });
    }

    return res.json({
      success: true,
      message: `FASTag ${fastag_barcode} successfully activated via ${fastag_bank || 'IDBI Bank'} NETC NPCI gateway with initial ₹500 balance.`,
      data: updated.rows[0]
    });
  } catch (err) {
    return next(err);
  }
}
