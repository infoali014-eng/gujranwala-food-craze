import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    data: {
      status: 'ok',
      service: 'gujranwala-food-craze-api',
      timestamp: new Date().toISOString(),
    },
    error: null,
  });
});

export default router;
