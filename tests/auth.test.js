import test from 'node:test';
import assert from 'node:assert/strict';
import { initDb } from '../src/config/db.js';
import { runMigrations } from '../src/migrations/runMigrations.js';
import { runSeeds } from '../src/seeds/runSeeds.js';
import app from '../src/app.js';

let server;
let baseUrl;

test.before(async () => {
  await initDb();
  await runMigrations();
  await runSeeds();
  server = app.listen(0);
  const port = server.address().port;
  baseUrl = `http://127.0.0.1:${port}`;
});

test.after(() => {
  server.close();
});

test('Auth: should reject login with wrong password', async () => {
  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'ceo@apexmotors.com', password: 'WrongPassword' })
  });
  const data = await res.json();
  assert.equal(res.status, 401);
  assert.equal(data.success, false);
});

test('Auth: should successfully log in as CEO and return valid JWT', async () => {
  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'ceo@apexmotors.com', password: 'Password@123' })
  });
  const data = await res.json();
  assert.equal(res.status, 200);
  assert.equal(data.success, true);
  assert.ok(data.data.token);
  assert.equal(data.data.user.role, 'SYSTEM_ADMIN');
});

test('Auth: should fetch current user profile with Bearer token', async () => {
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'gm@apexmotors.com', password: 'Password@123' })
  });
  const loginData = await loginRes.json();

  const meRes = await fetch(`${baseUrl}/api/auth/me`, {
    headers: { Authorization: `Bearer ${loginData.data.token}` }
  });
  const meData = await meRes.json();
  assert.equal(meRes.status, 200);
  assert.equal(meData.data.role, 'GENERAL_MANAGER');
  assert.equal(meData.data.dealership_name, 'Apex Mobility Motors');
});

test('RBAC: Telecaller should be blocked from Finance and Dashboard APIs', async () => {
  const tcLogin = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'telecaller@apexmotors.com', password: 'Password@123' })
  });
  const tcData = await tcLogin.json();
  const tcHeaders = { Authorization: `Bearer ${tcData.data.token}` };

  // Telecaller should get 403 on Finance Records
  const finRes = await fetch(`${baseUrl}/api/finance/records`, { headers: tcHeaders });
  assert.equal(finRes.status, 403);

  // Telecaller should get 403 on Executive Cockpit
  const dashRes = await fetch(`${baseUrl}/api/analytics/dashboard`, { headers: tcHeaders });
  assert.equal(dashRes.status, 403);

  // Telecaller should succeed on Leads
  const leadsRes = await fetch(`${baseUrl}/api/leads`, { headers: tcHeaders });
  assert.equal(leadsRes.status, 200);
});
