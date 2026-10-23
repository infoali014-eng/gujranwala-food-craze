import { z } from 'zod';

export const updateDealSchema = z.object({
  title: z.string().min(2, 'Deal title is required').max(100),
  description: z.string().min(5, 'Deal description is required'),
  price_text: z.string().min(2, 'Price text is required'),
  valid_until: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Valid ISO date string is required for valid_until',
  }),
  is_active: z.boolean().optional().default(true),
});

export const updateMemberStatsSchema = z.object({
  joined_count: z.number().int().min(0, 'Joined count must be non-negative'),
  display_boost: z.number().int().min(0, 'Display boost must be non-negative').optional(),
});

export type UpdateDealInput = z.infer<typeof updateDealSchema>;
export type UpdateMemberStatsInput = z.infer<typeof updateMemberStatsSchema>;
