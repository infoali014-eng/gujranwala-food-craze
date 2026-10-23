import { Request, Response, NextFunction } from 'express';
import { findCurrentDeal } from '../queries/deals.queries';
import { getMembersStats } from '../queries/members.queries';
import { logCtaClick } from '../queries/clicks.queries';
import { TrackClickInput } from '../validators/track.schema';

export async function getCurrentDealHandler(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const deal = await findCurrentDeal();

    res.status(200).json({
      data: deal,
      error: null,
    });
  } catch (error) {
    next(error);
  }
}

export async function getMembersStatsHandler(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const stats = await getMembersStats();

    res.status(200).json({
      data: stats,
      error: null,
    });
  } catch (error) {
    next(error);
  }
}

export async function trackClickHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = req.body as TrackClickInput;
    await logCtaClick({
      source: input.source,
      button: input.button,
    });

    res.status(200).json({
      data: { logged: true },
      error: null,
    });
  } catch (error) {
    next(error);
  }
}
