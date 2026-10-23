import { Request, Response, NextFunction } from 'express';
import { validateEnv } from '../config/env';

export const checkDatabaseConfig = (_req: Request, res: Response, next: NextFunction): void => {
  const envValidation = validateEnv();
  if (!envValidation.valid) {
    res.status(500).json({
      data: null,
      error: {
        code: envValidation.code,
        message: envValidation.error,
      },
    });
    return;
  }
  next();
};
