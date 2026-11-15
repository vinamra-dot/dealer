import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRouter from './routes/index.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';
import { config } from './config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let dbInitPromise = null;

async function ensureDbInitialized() {
  if (!dbInitPromise) {
    dbInitPromise = (async () => {
      const { initDb, query } = await import('./config/db.js');
      await initDb();
      try {
        const check = await query("SELECT table_name FROM information_schema.tables WHERE table_name = 'users';");
        if (check.rows.length === 0) {
          const { runMigrations } = await import('./migrations/runMigrations.js');
          const { runSeeds } = await import('./seeds/runSeeds.js');
          await runMigrations();
          await runSeeds();
        }
      } catch (err) {
        console.warn('[DB Bootstrap Check]', err.message);
      }
    })();
  }
  return dbInitPromise;
}

app.use(async (req, res, next) => {
  if (req.path.startsWith('/api')) {
    try {
      await ensureDbInitialized();
    } catch (err) {
      console.error('[DB Middleware Error]:', err);
    }
  }
  next();
});

// Serve frontend assets
app.use(express.static(path.join(__dirname, '../public')));

// API routes
app.use('/api', apiRouter);

// Fallback handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
