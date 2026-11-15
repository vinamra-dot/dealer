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

test('Extensions: KYC, Workshop, Spare Parts & CSAT Lifecycle', async () => {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };

  // 1. KYC verification
  const kycRes = await fetch(`${baseUrl}/api/kyc`, { headers });
  const kycData = await kycRes.json();
  assert.equal(kycRes.status, 200);
  assert.ok(kycData.data.length >= 4);

  const pendingKyc = kycData.data.find(k => k.verification_status === 'PENDING');
  if (pendingKyc) {
    const verifyRes = await fetch(`${baseUrl}/api/kyc/${pendingKyc.id}/verify`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status: 'VERIFIED', remarks: 'Aadhaar validated via RTO portal' })
    });
    assert.equal(verifyRes.status, 200);
  }

  // 2. Workshop Job Cards
  const jcRes = await fetch(`${baseUrl}/api/workshop/jobs`, { headers });
  const jcData = await jcRes.json();
  assert.equal(jcRes.status, 200);
  assert.ok(jcData.data.length >= 4);

  const jcId = jcData.data[0].id;
  const updateJcRes = await fetch(`${baseUrl}/api/workshop/jobs/${jcId}/status`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ status: 'QC_CLEARED' })
  });
  assert.equal(updateJcRes.status, 200);

  // 3. Spare Parts & Stock Issuance
  const partsRes = await fetch(`${baseUrl}/api/parts`, { headers });
  const partsData = await partsRes.json();
  assert.equal(partsRes.status, 200);
  assert.ok(partsData.data.length >= 6);

  const oilPart = partsData.data.find(p => p.part_number === 'TM-OIL-SYN-5W30');
  assert.ok(oilPart);
  const prevQty = oilPart.stock_quantity;

  const issueRes = await fetch(`${baseUrl}/api/parts/${oilPart.id}/issue`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ quantity: 2 })
  });
  const issueData = await issueRes.json();
  assert.equal(issueRes.status, 200);
  assert.equal(issueData.data.stock_quantity, prevQty - 2);

  // 4. CSAT Retention & Service Reminders
  const csatRes = await fetch(`${baseUrl}/api/retention/surveys`, { headers });
  const csatData = await csatRes.json();
  assert.equal(csatRes.status, 200);
  assert.ok(csatData.data.length >= 3);

  const surveyId = csatData.data[0].id;
  const remindRes = await fetch(`${baseUrl}/api/retention/surveys/${surveyId}/send-reminder`, {
    method: 'POST',
    headers
  });
  assert.equal(remindRes.status, 200);
});