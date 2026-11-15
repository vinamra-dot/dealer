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
    const isRemote = config.databaseUrl && (
      config.databaseUrl.includes('supabase') ||
      config.databaseUrl.includes('pooler') ||
      config.databaseUrl.includes('sslmode=') ||
      config.databaseUrl.includes('.co') ||
      config.databaseUrl.includes('.com')
    );

    pool = new Pool({
      connectionString: config.databaseUrl,
      connectionTimeoutMillis: 6000,
      ssl: isRemote ? { rejectUnauthorized: false } : undefined
    });

    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('[PostgreSQL] Connected to database server successfully.');
    isInMemory = false;
    return { isInMemory: false };
  } catch (err) {
    if (!memDb) {
      console.warn('[PostgreSQL] Remote server unreachable, initializing high-fidelity in-memory engine...');
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
  if (!pool && !memClient) {
    await initDb();
  }

  if (!isInMemory && pool) {
    return pool.query(text, params);
  }

  if (isInMemory && memClient) {
    try {
      return await memClient.query(text, params);
    } catch (memErr) {
      console.error('[DB Query Error in pg-mem]', memErr.message, 'Query:', text);
      throw memErr;
    }
  }

  throw new Error('Database connection failed.');
}

export function isDbInMemory() {
  return isInMemory;
}
