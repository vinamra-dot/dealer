import { query } from '../config/db.js';

export async function exportTallySalesXml(req, res, next) {
  try {
    const result = await query(
      `SELECT b.id, b.otf_number, l.customer_name, l.phone, v.model, v.variant, v.vin,
              q.ex_showroom_price, q.final_on_road_price, q.rto_tax, q.insurance_cost
       FROM bookings b
       JOIN leads l ON b.lead_id = l.id
       LEFT JOIN vehicles v ON b.vehicle_id = v.id
       LEFT JOIN quotations q ON b.quotation_id = q.id
       WHERE b.dealership_id = $1
       ORDER BY b.created_at DESC;`,
      [req.user.dealership_id]
    );

    const escapeXml = (unsafe) => (unsafe || '').replace(/[<>&'"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '\'': '&apos;', '"': '&quot;' }[c]));
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');

    let vouchersXml = '';
    for (const r of result.rows) {
      const price = parseFloat(r.ex_showroom_price || 1929000);
      const base = Math.round(price / 1.43);
      const cgst = Math.round(base * 0.14);
      const sgst = Math.round(base * 0.14);
      const cess = Math.round(base * 0.15);
      const onRoad = parseFloat(r.final_on_road_price || price);

      vouchersXml += `
      <TALLYMESSAGE xmlns:UDF="TallyUDF">
        <VOUCHER VCHTYPE="Sales" ACTION="Create" OBJVIEW="Invoice Voucher View">
          <DATE>${today}</DATE>
          <VOUCHERTYPENAME>Sales</VOUCHERTYPENAME>
          <VOUCHERNUMBER>INV-${escapeXml(r.otf_number)}</VOUCHERNUMBER>
          <REFERENCE>${escapeXml(r.otf_number)}</REFERENCE>
          <PARTYLEDGERNAME>${escapeXml(r.customer_name)}</PARTYLEDGERNAME>
          <STATENAME>Maharashtra</STATENAME>
          <NARRATION>Sale of Tata ${escapeXml(r.model || 'Vehicle')} (VIN: ${escapeXml(r.vin || 'N/A')})</NARRATION>
          <ALLLEDGERENTRIES.LIST>
            <LEDGERNAME>${escapeXml(r.customer_name)}</LEDGERNAME>
            <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
            <AMOUNT>-${onRoad.toFixed(2)}</AMOUNT>
          </ALLLEDGERENTRIES.LIST>
          <ALLLEDGERENTRIES.LIST>
            <LEDGERNAME>Motor Car Sales Account (HSN 8703)</LEDGERNAME>
            <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
            <AMOUNT>${base.toFixed(2)}</AMOUNT>
          </ALLLEDGERENTRIES.LIST>
          <ALLLEDGERENTRIES.LIST>
            <LEDGERNAME>Output CGST @ 14%</LEDGERNAME>
            <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
            <AMOUNT>${cgst.toFixed(2)}</AMOUNT>
          </ALLLEDGERENTRIES.LIST>
          <ALLLEDGERENTRIES.LIST>
            <LEDGERNAME>Output SGST @ 14%</LEDGERNAME>
            <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
            <AMOUNT>${sgst.toFixed(2)}</AMOUNT>
          </ALLLEDGERENTRIES.LIST>
          <ALLLEDGERENTRIES.LIST>
            <LEDGERNAME>Output Compensation Cess @ 15%</LEDGERNAME>
            <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
            <AMOUNT>${cess.toFixed(2)}</AMOUNT>
          </ALLLEDGERENTRIES.LIST>
        </VOUCHER>
      </TALLYMESSAGE>`;
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>Vouchers</REPORTNAME>
        <STATICVARIABLES>
          <SVCURRENTCOMPANY>Apex Mobility Motors Pvt Ltd</SVCURRENTCOMPANY>
        </STATICVARIABLES>
      </REQUESTDESC>
      <REQUESTDATA>${vouchersXml}
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Content-Disposition', `attachment; filename=Tally_Sales_${today}.xml`);
    return res.send(xml);
  } catch (err) {
    return next(err);
  }
}
