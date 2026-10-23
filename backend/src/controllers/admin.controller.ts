import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/requireAdmin';
import { findAllReviews, softDeleteReview, restoreReview } from '../queries/reviews.queries';
import { updateWeeklyDeal } from '../queries/deals.queries';
import { updateMembersStats } from '../queries/members.queries';
import { UpdateDealInput, UpdateMemberStatsInput } from '../validators/admin.schema';

export async function getAdminReviewsHandler(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const includeDeleted = req.query.includeDeleted === 'true';
    const reviews = await findAllReviews(includeDeleted);

    res.status(200).json({
      data: reviews,
      error: null,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteReviewHandler(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        data: null,
        error: { message: 'Review ID is required' },
      });
      return;
    }

    const success = await softDeleteReview(id);

    if (!success) {
      res.status(404).json({
        data: null,
        error: { message: 'Review not found' },
      });
      return;
    }

    res.status(200).json({
      data: { success: true, message: 'Review soft deleted successfully' },
      error: null,
    });
  } catch (error) {
    next(error);
  }
}

export async function restoreReviewHandler(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        data: null,
        error: { message: 'Review ID is required' },
      });
      return;
    }

    const success = await restoreReview(id);

    if (!success) {
      res.status(404).json({
        data: null,
        error: { message: 'Review not found' },
      });
      return;
    }

    res.status(200).json({
      data: { success: true, message: 'Review restored successfully' },
      error: null,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateDealHandler(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = req.body as UpdateDealInput;
    const updatedDeal = await updateWeeklyDeal({
      title: input.title,
      description: input.description,
      price_text: input.price_text,
      valid_until: input.valid_until,
      is_active: input.is_active,
    });

    res.status(200).json({
      data: updatedDeal,
      error: null,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateMemberStatsHandler(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = req.body as UpdateMemberStatsInput;
    const updatedStats = await updateMembersStats(input.joined_count, input.display_boost);

    res.status(200).json({
      data: updatedStats,
      error: null,
    });
  } catch (error) {
    next(error);
  }
}
