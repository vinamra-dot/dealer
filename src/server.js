import app from './app.js';
import { config } from './config/env.js';
import { initDb, query } from './config/db.js';
import { runMigrations } from './migrations/runMigrations.js';
import { runSeeds } from './seeds/runSeeds.js';

async function startServer() {
  try {
    console.log('[Server] Starting DealerFlow Automobile SaaS Backend...');
    await initDb();
    await runMigrations();

    // Check if initial users exist, if not seed default dataset
    const checkUsers = await query('SELECT COUNT(*) AS count FROM users;');
    const userCount = parseInt(checkUsers.rows[0]?.count || '0', 10);
    if (userCount === 0) {
      console.log('[Server] Database is empty. Running initial system seeds...');
      await runSeeds();
    } else {
      console.log(`[Server] Database ready with ${userCount} users registered.`);
    }

    const server = app.listen(config.port, () => {
      console.log(`[Server] DealerFlow SaaS running on http://localhost:${config.port}`);
      console.log(`[Server] Environment: ${config.nodeEnv}`);
    });

    const shutdown = async () => {
      console.log('[Server] Gracefully shutting down...');
      server.close(() => {
        console.log('[Server] HTTP listener closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (err) {
    console.error('[Server] Critical failure during startup:', err);
    process.exit(1);
  }
}

startServer();
