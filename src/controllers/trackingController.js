import { query } from '../config/db.js';

export async function trackCustomerCar(req, res, next) {
  try {
    const { phone, otf_number } = req.body;
    if (!phone || !otf_number) {
      return res.status(400).json({ success: false, error: 'Both phone number and OTF number are required.' });
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const cleanOtf = otf_number.trim().toUpperCase();

    const result = await query(
      `SELECT b.id, b.otf_number, l.customer_name, l.phone AS customer_phone, 
              COALESCE(v.model, 'Tata Vehicle') AS vehicle_model, v.vin, b.booking_amount, b.booking_status, b.eta_date,
              q.ex_showroom_price, q.final_on_road_price, q.variant,
              d.name as dealership_name, d.city as dealership_city, d.address as dealership_address
       FROM bookings b
       JOIN leads l ON b.lead_id = l.id
       LEFT JOIN vehicles v ON b.vehicle_id = v.id
       LEFT JOIN quotations q ON b.quotation_id = q.id
       LEFT JOIN dealerships d ON b.dealership_id = d.id
       WHERE UPPER(b.otf_number) = $1;`,
      [cleanOtf]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: `No active vehicle order found for OTF #${cleanOtf}. Please verify your details.` });
    }

    const b = result.rows[0];
    const dbPhone = (b.customer_phone || '').replace(/[^0-9]/g, '');
    if (!dbPhone.includes(cleanPhone) && !cleanPhone.includes(dbPhone)) {
      return res.status(403).json({ success: false, error: 'Phone number does not match registered OTF customer profile.' });
    }

    const statusOrder = ['BOOKED', 'ALLOCATED', 'INVOICED', 'RTO_PROCESSED', 'READY_FOR_DELIVERY', 'DELIVERED'];
    const currentIdx = statusOrder.indexOf(b.booking_status);

    const formattedEta = b.eta_date ? new Date(b.eta_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Within 7 Business Days';

    const steps = [
      {
        step: 1,
        title: 'Booking Confirmed & Token Received',
        desc: `Token deposit of ₹${parseFloat(b.booking_amount).toLocaleString('en-IN')} received. OTF punched.`,
        completed: currentIdx >= 0,
        current: currentIdx === 0
      },
      {
        step: 2,
        title: 'Chassis & VIN Allocation',
        desc: b.vin ? `Chassis assigned (VIN: ${b.vin}). Pre-Delivery Inspection (PDI) passed.` : 'Awaiting stockyard chassis assignment.',
        completed: currentIdx >= 1,
        current: currentIdx === 1
      },
      {
        step: 3,
        title: 'Bank DO & RTO Registration',
        desc: currentIdx >= 3 ? 'RTO registration number generation and road tax clearance completed.' : 'Finance DO sanction and HSRP plate processing in progress.',
        completed: currentIdx >= 3,
        current: currentIdx === 2 || currentIdx === 3
      },
      {
        step: 4,
        title: 'Ready for VIP Showroom Handover',
        desc: b.eta_date ? `Vehicle sanitized and staged in VIP bay. Estimated Handover: ${formattedEta}.` : 'Final showroom detailing underway.',
        completed: currentIdx >= 4,
        current: currentIdx >= 4
      }
    ];

    return res.json({
      success: true,
      data: {
        order: {
          otf_number: b.otf_number,
          customer_name: b.customer_name,
          vehicle_model: b.vehicle_model,
          variant: b.variant || 'Top Spec',
          vin: b.vin || 'Allocated in PDI',
          deposit_paid: parseFloat(b.booking_amount),
          final_on_road_price: parseFloat(b.final_on_road_price || 0),
          booking_status: b.booking_status,
          eta_delivery: formattedEta,
          dealership: {
            name: b.dealership_name,
            city: b.dealership_city,
            address: b.dealership_address
          }
        },
        steps,
        stepper: steps
      }
    });
  } catch (err) {
    return next(err);
  }
}
