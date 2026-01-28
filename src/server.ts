import dotenv from 'dotenv';
import { createApp } from './app';
import { getDatabaseLifecycle, setupDatabaseShutdownHandlers } from './database';
import { Logger } from './core/logger';
import { envConfig } from './config/env';

// טעינת משתני סביבה
dotenv.config();

async function startServer() {
  const logger = Logger.getInstance();

  try {
    logger.info('🚀 Starting Blog API Server...');

    // 1. אתחול מחזור החיים של מסד הנתונים
    const dbLifecycle = getDatabaseLifecycle();

    const dbResult = await dbLifecycle.initialize({
      host: envConfig.get('PGHOST'),
      port: envConfig.get('PGPORT'),
      database: envConfig.get('PGDATABASE'),
      user: envConfig.get('PGUSER'),
      password: envConfig.get('PGPASSWORD'),
      max: envConfig.get('PGPOOL_MAX') || 20,
      min: envConfig.get('PGPOOL_MIN') || 2,
      idleTimeoutMillis: envConfig.get('PGPOOL_IDLE_TIMEOUT') || 30000,
      connectionTimeoutMillis: envConfig.get('PGPOOL_CONNECTION_TIMEOUT') || 5000,
      allowExitOnIdle: !envConfig.isProduction(),
    });

    if (!dbResult.ok) {
      throw new Error(`Database connection failed: ${dbResult.error}`);
    }

    // 2. כאן אנחנו מחלצים את ה-pool מתוך ה-dbLifecycle
    // שים לב: dbLifecycle.getPool() מחזיר את האובייקט שמנהל את ה-pool
    const poolManager = dbLifecycle.getPool();
    const actualPool = poolManager.getPool(); // שליפת ה-Pool האמיתי של pg

    logger.info('✅ Database connection established');

    // 3. הגדרת סגירה מסודרת
    setupDatabaseShutdownHandlers();

    // 4. יצירת האפליקציה עם ה-pool שחילצנו
    const app = createApp(actualPool);

    // 5. הפעלת השרת
    const PORT = envConfig.get('PORT') || 3000;
    const server = app.listen(PORT, () => {
      logger.info(`✅ Server started successfully! http://localhost:${PORT}`);
    });

    // טיפול בסיגנלים לסגירה
    const gracefulShutdown = async (signal: string) => {
      logger.info(`\n${signal} received, shutting down...`);
      server.close(async () => {
        await dbLifecycle.shutdown();
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('❌ Failed to start server', error);
    process.exit(1);
  }
}

// הרצה
startServer();