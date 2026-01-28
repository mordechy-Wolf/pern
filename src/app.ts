import express, { Express, Request, Response } from 'express';
import { Pool } from 'pg';
import { Logger } from './core/logger';
import { ModuleFactory } from './modules';
import {
  ErrorMiddleware,
  LoggingMiddleware,
  CorsMiddleware,
  SanitizeMiddleware,
  TimeoutMiddleware,
  ResponseMiddleware,
} from './middleware';
import { API } from './config/constants';

/**
 * Create and configure Express application - מצומצם רק ל-auth + admin
 */
export function createApp(pool: Pool): Express {
  const logger = Logger.getInstance();
  const app = express();

  logger.info('🔧 Configuring Express application (users + admins only)...');

  // ==========================================
  // Basic Middleware
  // ==========================================
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  const corsMiddleware = new CorsMiddleware();
  app.use(corsMiddleware.create());

  const sanitizeMiddleware = new SanitizeMiddleware();
  app.use(sanitizeMiddleware.sanitizeAll);

  const timeoutMiddleware = new TimeoutMiddleware();
  app.use(timeoutMiddleware.timeout(30000));

  const responseMiddleware = new ResponseMiddleware();
  app.use(responseMiddleware.addHelpers);

  const loggingMiddleware = new LoggingMiddleware();
  app.use(loggingMiddleware.logRequest);

  // ==========================================
  // Health Check
  // ==========================================
  app.get('/health', (req: Request, res: Response) => {
    res.success({ status: 'healthy', timestamp: new Date().toISOString() });
  });

  // ==========================================
  // API Routes - רק auth ו-admin
  // ==========================================
  const moduleFactory = new ModuleFactory(pool);
  const { routes, middleware } = moduleFactory.createAll();

  // Auth routes (register, login, me, profile, password, delete)
  app.use(`${API.PREFIX}/auth`, routes.auth);

  // Admin routes (grant, revoke, get list)
  app.use(`${API.PREFIX}/admin`, routes.admin);

  // אם תרצה להוסיף list של כל המשתמשים - הוסף כאן:
  // app.use(`${API.PREFIX}/users`, routes.users);

  logger.info('✅ Routes mounted:');
  logger.info(` - ${API.PREFIX}/auth/*`);
  logger.info(` - ${API.PREFIX}/admin/*`);

  // ==========================================
  // Root Route
  // ==========================================
  app.get('/', (req: Request, res: Response) => {
    res.success({
      name: 'Blog API - Users & Admins Only',
      version: '1.0.0',
      description: 'מצב מצומצם: ניהול משתמשים ומנהלים בלבד',
      endpoints: {
        auth: `${API.PREFIX}/auth`,
        admin: `${API.PREFIX}/admin`,
        health: '/health',
      },
    });
  });

  // ==========================================
  // Error Handling
  // ==========================================
  const errorMiddleware = new ErrorMiddleware();
  app.use(errorMiddleware.notFound);
  app.use(errorMiddleware.handle);

  logger.info('✅ Express application configured (users + admins only)');
  return app;
}