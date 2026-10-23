import express, { Application, Request, Response, NextFunction } from 'express';
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

// Trust Vercel / reverse proxy for correct client IP detection (MUST be before any middleware)
app.set('trust proxy', 1);

// Generate short requestId for structured logging and response tracking
app.use((req: Request, _res: Response, next: NextFunction) => {
  (req as any).requestId = `req_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
  next();
});

// Security headers
app.use(helmet());

// Production CORS configuration
function isOriginAllowed(origin?: string): boolean {
  if (!origin) return true; // Server-to-server, mobile app, curl, SSR

  try {
    const parsed = new URL(origin);
    const hostname = parsed.hostname.toLowerCase();

    // Local development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return true;
    }

    // Allow all Vercel deployment domains (*.vercel.app)
    if (hostname.endsWith('.vercel.app')) {
      return true;
    }

    // Configured frontend origin(s)
    const rawOrigins = (ENV.FRONTEND_ORIGIN || '').trim();
    if (rawOrigins) {
      const allowed = rawOrigins
        .split(',')
        .map((o) => o.trim().toLowerCase())
        .filter(Boolean);

      const originLower = origin.toLowerCase();
      if (allowed.includes('*') || allowed.some((a) => a === originLower || a === `https://${hostname}`)) {
        return true;
      }
    }

    // Vercel auto-injected system URLs
    if (process.env.VERCEL_URL && hostname === process.env.VERCEL_URL.toLowerCase()) {
      return true;
    }
    if (
      process.env.VERCEL_PROJECT_PRODUCTION_URL &&
      hostname === process.env.VERCEL_PROJECT_PRODUCTION_URL.toLowerCase()
    ) {
      return true;
    }

    // Default allow if no specific FRONTEND_ORIGIN was provided
    if (!ENV.FRONTEND_ORIGIN) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

// Custom CORS check ensuring CORS_BLOCKED JSON response on rejection
app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;

  if (origin && !isOriginAllowed(origin)) {
    res.status(403).json({
      data: null,
      error: {
        code: 'CORS_BLOCKED',
        message: `CORS policy does not allow access from origin: ${origin}`,
      },
      requestId: (req as any).requestId,
    });
    return;
  }

  next();
});

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
// Handle preflight requests across all endpoints
app.options('*', cors(corsOptions));

app.use(express.json());

// Public health check routes (never require database config so they always succeed)
app.use('/api/health', healthRoutes);
app.use('/health', healthRoutes);

// Root route for sanity check
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    data: {
      service: 'gujranwala-food-craze-api',
      status: 'active',
      timestamp: new Date().toISOString(),
    },
    error: null,
    requestId: (req as any).requestId,
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
