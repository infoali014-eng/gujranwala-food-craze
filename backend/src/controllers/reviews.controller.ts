import { Request, Response, NextFunction } from 'express';
import { findLiveReviews, insertReview } from '../queries/reviews.queries';
import { sanitizeText } from '../utils/sanitize';
import { hasProfanity } from '../utils/profanityFilter';
import { CreateReviewInput } from '../validators/review.schema';

export async function getReviewsHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
    const cursor = (req.query.cursor as string) || undefined;

    const result = await findLiveReviews({ limit, cursor });

    res.status(200).json({
      data: result,
      error: null,
    });
  } catch (error) {
    next(error);
  }
}

export async function createReviewHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = req.body as CreateReviewInput;

    // 1. Honeypot check: If the hidden 'website' field is populated, silently drop or reject bot
    if (input.website && input.website.trim().length > 0) {
      res.status(400).json({
        data: null,
        error: { message: 'Submission rejected' },
      });
      return;
    }

    // 2. HTML Sanitization
    const cleanName = sanitizeText(input.name);
    const cleanMessage = sanitizeText(input.message);

    // 3. Profanity filter
    if (hasProfanity(cleanName) || hasProfanity(cleanMessage)) {
      res.status(400).json({
        data: null,
        error: {
          message: 'Review mein na-munaasib alfaaz shaamil hain. Please saaf zabaan use karein.',
        },
      });
      return;
    }

    // 4. Insert via queries layer
    const newReview = await insertReview({
      name: cleanName,
      rating: input.rating,
      message: cleanMessage,
      note_color: input.note_color,
      source: input.source || 'direct',
    });

    res.status(201).json({
      data: newReview,
      error: null,
    });
  } catch (error) {
    next(error);
  }
}
