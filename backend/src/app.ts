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

// Security headers
app.use(helmet());

// Production CORS configuration
const allowedOrigins = (ENV.FRONTEND_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);

    // Exact matching against configured frontend origins
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Allow localhost in non-production environments
    if (
      process.env.NODE_ENV !== 'production' &&
      (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1'))
    ) {
      return callback(null, true);
    }

    // Allow Vercel preview deployments if enabled via ALLOW_VERCEL_PREVIEWS
    if (ENV.ALLOW_VERCEL_PREVIEWS && origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }

    return callback(new Error(`CORS policy does not allow access from origin: ${origin}`));
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

// Database-backed routes with lazy configuration guard
app.use('/api/reviews', checkDatabaseConfig, reviewsRoutes);
app.use('/reviews', checkDatabaseConfig, reviewsRoutes);

app.use('/api/admin', checkDatabaseConfig, adminRoutes);
app.use('/admin', checkDatabaseConfig, adminRoutes);

app.use('/api', checkDatabaseConfig, siteRoutes);

// 404 handler for unmapped routes
app.use(notFoundHandler);

// Central error handler
app.use(errorHandler);

export default app;
