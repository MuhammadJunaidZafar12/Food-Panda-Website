import Order from "../models/order.model.js";
import Restaurant from "../models/restaurant.model.js";

// ═════════════════════════════════════════════════════════════════════
// GET OWNER ANALYTICS DASHBOARD
// ═════════════════════════════════════════════════════════════════════

export const getOwnerAnalyticsService = async (ownerId, timeRange = "7days") => {
  try {
    // Calculate date range
    const endDate = new Date();
    let startDate = new Date();

    switch (timeRange) {
      case "today":
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "week":
        startDate.setDate(endDate.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case "year":
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 7);
    }

    // Get owner's restaurants
    const restaurants = await Restaurant.find({ owner: ownerId }, "_id");
    const restaurantIds = restaurants.map((r) => r._id);

    // Get all orders for owner's restaurants in time range
    const orders = await Order.find({
      restaurant: { $in: restaurantIds },
      createdAt: { $gte: startDate, $lte: endDate },
    }).populate("restaurant", "_id name");

    // ═════════════════════════════════════════════════════════════════
    // KEY METRICS
    // ═════════════════════════════════════════════════════════════════

    const completedOrders = orders.filter(
      (o) => o.orderStatus === "delivered"
    ).length;

    const cancelledOrders = orders.filter(
      (o) => o.orderStatus === "cancelled" || o.orderStatus === "rejected"
    ).length;

    // Revenue belongs to successfully delivered orders only. The Order
    // model stores the final customer amount in `total`, not `totalAmount`.
    const deliveredOrders = orders.filter((o) => o.orderStatus === "delivered");
    const totalOrders = orders.length;
    const totalRevenue = deliveredOrders.reduce(
      (sum, order) => sum + Number(order.total || 0),
      0
    );

    const averageOrderValue =
      completedOrders > 0 ? totalRevenue / completedOrders : 0;

    // ═════════════════════════════════════════════════════════════════
    // ORDER STATUS DISTRIBUTION
    // ═════════════════════════════════════════════════════════════════

    const statusDistribution = {};
    const statusLabels = {
      pending: "Pending",
      accepted: "Accepted",
      preparing: "Preparing",
      ready: "Ready",
      out_for_delivery: "Out for Delivery",
      delivered: "Delivered",
      cancelled: "Cancelled",
      rejected: "Rejected",
    };

    Object.keys(statusLabels).forEach((status) => {
      statusDistribution[status] = orders.filter((o) => o.orderStatus === status).length;
    });

    // ═════════════════════════════════════════════════════════════════
    // REVENUE BY RESTAURANT
    // ═════════════════════════════════════════════════════════════════

    const revenueByRestaurant = {}; 
    deliveredOrders.forEach((order) => {
      const restaurantName = order.restaurant.name;
      if (!revenueByRestaurant[restaurantName]) {
        revenueByRestaurant[restaurantName] = 0;
      }
      revenueByRestaurant[restaurantName] += Number(order.total || 0);
    });

    const revenueChartData = Object.entries(revenueByRestaurant)
      .map(([name, revenue]) => ({
        name,
        revenue: revenue.toFixed(2),
      }))
      .sort((a, b) => b.revenue - a.revenue);

    // ═════════════════════════════════════════════════════════════════
    // DAILY REVENUE TREND (Last 7 or 30 days)
    // ═════════════════════════════════════════════════════════════════

    const dailyRevenue = {};
    const numDays = timeRange === "month" ? 30 : timeRange === "year" ? 365 : 7;

    for (let i = 0; i < numDays; i++) {
      const date = new Date(endDate);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      dailyRevenue[dateStr] = 0;
    }

    deliveredOrders.forEach((order) => {
      const dateStr = order.createdAt.toISOString().split("T")[0];
      if (dailyRevenue.hasOwnProperty(dateStr)) {
        dailyRevenue[dateStr] += Number(order.total || 0);
      }
    });

    const dailyRevenueData = Object.entries(dailyRevenue)
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([date, revenue]) => ({
        date: new Date(date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        revenue: revenue.toFixed(2),
      }));

    // ═════════════════════════════════════════════════════════════════
    // TOP PRODUCTS
    // ═════════════════════════════════════════════════════════════════

    const topProducts = {};
    deliveredOrders.forEach((order) => {
      order.items.forEach((item) => {
        const productName = item.name;
        if (!topProducts[productName]) {
          topProducts[productName] = { quantity: 0, revenue: 0 };
        }
        topProducts[productName].quantity += item.quantity;
        topProducts[productName].revenue += item.subtotal;
      });
    });

    const topProductsData = Object.entries(topProducts)
      .map(([name, data]) => ({
        name,
        quantity: data.quantity,
        revenue: data.revenue.toFixed(2),
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    // ═════════════════════════════════════════════════════════════════
    // PEAK ORDERING HOURS
    // ═════════════════════════════════════════════════════════════════

    const ordersByHour = {};
    for (let hour = 0; hour < 24; hour++) {
      ordersByHour[hour] = 0;
    }

    orders.forEach((order) => {
      const hour = order.createdAt.getHours();
      ordersByHour[hour]++;
    });

    const peakHourData = Object.entries(ordersByHour)
      .map(([hour, count]) => ({
        hour: `${String(hour).padStart(2, "0")}:00`,
        orders: count,
      }))
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 5);

    // ═════════════════════════════════════════════════════════════════
    // RESTAURANT PERFORMANCE
    // ═════════════════════════════════════════════════════════════════

    const restaurantPerformance = await Promise.all(
      restaurants.map(async (restaurant) => {
        const restaurantOrders = orders.filter(
          (o) => o.restaurant._id.toString() === restaurant._id.toString()
        );

        const totalOrdersForResto = restaurantOrders.length;
        const deliveredRestaurantOrders = restaurantOrders.filter(
          (o) => o.orderStatus === "delivered"
        );
        const totalRevenueForResto = deliveredRestaurantOrders.reduce(
          (sum, o) => sum + Number(o.total || 0),
          0
        );
        const deliveredOrdersForResto = restaurantOrders.filter(
          (o) => o.orderStatus === "delivered"
        ).length;
        const completionRate =
          totalOrdersForResto > 0
            ? ((deliveredOrdersForResto / totalOrdersForResto) * 100).toFixed(2)
            : 0;

        const restaurantInfo = await Restaurant.findById(restaurant._id);

        return {
          id: restaurant._id,
          name: restaurantInfo.name,
          orders: totalOrdersForResto,
          revenue: totalRevenueForResto.toFixed(2),
          completionRate: completionRate,
          rating: restaurantInfo.rating || 0,
        };
      })
    );

    // ═════════════════════════════════════════════════════════════════
    // RETURN ANALYTICS OBJECT
    // ═════════════════════════════════════════════════════════════════

    return {
      timeRange,
      startDate,
      endDate,
      keyMetrics: {
        totalOrders,
        totalRevenue: totalRevenue.toFixed(2),
        completedOrders,
        cancelledOrders,
        averageOrderValue: averageOrderValue.toFixed(2),
        completionRate:
          totalOrders > 0
            ? ((completedOrders / totalOrders) * 100).toFixed(2)
            : 0,
      },
      statusDistribution,
      revenueByRestaurant: revenueChartData,
      dailyRevenueTrend: dailyRevenueData,
      topProducts: topProductsData,
      peakHours: peakHourData,
      restaurantPerformance,
    };
  } catch (error) {
    throw new Error(`Analytics service error: ${error.message}`);
  }
};
