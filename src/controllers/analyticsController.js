import { query } from '../config/db.js';

export async function getDashboardStats(req, res, next) {
  try {
    const dealershipId = req.user.dealership_id;

    // Total leads & conversion
    const leadsRes = await query(
      `SELECT status, COUNT(*) AS count FROM leads WHERE dealership_id = $1 GROUP BY status;`,
      [dealershipId]
    );

    // Vehicle inventory & holding cost
    const vehRes = await query(
      `SELECT status, COUNT(*) AS count, SUM(holding_cost_per_day) AS daily_holding_cost 
       FROM vehicles WHERE dealership_id = $1 GROUP BY status;`,
      [dealershipId]
    );

    // Bookings count & total value
    const bookRes = await query(
      `SELECT booking_status, COUNT(*) AS count, SUM(booking_amount) AS total_deposits 
       FROM bookings WHERE dealership_id = $1 GROUP BY booking_status;`,
      [dealershipId]
    );

    // OEM claims pipeline
    const claimsRes = await query(
      `SELECT submission_status, COUNT(*) AS count, SUM(amount) AS total_claims_val 
       FROM oem_claims WHERE dealership_id = $1 GROUP BY submission_status;`,
      [dealershipId]
    );

    // Vehicles list for quick display
    const vehiclesList = await query(
      `SELECT * FROM vehicles WHERE dealership_id = $1 ORDER BY status, model;`,
      [dealershipId]
    );

    return res.json({
      success: true,
      data: {
        leadsSummary: leadsRes.rows,
        inventorySummary: vehRes.rows,
        bookingsSummary: bookRes.rows,
        claimsSummary: claimsRes.rows,
        vehicles: vehiclesList.rows
      }
    });
  } catch (err) {
    return next(err);
  }
}
