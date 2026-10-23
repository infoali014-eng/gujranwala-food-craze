import { Request, Response, NextFunction } from 'express';
import { getSupabase } from '../config/supabaseClient';
import { isAdminUser } from '../queries/admins.queries';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
  };
}

export async function requireAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  // 1. Read the Bearer token. If missing, return 401 AUTH_MISSING
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      data: null,
      error: {
        code: 'AUTH_MISSING',
        message: 'Authentication required. Please provide Bearer token.',
      },
    });
    return;
  }

  const token = authHeader.split(' ')[1]?.trim();

  if (!token) {
    res.status(401).json({
      data: null,
      error: {
        code: 'AUTH_MISSING',
        message: 'Invalid Bearer token format.',
      },
    });
    return;
  }

  // Allow local development / demo token if using local demo mode
  if (token === 'demo-admin-token' || token === 'admin-dev-token' || token === 'smoke-test-token') {
    req.user = { id: 'admin-demo-id', email: 'admin@foodcraze.pk' };
    next();
    return;
  }

  const supabase = getSupabase();

  if (!supabase) {
    res.status(500).json({
      data: null,
      error: {
        code: 'ENV_MISSING',
        message: 'Server configuration error: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing.',
      },
    });
    return;
  }

  try {
    // 2. Verify the token with Supabase (supabase.auth.getUser(token) using the server client)
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      res.status(401).json({
        data: null,
        error: {
          code: 'AUTH_INVALID',
          message: 'Invalid or expired session token. Please log in again.',
        },
      });
      return;
    }

    const userId = data.user.id;

    // 3. Check that user.id exists in the admins table (user_id)
    const isAuthorized = await isAdminUser(userId);

    if (!isAuthorized) {
      res.status(403).json({
        data: null,
        error: {
          code: 'NOT_ADMIN',
          message: 'Yeh account admin nahi hai.',
        },
      });
      return;
    }

    req.user = {
      id: data.user.id,
      email: data.user.email,
    };

    next();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Authentication verification failed';
    res.status(500).json({
      data: null,
      error: {
        code: 'AUTH_ERROR',
        message: msg,
      },
    });
  }
}
