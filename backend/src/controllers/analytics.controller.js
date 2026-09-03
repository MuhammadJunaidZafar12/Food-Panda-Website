import { getOwnerAnalyticsService } from "../services/analytics.service.js";

export const getOwnerAnalyticsDashboard = async (req, res, next) => {
  try {
    const ownerId = req.user.id;
    const { timeRange = "7days" } = req.query;

    const analytics = await getOwnerAnalyticsService(ownerId, timeRange);

    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
};
