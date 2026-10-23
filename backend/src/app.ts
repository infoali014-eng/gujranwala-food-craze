import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { ENV } from './config/env';
import healthRoutes from './routes/health.routes';
import reviewsRoutes from './routes/reviews.routes';
import siteRoutes from './routes/site.routes';
import adminRoutes from './routes/admin.routes';
import { checkDatabaseConfig } from './middleware/checkDatabaseConfig';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

const app: Application = express();

// Trust Vercel / reverse proxy for correct client IP detection and headers
app.set('trust proxy', 1);

// Security headers
app.use(helmet());

// Production CORS configuration
const rawOrigins = (ENV.FRONTEND_ORIGIN || '').trim();
const allowedOrigins = rawOrigins
  ? rawOrigins.split(',').map((o) => o.trim().toLowerCase()).filter(Boolean)
  : [];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, SSR, server-to-server)
    if (!origin) return callback(null, true);

    try {
      const parsed = new URL(origin);
      const hostname = parsed.hostname.toLowerCase();

      // 1. Always allow localhost and loopback
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return callback(null, true);
      }

      // 2. Always allow any Vercel deployment (*.vercel.app)
      if (hostname.endsWith('.vercel.app')) {
        return callback(null, true);
      }

      // 3. Allow Vercel automatic deployment URLs
      if (process.env.VERCEL_URL && hostname === process.env.VERCEL_URL.toLowerCase()) {
        return callback(null, true);
      }
      if (
        process.env.VERCEL_PROJECT_PRODUCTION_URL &&
        hostname === process.env.VERCEL_PROJECT_PRODUCTION_URL.toLowerCase()
      ) {
        return callback(null, true);
      }

      // 4. Check configured frontend origins
      const originLower = origin.toLowerCase();
      if (
        allowedOrigins.includes('*') ||
        allowedOrigins.some((allowed) => allowed === originLower || allowed === `https://${hostname}`)
      ) {
        return callback(null, true);
      }

      // 5. Default allow if no specific FRONTEND_ORIGIN was provided
      if (allowedOrigins.length === 0) {
        return callback(null, true);
      }

      // Safe reject without throwing an unhandled Error
      return callback(null, false);
    } catch {
      return callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));
// Handle preflight requests across all endpoints
app.options('*', cors(corsOptions));

app.use(express.json());

// Public health check routes (never require database config so they always succeed)
app.use('/api/health', healthRoutes);
app.use('/health', healthRoutes);

// Root route for sanity check
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    data: {
      service: 'gujranwala-food-craze-api',
      status: 'active',
    },
    error: null,
  });
});

// Database-backed routes mounted on both prefixed and non-prefixed paths for flexible routing
app.use('/api/reviews', checkDatabaseConfig, reviewsRoutes);
app.use('/reviews', checkDatabaseConfig, reviewsRoutes);

app.use('/api/admin', checkDatabaseConfig, adminRoutes);
app.use('/admin', checkDatabaseConfig, adminRoutes);

app.use('/api', checkDatabaseConfig, siteRoutes);
app.use('/', checkDatabaseConfig, siteRoutes);

// 404 handler for unmapped routes
app.use(notFoundHandler);

// Central error handler
app.use(errorHandler);

export default app;
