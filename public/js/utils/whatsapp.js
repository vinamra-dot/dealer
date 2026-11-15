// WhatsApp Direct Communication Engine for Automobile Dealerships

export function openWhatsAppChat(phone, message) {
  const cleanPhone = (phone || '').replace(/[^0-9]/g, '');
  const finalPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
  const url = `https://api.whatsapp.com/send?phone=${finalPhone}&text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
}

export function sendQuoteWhatsApp(quote) {
  const text = `*APEX MOBILITY MOTORS — OFFICIAL QUOTATION*
Dear ${quote.customer_name},

Thank you for your interest in the *${quote.vehicle_model} (${quote.variant})*. Here is your official on-road price estimate:

• *Ex-Showroom Price:* ₹${parseFloat(quote.ex_showroom_price).toLocaleString('en-IN')}
• *RTO Road Tax:* ₹${parseFloat(quote.rto_tax || 0).toLocaleString('en-IN')}
• *Zero-Dep Insurance:* ₹${parseFloat(quote.insurance_cost || 0).toLocaleString('en-IN')}
• *Fastag & Logistics:* ₹${parseFloat(quote.fastag_fee || 600).toLocaleString('en-IN')}
• *Accessories / VAS:* ₹${parseFloat(quote.accessories_cost || 0).toLocaleString('en-IN')}
• *Special Discount:* -₹${parseFloat(quote.discount_amount || 0).toLocaleString('en-IN')}
---------------------------------
⭐ *Final Net On-Road Price: ₹${parseFloat(quote.final_on_road_price).toLocaleString('en-IN')}*

Quotation Ref: #${quote.id}
Valid for 7 days. For bookings or test drive, reply directly to this chat!`;

  openWhatsAppChat(quote.customer_phone, text);
}

export function sendInvoiceWhatsApp(booking) {
  const text = `*APEX MOBILITY MOTORS — BOOKING CONFIRMATION & TAX INVOICE*
Dear ${booking.customer_name},

Congratulations on booking your new *${booking.vehicle_model || 'Vehicle'}*!

• *OTF Number:* ${booking.otf_number}
• *Chassis / VIN:* ${booking.vin || 'Allotted & In PDI'}
• *Deposit Received:* ₹${parseFloat(booking.booking_amount).toLocaleString('en-IN')}
• *Booking Status:* ${booking.booking_status}
• *Estimated Handover:* ${booking.eta_date || 'Within 10 Days'}

Your Tax Invoice has been generated under GST HSN 8703 (28% GST + 15% Compensation Cess).

Welcome to the Apex Mobility family!`;

  openWhatsAppChat(booking.customer_phone, text);
}

export function sendTestDriveReminderWhatsApp(td) {
  const text = `*APEX MOBILITY MOTORS — DEMO DRIVE REMINDER*
Dear ${td.customer_name},

This is a reminder for your scheduled test drive of the *${td.vehicle_model} (${td.vehicle_variant || 'Top Spec'})*.

📅 *Date & Time:* ${new Date(td.scheduled_at).toLocaleString('en-IN')}
👤 *Assigned Consultant:* ${td.consultant_name}
📍 *Dealership Location:* Apex Mobility Motors, Plot 42, Transport Nagar, Tonk Road, Jaipur

Our consultant will have the sanitized demo vehicle ready for you. See you soon!`;

  openWhatsAppChat(td.customer_phone, text);
}
