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

test('Advanced Pillar 1: Public Customer Self-Service Order Tracking', async () => {
  // Test lookup with known seeded customer
  const trackRes = await fetch(`${baseUrl}/api/tracking/track`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: '+91-9828067890', otf_number: 'OTF-892101' })
  });
  assert.equal(trackRes.status, 200);
  const trackData = await trackRes.json();
  assert.ok(trackData.success);
  assert.equal(trackData.data.order.otf_number, 'OTF-892101');
  assert.equal(trackData.data.stepper.length, 4);
  assert.ok(trackData.data.stepper[0].completed);

  // Test invalid tracking query
  const badRes = await fetch(`${baseUrl}/api/tracking/track`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: '+91-0000000000', otf_number: 'OTF-NONE' })
  });
  assert.equal(badRes.status, 404);
});

test('Advanced Pillar 2: Dealership Accounts & P&L GPV Ledger', async () => {
  const ledgerRes = await fetch(`${baseUrl}/api/ledger`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  assert.equal(ledgerRes.status, 200);
  const ledgerData = await ledgerRes.json();
  assert.ok(ledgerData.success);
  assert.ok(ledgerData.data.length >= 3);
  assert.ok(ledgerData.summary.total_turnover > 0);
  assert.ok(ledgerData.summary.total_gpv > 0);

  // Verify GPV calculation arithmetic on first record
  const r = ledgerData.data[0];
  const expectedGpv = Math.round((r.car_sale_margin + r.bank_do_payout + r.insurance_commission + r.accessories_profit) - r.dealer_discount);
  assert.equal(r.gross_profit_per_vehicle, expectedGpv);
});

test('Advanced Pillar 3: Government RTO & KYC Verification APIs', async () => {
  // Parivahan Vahan RC Lookup (Maharashtra Mumbai / Pune)
  const rcRes = await fetch(`${baseUrl}/api/rto/vahan-lookup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ registration_number: 'MH-02-DW-8821' })
  });
  assert.equal(rcRes.status, 200);
  const rcData = await rcRes.json();
  assert.equal(rcData.data.rc_status, 'ACTIVE');
  assert.ok(rcData.data.rto_authority.includes('Maharashtra'));

  // Pune Central RTO lookup
  const puneRes = await fetch(`${baseUrl}/api/rto/vahan-lookup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ reg_number: 'MH-12-EV-1029' })
  });
  assert.equal(puneRes.status, 200);
  const puneData = await puneRes.json();
  assert.ok(puneData.data.rto_authority.includes('Pune Central RTO'));

  // NSDL PAN Verification
  const panRes = await fetch(`${baseUrl}/api/rto/pan-verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ pan_number: 'BKWPA8821K' })
  });
  assert.equal(panRes.status, 200);
  const panData = await panRes.json();
  assert.equal(panData.data.pan_status, 'VALID');
  assert.equal(panData.data.aadhaar_seeding_status, 'LINKED');
  assert.ok(panData.data.jurisdiction.includes('MUMBAI'));
});

test('Advanced Pillar 4: Webhook & Third-Party Integrations Engine', async () => {
  // Razorpay payment webhook
  const hookRes = await fetch(`${baseUrl}/api/webhooks/razorpay`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'pay_TEST_AUTO_001',
            amount: 2500000,
            status: 'captured',
            notes: { otf_number: 'OTF-2026-001' }
          }
        }
      }
    })
  });
  assert.equal(hookRes.status, 200);
  const hookData = await hookRes.json();
  assert.ok(hookData.received);

  // Integrations status
  const statRes = await fetch(`${baseUrl}/api/integrations/status`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  assert.equal(statRes.status, 200);
  const statData = await statRes.json();
  assert.equal(statData.data.whatsapp.status, 'CONNECTED');
  assert.equal(statData.data.razorpay.mode, 'LIVE_WEBHOOK');

  // WhatsApp outbound API
  const waRes = await fetch(`${baseUrl}/api/integrations/whatsapp/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ phone: '+91-9829012345', template: 'DELIVERY_DISPATCH', customer_name: 'Alok Nath' })
  });
  assert.equal(waRes.status, 200);
});

test('Advanced Pillar 5: Daily 9:00 AM Cron Morning Briefing', async () => {
  const briefRes = await fetch(`${baseUrl}/api/cron/morning-briefing`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  assert.equal(briefRes.status, 200);
  const briefData = await briefRes.json();
  assert.ok(briefData.data.metrics);
  assert.ok(briefData.data.metrics.aging_yard_cars_above_30_days >= 0);

  // Trigger briefing
  const trigRes = await fetch(`${baseUrl}/api/cron/trigger-briefing`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ channel: 'WHATSAPP_CEO' })
  });
  assert.equal(trigRes.status, 200);
  const trigData = await trigRes.json();
  assert.ok(trigData.success);
});
