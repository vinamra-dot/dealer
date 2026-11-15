import { query } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

export async function handleBotChat(req, res, next) {
  try {
    const { message, customer_phone, customer_name } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, error: 'Message text is required.' });
    }

    const msg = message.toLowerCase();
    const phone = customer_phone || '+91-9820099881';
    const name = customer_name || 'Showroom Visitor';

    let reply = '';
    let action = 'GENERAL_QUERY';
    let card = null;

    if (msg.includes('test drive') || msg.includes('drive') || msg.includes('book demo')) {
      action = 'TEST_DRIVE_BOOKED';
      const leadId = `lead-${uuidv4().slice(0, 8)}`;
      const interestedModel = msg.includes('nexon') ? 'Nexon EV' : msg.includes('safari') ? 'Safari' : msg.includes('curvv') ? 'Curvv EV' : 'Harrier';
      
      await query(
        `INSERT INTO leads (id, dealership_id, customer_name, phone, source, interested_model, status, budget)
         VALUES ($1, 'dealership-apex-01', $2, $3, 'AI_WHATSAPP_BOT', $4, 'TEST_DRIVE_SCHEDULED', 2200000)
         ON CONFLICT (id) DO NOTHING;`,
        [leadId, name, phone, interestedModel]
      );

      reply = `Namaste ${name}! 🚗 Your VIP Test Drive for Tata ${interestedModel} has been scheduled at our Andheri West Showroom (or home demo). Our Sales Consultant Rohan Verma will contact you shortly!`;
      card = { type: 'CONFIRMATION', model: interestedModel, consultant: 'Rohan Verma (+91-9829044444)', venue: 'Apex Mobility Motors, Andheri West' };

    } else if (msg.includes('nexon') || msg.includes('ev')) {
      reply = `Tata Nexon.ev Empowered+ LR offers 465 km certified range, 45 kWh battery, V2V/V2L charging, and ventilated front seats. Ex-showroom starts at ₹14.49 Lakh (Mumbai on-road approx ₹15.85 Lakh after Maharashtra EV road tax exemption).`;
      card = { model: 'Nexon.ev LR', range: '465 km', battery: '45 kWh IP67', price: '₹14.49 - ₹19.49 Lakh' };

    } else if (msg.includes('harrier') || msg.includes('safari')) {
      const car = msg.includes('safari') ? 'Safari' : 'Harrier';
      reply = `The New ${car} features ADAS Level 2, 31.24 cm Cinematic Touchscreen, 7 Airbags standard, and Kryotec 2.0L Diesel Engine (170 PS). Current Mumbai festive discount: Up to ₹50,000 corporate + exchange bonus!`;
      card = { model: car, engine: '2.0L Turbo Diesel (170 PS)', safety: '5-Star BNCAP / GNCAP', price: '₹15.49 - ₹26.44 Lakh' };

    } else if (msg.includes('curvv')) {
      reply = `Tata Curvv & Curvv.ev is India's first SUV Coupe with gesture-controlled powered tailgate, panoramic sunroof, and 502 km range. Delivery bookings currently open for priority delivery.`;
      card = { model: 'Curvv EV', style: 'SUV Coupe', fastCharging: '150 km in 15 mins', price: '₹17.49 - ₹21.99 Lakh' };

    } else {
      reply = `Hello! Welcome to Apex Mobility Motors (Mumbai & Pune). I can assist you with: 1) On-Road Price Quotation, 2) Doorstep Test Drive Booking, 3) Exchange Car Valuation, or 4) Service Job Status. How may I assist you today?`;
    }

    return res.json({
      success: true,
      data: {
        reply,
        action,
        card,
        timestamp: new Date().toISOString()
      }
    });
  } catch (err) {
    return next(err);
  }
}
