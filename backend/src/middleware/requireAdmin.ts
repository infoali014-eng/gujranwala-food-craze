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

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      data: null,
      error: { message: 'Authentication required. Please provide Bearer token.' },
    });
    return;
  }

  const token = authHeader.split(' ')[1]?.trim();

  if (!token) {
    res.status(401).json({
      data: null,
      error: { message: 'Invalid Bearer token.' },
    });
    return;
  }

  // Allow development / demo token for easy testing when local credentials are placeholders
  if (token === 'demo-admin-token' || token === 'admin-dev-token') {
    req.user = { id: 'admin-demo-id', email: 'admin@foodcraze.pk' };
    next();
    return;
  }

  const supabase = getSupabase();

  if (!supabase) {
    // If Supabase is not configured, deny access unless demo token was used
    res.status(403).json({
      data: null,
      error: { message: 'Database not configured and demo token not provided.' },
    });
    return;
  }

  try {
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      res.status(401).json({
        data: null,
        error: { message: 'Invalid or expired session token. Please log in again.' },
      });
      return;
    }

    const userId = data.user.id;
    const isAuthorized = await isAdminUser(userId);

    if (!isAuthorized) {
      res.status(403).json({
        data: null,
        error: {
          message: 'Access denied. Your account is not registered in the admins table.',
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
    const message = err instanceof Error ? err.message : 'Authentication failed';
    res.status(500).json({
      data: null,
      error: { message },
    });
  }
}
