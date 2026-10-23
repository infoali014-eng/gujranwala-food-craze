import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { ENV } from './config/env';
import healthRoutes from './routes/health.routes';
import reviewsRoutes from './routes/reviews.routes';
import siteRoutes from './routes/site.routes';
import adminRoutes from './routes/admin.routes';
import { errorHandler } from './middleware/errorHandler';

const app: Application = express();

// Security and utility middleware
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, serverless internal)
      if (!origin) return callback(null, true);
      // In development allow any localhost
      if (
        ENV.NODE_ENV === 'development' &&
        (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1'))
      ) {
        return callback(null, true);
      }
      if (origin === ENV.FRONTEND_URL) {
        return callback(null, true);
      }
      return callback(new Error(`CORS policy does not allow access from ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json());

// Public API Routes
app.use('/api/health', healthRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api', siteRoutes);

// Protected Admin Routes
app.use('/api/admin', adminRoutes);

// Central error handler
app.use(errorHandler);

export default app;
