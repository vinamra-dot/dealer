import test from 'node:test';
import assert from 'node:assert/strict';
import { initDb } from '../src/config/db.js';
import { runMigrations } from '../src/migrations/runMigrations.js';
import { runSeeds } from '../src/seeds/runSeeds.js';
import app from '../src/app.js';

let server;
let baseUrl;
let token;

test.before(async () => {
  await initDb();
  await runMigrations();
  await runSeeds();
  server = app.listen(0);
  const port = server.address().port;
  baseUrl = `http://127.0.0.1:${port}`;

  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'ceo@apexmotors.com', password: 'Password@123' })
  });
  const data = await loginRes.json();
  token = data.data.token;
});

test.after(() => {
  server.close();
});

test('Workflow: Complete Lead to Delivery & Claim Cycle', async () => {
  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };

  // 1. Create Lead
  const leadRes = await fetch(`${baseUrl}/api/leads`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      customer_name: 'Test Customer Verma',
      phone: '+91-9876500000',
      source: 'WALK_IN',
      interested_model: 'Harrier'
    })
  });
  const lead = (await leadRes.json()).data;
  assert.ok(lead.id);

  // 2. Schedule Test Drive
  const tdRes = await fetch(`${baseUrl}/api/test-drives/schedule`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      lead_id: lead.id,
      scheduled_at: new Date().toISOString(),
      route_notes: 'Ring road highway loop'
    })
  });
  const td = (await tdRes.json()).data;
  assert.equal(td.status, 'SCHEDULED');

  // 3. GM Approval on Test Drive
  const tdApproveRes = await fetch(`${baseUrl}/api/test-drives/${td.id}/approve`, {
    method: 'PATCH',
    headers: authHeaders
  });
  const tdApproved = (await tdApproveRes.json()).data;
  assert.equal(tdApproved.gm_approved, true);

  // 4. Generate Quotation
  const quoteRes = await fetch(`${baseUrl}/api/quotes/generate`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      lead_id: lead.id,
      vehicle_model: 'Harrier',
      ex_showroom_price: 2644000,
      accessories_cost: 25000,
      discount_amount: 15000
    })
  });
  const quote = (await quoteRes.json()).data;
  assert.ok(quote.final_on_road_price > 2644000);

  // 5. Punch Booking (OTF)
  const bkRes = await fetch(`${baseUrl}/api/bookings/punch-otf`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      lead_id: lead.id,
      vehicle_id: 'veh-01',
      booking_amount: 51000
    })
  });
  const bk = (await bkRes.json()).data;
  assert.ok(bk.otf_number.startsWith('OTF-'));

  // 6. Used Car Evaluation & Downpayment Credit
  const ucRes = await fetch(`${baseUrl}/api/used-cars/evaluate`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      customer_name: 'Test Customer Verma',
      phone: '+91-9876500000',
      make: 'Maruti',
      model: 'Swift VXI',
      manufacturing_year: 2017,
      kilometers_run: 55000,
      proposed_value: 300000,
      approved_value: 290000
    })
  });
  const uc = (await ucRes.json()).data;
  assert.equal(uc.approved_value, 290000);

  const adjRes = await fetch(`${baseUrl}/api/used-cars/${uc.id}/adjust`, {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify({ new_booking_id: bk.id })
  });
  assert.equal((await adjRes.json()).success, true);

  // 7. VIP Delivery Day Handover with CSI Rating
  const hoRes = await fetch(`${baseUrl}/api/delivery/complete-vip`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      booking_id: bk.id,
      csi_rating: 10,
      customer_remarks: 'Outstanding delivery experience!'
    })
  });
  const ho = (await hoRes.json()).data;
  assert.equal(ho.csi_rating, 10);

  // 8. Auto-Compile OEM Claims
  const claimRes = await fetch(`${baseUrl}/api/claims/auto-generate`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ booking_id: bk.id })
  });
  const claims = (await claimRes.json()).data;
  assert.equal(claims.length, 3);
});
