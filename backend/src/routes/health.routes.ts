import { Router, Request, Response } from 'express';
import { isEnvConfigured, getMissingEnvVars } from '../config/env';
import { getSupabase } from '../config/supabaseClient';

const router = Router();

// GET /api/health
router.get('/', (_req: Request, res: Response) => {
  const envConfigured = isEnvConfigured();
  const missing = getMissingEnvVars();

  res.status(200).json({
    ok: true,
    envConfigured,
    missing,
    status: 'ok',
    service: 'gujranwala-food-craze-api',
    timestamp: new Date().toISOString(),
  });
});

// GET /api/health/db (runs tiny read on reviews table through Supabase)
router.get('/db', async (_req: Request, res: Response) => {
  const supabase = getSupabase();

  if (!supabase || process.env.SUPABASE_URL?.includes('dummy')) {
    res.status(200).json({
      ok: true,
      mode: 'fallback',
      hint: 'Local fallback mode active. In production, real Supabase is queried.',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('id')
      .limit(1);

    if (error) {
      if (process.env.NODE_ENV !== 'production') {
        res.status(200).json({
          ok: true,
          mode: 'fallback',
          hint: error.message,
          timestamp: new Date().toISOString(),
        });
        return;
      }
      res.status(500).json({
        ok: false,
        errorCode: error.code || 'DB_QUERY_FAILED',
        hint: error.message || 'Error querying reviews table. Ensure migrations have been run in Supabase SQL editor.',
      });
      return;
    }

    res.status(200).json({
      ok: true,
      errorCode: null,
      hint: null,
      count: data?.length || 0,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    if (process.env.NODE_ENV !== 'production') {
      res.status(200).json({
        ok: true,
        mode: 'fallback',
        hint: err instanceof Error ? err.message : 'Database offline in dev',
        timestamp: new Date().toISOString(),
      });
      return;
    }
    const msg = err instanceof Error ? err.message : 'Unknown database error';
    res.status(500).json({
      ok: false,
      errorCode: 'DB_EXCEPTION',
      hint: msg,
    });
  }
});

export default router;
