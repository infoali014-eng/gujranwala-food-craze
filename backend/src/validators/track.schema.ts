import { z } from 'zod';

export const trackClickSchema = z.object({
  source: z.string().max(50).optional().default('direct'),
  button: z.string({ required_error: 'Button identifier is required' }).min(1).max(100),
});

export type TrackClickInput = z.infer<typeof trackClickSchema>;
