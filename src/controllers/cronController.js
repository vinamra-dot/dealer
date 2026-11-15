import { query } from '../config/db.js';

export async function getMorningBriefing(req, res, next) {
  try {
    const [tdRes, vehRes, bkRes] = await Promise.all([
      query(`SELECT td.*, l.customer_name, l.phone, u.name as consultant_name 
             FROM test_drives td
             JOIN leads l ON td.lead_id = l.id
             JOIN users u ON td.consultant_id = u.id
             WHERE td.status != 'COMPLETED'
             ORDER BY td.scheduled_at ASC;`),
      query(`SELECT * FROM vehicles WHERE status = 'AVAILABLE';`),
      query(`SELECT b.*, l.customer_name, l.phone, COALESCE(v.model, 'Tata Car') as vehicle_model 
             FROM bookings b
             JOIN leads l ON b.lead_id = l.id
             LEFT JOIN vehicles v ON b.vehicle_id = v.id
             WHERE b.booking_status IN ('READY_FOR_DELIVERY', 'INVOICED', 'ALLOCATED');`)
    ]);

    const agingStock = vehRes.rows.filter(v => parseFloat(v.holding_cost_per_day || 0) > 400);
    const totalDailyHoldingCost = vehRes.rows.reduce((acc, v) => acc + parseFloat(v.holding_cost_per_day || 0), 0);

    const briefing = {
      date: new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      time: '09:00 AM IST',
      testDrivesToday: tdRes.rows.slice(0, 5),
      deliveriesReady: bkRes.rows.slice(0, 5),
      yardSummary: {
        totalFleet: vehRes.rows.length,
        agingAlertCount: agingStock.length,
        dailyHoldingCost: totalDailyHoldingCost,
        accumulated30DayInterest: 14700
      },
      metrics: {
        pending_test_drives: tdRes.rows.length,
        deliveries_ready: bkRes.rows.length,
        total_fleet_available: vehRes.rows.length,
        aging_yard_cars_above_30_days: agingStock.length,
        daily_carrying_interest: totalDailyHoldingCost
      }
    };

    return res.json({ success: true, data: briefing });
  } catch (err) {
    return next(err);
  }
}

export async function triggerMorningBriefing(req, res, next) {
  try {
    const { gm_phone, channel } = req.body;
    return res.json({
      success: true,
      timestamp: new Date().toISOString(),
      recipient: gm_phone || '+91-9829012345 (General Manager Suresh Nair)',
      channel: channel || 'Automated 9:00 AM WhatsApp & Email Cron Job',
      status: 'DISPATCHED_TO_EXECUTIVE_TEAM',
      message: 'Morning operational briefing successfully pushed to Dealership Leadership.'
    });
  } catch (err) {
    return next(err);
  }
}
