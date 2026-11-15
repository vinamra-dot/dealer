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

test('Ultimate Pillar 1: AI Inbound WhatsApp & Web Bot', async () => {
  // Test general inquiry
  const res1 = await fetch(`${baseUrl}/api/bot/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'What is Nexon EV certified range?' })
  });
  assert.equal(res1.status, 200);
  const data1 = await res1.json();
  assert.ok(data1.data.reply.includes('465 km'));

  // Test automatic test drive booking via natural language
  const res2 = await fetch(`${baseUrl}/api/bot/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Please book Harrier test drive tomorrow', customer_name: 'Rohit Kadam', customer_phone: '+91-9820011999' })
  });
  assert.equal(res2.status, 200);
  const data2 = await res2.json();
  assert.equal(data2.data.action, 'TEST_DRIVE_BOOKED');
  assert.ok(data2.data.reply.includes('VIP Test Drive'));
});

test('Ultimate Pillar 2: Tally Prime XML Sales Voucher Export', async () => {
  const xmlRes = await fetch(`${baseUrl}/api/tally/sales-xml`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  assert.equal(xmlRes.status, 200);
  assert.equal(xmlRes.headers.get('content-type'), 'application/xml; charset=utf-8');
  const xmlText = await xmlRes.text();
  assert.ok(xmlText.includes('<TALLYREQUEST>Import Data</TALLYREQUEST>'));
  assert.ok(xmlText.includes('Motor Car Sales Account (HSN 8703)'));
  assert.ok(xmlText.includes('Output CGST @ 14%'));
  assert.ok(xmlText.includes('Output SGST @ 14%'));
});

test('Ultimate Pillar 3: Live Transport GPS Radar', async () => {
  const gpsRes = await fetch(`${baseUrl}/api/transport/tracking/OTF-892101`);
  assert.equal(gpsRes.status, 200);
  const gpsData = await gpsRes.json();
  assert.ok(gpsData.data.carrier.truck_number.startsWith('MH-12'));
  assert.ok(gpsData.data.route.total_distance_km > 100);
  assert.ok(gpsData.data.milestones.length >= 5);
});

test('Ultimate Pillar 4: Used Car B2B Auction Bidding Engine', async () => {
  const listRes = await fetch(`${baseUrl}/api/auctions`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  assert.equal(listRes.status, 200);
  const listData = await listRes.json();
  assert.ok(listData.data.length >= 2);

  const targetAuc = listData.data[0];
  const bidRes = await fetch(`${baseUrl}/api/auctions/${targetAuc.id}/bid`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ bidder_name: 'Spinny Direct Procurement', bid_amount: parseFloat(targetAuc.current_highest_bid) + 20000 })
  });
  assert.equal(bidRes.status, 200);
  const bidData = await bidRes.json();
  assert.equal(bidData.data.highest_bidder, 'Spinny Direct Procurement');

  const acceptRes = await fetch(`${baseUrl}/api/auctions/${targetAuc.id}/accept`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` }
  });
  assert.equal(acceptRes.status, 200);
  const acceptData = await acceptRes.json();
  assert.equal(acceptData.data.auction_status, 'ACCEPTED');
});

test('Ultimate Pillar 5: Accidental Insurance Body Shop & Surveyor Sanction', async () => {
  const claimsRes = await fetch(`${baseUrl}/api/bodyshop/claims`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  assert.equal(claimsRes.status, 200);
  const claimsData = await claimsRes.json();
  assert.ok(claimsData.data.length >= 2);

  const pendingClaim = claimsData.data.find(c => c.claim_status !== 'CASHLESS_SANCTIONED') || claimsData.data[0];
  const approveRes = await fetch(`${baseUrl}/api/bodyshop/claims/${pendingClaim.id}/surveyor-approve`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ approved_amount: 55000 })
  });
  assert.equal(approveRes.status, 200);
  const approveData = await approveRes.json();
  assert.equal(approveData.data.claim_status, 'CASHLESS_SANCTIONED');
  assert.equal(approveData.data.approved_amount, 55000);
});

test('Ultimate Pillar 6: HSRP Number Plate & FASTag Activation Desk', async () => {
  const listRes = await fetch(`${baseUrl}/api/compliance`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  assert.equal(listRes.status, 200);
  const listData = await listRes.json();
  assert.ok(listData.data.length >= 2);

  const target = listData.data.find(f => f.fastag_status === 'PENDING') || listData.data[0];

  // Map HSRP Laser
  const hsrpRes = await fetch(`${baseUrl}/api/compliance/hsrp-map`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ id: target.id, front_laser_code: 'MH02AA99081', rear_laser_code: 'MH02AA99082' })
  });
  assert.equal(hsrpRes.status, 200);
  const hsrpData = await hsrpRes.json();
  assert.equal(hsrpData.data.hsrp_status, 'AFFIXED');

  // Activate FASTag
  const fastagRes = await fetch(`${baseUrl}/api/compliance/fastag-activate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ id: target.id, fastag_barcode: '60741299881099', fastag_bank: 'ICICI_BANK' })
  });
  assert.equal(fastagRes.status, 200);
  const fastagData = await fastagRes.json();
  assert.equal(fastagData.data.fastag_status, 'ACTIVE');
});
