import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env from cwd as well as relative paths to backend/.env
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../backend/.env') });

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  SUPABASE_URL: z.string().min(1, 'SUPABASE_URL is missing'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is missing'),
  FRONTEND_ORIGIN: z.string().default(''),
  ALLOW_VERCEL_PREVIEWS: z.coerce.boolean().default(true),
  REVIEW_RATE_LIMIT_PER_HOUR: z.coerce.number().default(3),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function getMissingEnvVars(): string[] {
  const missing: string[] = [];
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_URL.trim()) {
    missing.push('SUPABASE_URL');
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.SUPABASE_SERVICE_ROLE_KEY.trim()) {
    missing.push('SUPABASE_SERVICE_ROLE_KEY');
  }
  const origin =
    process.env.FRONTEND_ORIGIN ||
    process.env.FRONTEND_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : '') ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '') ||
    (process.env.NODE_ENV !== 'production' ? 'http://localhost:3000' : '');

  if (!origin) {
    missing.push('FRONTEND_ORIGIN');
  }

  return missing;
}

export function validateEnv():
  | { valid: true; env: EnvConfig }
  | { valid: false; code: 'ENV_MISSING'; error: string; missing: string[] } {
  const missing = getMissingEnvVars();
  if (missing.length > 0) {
    return {
      valid: false,
      code: 'ENV_MISSING',
      error: `Server configuration error: ${missing[0]} is missing`,
      missing,
    };
  }

  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const firstIssue = result.error.issues[0];
    const missingField = String(firstIssue.path[0] || 'Required variable');
    return {
      valid: false,
      code: 'ENV_MISSING',
      error: `Server configuration error: ${missingField} is missing`,
      missing: [missingField],
    };
  }

  if (!result.data.SUPABASE_URL.startsWith('https://')) {
    return {
      valid: false,
      code: 'ENV_MISSING',
      error: 'Server configuration error: SUPABASE_URL is invalid (must start with https://)',
      missing: ['SUPABASE_URL'],
    };
  }

  return { valid: true, env: result.data };
}

export function isEnvConfigured(): boolean {
  return validateEnv().valid;
}

export const ENV = {
  get PORT(): number {
    return process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
  },
  get NODE_ENV(): string {
    return process.env.NODE_ENV || 'development';
  },
  get SUPABASE_URL(): string {
    return process.env.SUPABASE_URL || '';
  },
  get SUPABASE_SERVICE_ROLE_KEY(): string {
    return process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  },
  get FRONTEND_ORIGIN(): string {
    return (
      process.env.FRONTEND_ORIGIN ||
      process.env.FRONTEND_URL ||
      (process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : '') ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '') ||
      (process.env.NODE_ENV !== 'production' ? 'http://localhost:3000' : '')
    );
  },
  get ALLOW_VERCEL_PREVIEWS(): boolean {
    return process.env.ALLOW_VERCEL_PREVIEWS !== 'false';
  },
  get REVIEW_RATE_LIMIT_PER_HOUR(): number {
    return process.env.REVIEW_RATE_LIMIT_PER_HOUR
      ? parseInt(process.env.REVIEW_RATE_LIMIT_PER_HOUR, 10)
      : 3;
  },
};
