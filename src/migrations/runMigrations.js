import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query, initDb } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runMigrations() {
  console.log('[Migrations] Checking and running schema migrations...');
  await initDb();

  const migrationFiles = [
    '001_core_schema.sql',
    '002_operations_schema.sql',
    '003_workflow_schema.sql',
    '004_core_extensions.sql'
  ];

  for (const file of migrationFiles) {
    const filePath = path.join(__dirname, file);
    if (!fs.existsSync(filePath)) {
      console.warn(`[Migrations] Skipping missing migration file: ${file}`);
      continue;
    }

    const sqlContent = fs.readFileSync(filePath, 'utf8');
    const statements = sqlContent
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const stmt of statements) {
      try {
        await query(stmt);
      } catch (err) {
        console.error(`[Migrations] Error executing statement in ${file}:`, err.message);
        throw err;
      }
    }
    console.log(`[Migrations] Applied ${file} successfully.`);
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
