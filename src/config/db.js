import pkg from 'pg';
import { newDb } from 'pg-mem';
import { config } from './env.js';

const { Pool } = pkg;

let pool = null;
let memDb = null;
let memClient = null;
let isInMemory = false;

export async function initDb() {
  if (pool) return { isInMemory: false };
  if (memDb && memClient) return { isInMemory: true };

  try {
    pool = new Pool({
      connectionString: config.databaseUrl,
      connectionTimeoutMillis: 1500
    });

    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('[PostgreSQL] Connected to database server successfully.');
    isInMemory = false;
    return { isInMemory: false };
  } catch (err) {
    if (!memDb) {
      console.warn('[PostgreSQL] Server unavailable, initializing high-fidelity in-memory PostgreSQL engine (pg-mem)...');
      memDb = newDb();
      memDb.public.registerFunction({
        implementation: () => new Date().toISOString(),
        name: 'now'
      });
      const adapter = memDb.adapters.createPg();
      memClient = new adapter.Client();
      await memClient.connect();
    }
    isInMemory = true;
    return { isInMemory: true };
  }
}

export async function query(text, params = []) {
  if (!isInMemory && pool) {
    return pool.query(text, params);
  }

  if (isInMemory && memClient) {
    try {
      const res = await memClient.query(text, params);
      return res;
    } catch (memErr) {
      console.error('[DB Query Error in pg-mem]', memErr.message, 'Query:', text);
      throw memErr;
    }
  }

  throw new Error('Database not initialized. Call initDb() first.');
}

export function isDbInMemory() {
  return isInMemory;
}
