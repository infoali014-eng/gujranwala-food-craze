import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  SUPABASE_URL: z.string().min(1, 'SUPABASE_URL is missing'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is missing'),
  FRONTEND_ORIGIN: z.string().optional().default(''),
  ALLOW_VERCEL_PREVIEWS: z.coerce.boolean().default(true),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(): { valid: true; env: EnvConfig } | { valid: false; error: string } {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const firstIssue = result.error.issues[0];
    const missingField = firstIssue.path[0] || 'Required variable';
    return {
      valid: false,
      error: `Server configuration error: ${missingField} is missing`,
    };
  }

  // Validate URL format for SUPABASE_URL without exposing the value
  if (!result.data.SUPABASE_URL.startsWith('https://')) {
    return {
      valid: false,
      error: 'Server configuration error: SUPABASE_URL is invalid (must start with https://)',
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
    return process.env.FRONTEND_ORIGIN || process.env.FRONTEND_URL || '';
  },
  get ALLOW_VERCEL_PREVIEWS(): boolean {
    return process.env.ALLOW_VERCEL_PREVIEWS !== 'false';
  },
};
