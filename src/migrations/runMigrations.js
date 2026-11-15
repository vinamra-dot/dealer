import { fileURLToPath } from 'url';
import { query, initDb } from '../config/db.js';
import { schemaPart1 } from './schemaPart1.js';
import { schemaPart2 } from './schemaPart2.js';
import { schemaPart3 } from './schemaPart3.js';
import { schemaPart4 } from './schemaPart4.js';

export async function runMigrations() {
  console.log('[Migrations] Checking and running schema migrations...');
  await initDb();

  const allSchemas = [...schemaPart1, ...schemaPart2, ...schemaPart3, ...schemaPart4];

  for (const item of allSchemas) {
    const statements = item.sql
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const stmt of statements) {
      try {
        await query(stmt);
      } catch (err) {
        console.error(`[Migrations] Error in ${item.name}:`, err.message);
        throw err;
      }
    }
    console.log(`[Migrations] Applied ${item.name} successfully.`);
  }

  console.log('[Migrations] All migrations executed successfully.');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[Migrations] Fatal error during migration:', err);
      process.exit(1);
    });
}