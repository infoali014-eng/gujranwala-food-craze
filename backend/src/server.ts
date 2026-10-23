import app from './app';
import { ENV } from './config/env';

const server = app.listen(ENV.PORT, () => {
  console.log(`Gujranwala Food Craze API running on http://localhost:${ENV.PORT}`);
  console.log(`Environment: ${ENV.NODE_ENV}`);
});

export default server;
