import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
}

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    data: null,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Always log full error details to server console (visible in Vercel runtime logs)
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err);

  const statusCode = (err as AppError).statusCode || 500;
  const isProd = process.env.NODE_ENV === 'production';

  // If error is an explicit configuration error or client 4xx validation error, pass message safely
  let clientMessage = err.message || 'Internal Server Error';
  if (isProd && statusCode >= 500 && !err.message?.startsWith('Server configuration error')) {
    clientMessage = 'A server error occurred. Please try again later.';
  }

  res.status(statusCode).json({
    data: null,
    error: clientMessage,
  });
};
