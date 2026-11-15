import { query } from '../config/db.js';

export async function getNotifications(req, res, next) {
  try {
    const dealershipId = req.user.dealership_id;
    const notifications = [];

    // 1. Vehicles with aging holding cost alert
    const agingCars = await query(
      `SELECT id, model, variant, vin, yard_location, holding_cost_per_day
       FROM vehicles
       WHERE dealership_id = $1 AND status = 'AVAILABLE'
       LIMIT 3;`,
      [dealershipId]
    );

    if (agingCars.rows.length > 0) {
      notifications.push({
        id: 'notif-aging',
        type: 'WARNING',
        title: 'Yard Stock Aging Alert (>30 Days)',
        message: `${agingCars.rows.length} vehicle(s) carrying high daily holding interest. Immediate push recommended.`,
        tab: 'stockyard',
        badgeColor: 'rose'
      });
    }

    // 2. Test drives awaiting GM approval
    const pendingTd = await query(
      `SELECT td.id, l.customer_name, v.model
       FROM test_drives td
       JOIN leads l ON td.lead_id = l.id
       LEFT JOIN vehicles v ON td.vehicle_id = v.id
       WHERE td.dealership_id = $1 AND td.gm_approved = FALSE
       LIMIT 5;`,
      [dealershipId]
    );

    if (pendingTd.rows.length > 0) {
      notifications.push({
        id: 'notif-td',
        type: 'ACTION_REQUIRED',
        title: 'Demo Drives Pending Clearance',
        message: `${pendingTd.rows.length} test drive slot(s) awaiting General Manager sign-off.`,
        tab: 'testDrives',
        badgeColor: 'amber'
      });
    }

    // 3. OEM Subsidies pending submission
    const pendingClaims = await query(
      `SELECT COUNT(*) as count, SUM(amount) as total
       FROM oem_claims
       WHERE dealership_id = $1 AND submission_status = 'PENDING_OEM';`,
      [dealershipId]
    );

    const claimCount = parseInt(pendingClaims.rows[0]?.count || 0, 10);
    if (claimCount > 0) {
      const claimVal = parseFloat(pendingClaims.rows[0]?.total || 0);
      notifications.push({
        id: 'notif-claims',
        type: 'INFO',
        title: 'OEM Subsidies Ready for Recovery',
        message: `₹${claimVal.toLocaleString('en-IN')} in incentive claims ready for OEM portal recovery.`,
        tab: 'claims',
        badgeColor: 'blue'
      });
    }

    return res.json({
      success: true,
      unreadCount: notifications.length,
      data: notifications
    });
  } catch (err) {
    return next(err);
  }
}
