import app from './app';
import { ENV } from './config/env';

// Only start the HTTP listener if running locally outside of Vercel serverless
if (!process.env.VERCEL && process.env.NODE_ENV !== 'production') {
  app.listen(ENV.PORT, () => {
    console.log(`Gujranwala Food Craze API running on http://localhost:${ENV.PORT}`);
    console.log(`Environment: ${ENV.NODE_ENV}`);
  });
}

export default app;
