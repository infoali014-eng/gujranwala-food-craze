import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export const notFoundHandler = (req: Request, res: Response): void => {
  const reqId = (req as any).requestId || `req_${Date.now().toString(36)}`;
  res.status(404).json({
    data: null,
    error: {
      code: 'NOT_FOUND',
      message: `Route not found: ${req.method} ${req.originalUrl}`,
    },
    requestId: reqId,
  });
};

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const reqId = (req as any).requestId || `req_${Date.now().toString(36)}`;
  console.error(`[Error] [${reqId}] ${req.method} ${req.originalUrl}:`, err);

  const statusCode = (err as AppError).statusCode || 500;
  const isProd = process.env.NODE_ENV === 'production';
  const errorCode = (err as AppError).code || (statusCode === 404 ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR');

  let clientMessage = err.message || 'Internal Server Error';
  if (isProd && statusCode >= 500 && !err.message?.startsWith('Server configuration error')) {
    clientMessage = err.message || 'A server error occurred. Please try again later.';
  }

  res.status(statusCode).json({
    data: null,
    error: {
      code: errorCode,
      message: clientMessage,
    },
    requestId: reqId,
  });
};
