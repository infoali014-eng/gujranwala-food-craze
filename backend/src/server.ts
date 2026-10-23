import app from './app';
import { ENV } from './config/env';

const port = process.env.PORT || ENV.PORT || 5000;

app.listen(port, () => {
  console.log(`Gujranwala Food Craze API running on http://localhost:${port}`);
  console.log(`Environment: ${ENV.NODE_ENV}`);
});

export default app;
