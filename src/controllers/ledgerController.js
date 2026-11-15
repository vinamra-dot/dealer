import { query } from '../config/db.js';

export async function getDealershipLedger(req, res, next) {
  try {
    const bkRes = await query(
      `SELECT b.id, b.otf_number, l.customer_name, l.phone AS customer_phone, 
              COALESCE(v.model, 'Harrier') AS vehicle_model, v.vin, b.booking_amount, b.booking_status,
              q.ex_showroom_price, q.accessories_cost, q.discount_amount, q.final_on_road_price, q.insurance_cost,
              f.loan_amount, f.payout_amount, f.bank_name
       FROM bookings b
       JOIN leads l ON b.lead_id = l.id
       LEFT JOIN vehicles v ON b.vehicle_id = v.id
       LEFT JOIN quotations q ON b.quotation_id = q.id
       LEFT JOIN finance_records f ON b.id = f.booking_id
       WHERE b.dealership_id = $1
       ORDER BY b.created_at DESC;`,
      [req.user.dealership_id]
    );

    const ledger = bkRes.rows.map(row => {
      const exShowroom = parseFloat(row.ex_showroom_price || 1929000);
      const oemInvoiceCost = Math.round(exShowroom * 0.945); // 5.5% wholesale margin
      const frontEndMargin = exShowroom - oemInvoiceCost;

      const financePayout = parseFloat(row.payout_amount || (parseFloat(row.loan_amount || 0) * 0.0125) || 18500);
      const insCommission = Math.round(parseFloat(row.insurance_cost || 55000) * 0.15); // 15% insurance commission
      const accCost = parseFloat(row.accessories_cost || 15000);
      const accMargin = Math.round(accCost * 0.35); // 35% accessories profit
      const discount = parseFloat(row.discount_amount || 15000);

      const netGpv = (frontEndMargin + financePayout + insCommission + accMargin) - discount;

      return {
        id: row.id,
        otf_number: row.otf_number,
        customer_name: row.customer_name,
        vehicle_model: row.vehicle_model,
        vin: row.vin || 'VIN-ALLOTTED',
        ex_showroom_price: exShowroom,
        oem_invoice_cost: oemInvoiceCost,
        front_end_margin: frontEndMargin,
        car_sale_margin: frontEndMargin,
        finance_payout: financePayout,
        bank_do_payout: financePayout,
        insurance_commission: insCommission,
        accessories_profit: accMargin,
        dealer_discount: discount,
        net_dealership_margin: netGpv,
        gross_profit_per_vehicle: netGpv,
        booking_status: row.booking_status
      };
    });

    const totalRevenue = ledger.reduce((acc, l) => acc + l.ex_showroom_price, 0);
    const totalGrossProfit = ledger.reduce((acc, l) => acc + l.net_dealership_margin, 0);
    const avgMarginPerCar = ledger.length ? Math.round(totalGrossProfit / ledger.length) : 0;

    return res.json({
      success: true,
      data: ledger,
      summary: {
        total_units: ledger.length,
        total_turnover: totalRevenue,
        totalRevenue,
        total_gpv: totalGrossProfit,
        totalGrossProfit,
        avg_margin_per_car: avgMarginPerCar,
        avgMarginPerCar
      }
    });
  } catch (err) {
    return next(err);
  }
}
