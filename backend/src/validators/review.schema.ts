import { z } from 'zod';

export const createReviewSchema = z.object({
  name: z
    .string({ required_error: 'Apna naam likhein (Name is required)' })
    .trim()
    .min(2, { message: 'Naam kam az kam 2 characters ka hona chahiye' })
    .max(40, { message: 'Naam 40 characters se zyada nahi ho sakta' }),
  rating: z
    .number({ required_error: 'Rating dena zaroori hai (Rating is required)' })
    .int()
    .min(1, { message: 'Minimum 1 star rating zaroori hai' })
    .max(5, { message: 'Maximum 5 star rating ho sakti hai' }),
  message: z
    .string({ required_error: 'Apna review likhein (Message is required)' })
    .trim()
    .min(5, { message: 'Review kam az kam 5 characters ka hona chahiye' })
    .max(280, { message: 'Review 280 characters se zyada nahi ho sakta' }),
  note_color: z.enum(['cream', 'amber', 'red'], {
    required_error: 'Note ka color chunein (cream, amber, red)',
  }),
  source: z.string().max(50).optional().default('direct'),
  website: z.string().max(0, { message: 'Spam detected' }).optional().or(z.literal('')),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
