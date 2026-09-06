/**
 * TEMPORARY visual harness for the owner analytics page.
 * Renders Analytics against mock data so the layout can be eyeballed without a
 * backend or an owner login. Delete this file and preview.html when done.
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";

import Analytics from "./pages/owner/Analytics";
import "./index.css";

const mock = {
  keyMetrics: {
    totalOrders: 1284,
    totalRevenue: "1875430.00",
    completedOrders: 1163,
    cancelledOrders: 74,
    averageOrderValue: "1612.60",
    completionRate: "90.58",
  },
  statusDistribution: {
    pending: 21,
    accepted: 14,
    preparing: 9,
    ready: 3,
    out_for_delivery: 0,
    delivered: 1163,
    cancelled: 74,
    rejected: 12,
  },
  revenueByRestaurant: [
    { name: "Spice Route", revenue: "742300.00" },
    { name: "Burger Barn", revenue: "531200.00" },
    { name: "Karachi Broast House", revenue: "398640.00" },
    { name: "Cafe Aylanto", revenue: "203290.00" },
  ],
  dailyRevenueTrend: [
    { date: "Aug 30", revenue: "182400.00" },
    { date: "Aug 31", revenue: "241300.00" },
    { date: "Sep 1", revenue: "198750.00" },
    { date: "Sep 2", revenue: "312900.00" },
    { date: "Sep 3", revenue: "287100.00" },
    { date: "Sep 4", revenue: "349880.00" },
    { date: "Sep 5", revenue: "303100.00" },
  ],
  topProducts: [
    { name: "Chicken Tikka Pizza", quantity: 312, revenue: "436800.00" },
    { name: "Zinger Burger", quantity: 268, revenue: "201000.00" },
    { name: "Beef Seekh Kebab Platter", quantity: 191, revenue: "286500.00" },
    { name: "Chicken Karahi (Full)", quantity: 143, revenue: "321750.00" },
    { name: "Loaded Fries", quantity: 128, revenue: "51200.00" },
    { name: "Cold Coffee", quantity: 96, revenue: "28800.00" },
  ],
  peakHours: [
    { hour: "20:00", orders: 214 },
    { hour: "21:00", orders: 198 },
    { hour: "19:00", orders: 167 },
    { hour: "13:00", orders: 142 },
    { hour: "22:00", orders: 118 },
  ],
  restaurantPerformance: [
    { id: "1", name: "Spice Route", orders: 512, revenue: "742300.00", completionRate: "94.30", rating: 4.6 },
    { id: "2", name: "Burger Barn", orders: 401, revenue: "531200.00", completionRate: "88.10", rating: 4.2 },
    { id: "3", name: "Karachi Broast House", orders: 248, revenue: "398640.00", completionRate: "67.40", rating: 3.8 },
    { id: "4", name: "Cafe Aylanto", orders: 123, revenue: "203290.00", completionRate: "91.90", rating: 4.7 },
  ],
};

const store = configureStore({
  reducer: () => ({
    analytics: { analytics: mock, loading: false, timeRange: "week" },
  }),
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
        <div className="mx-auto max-w-7xl">
          <Analytics />
        </div>
      </div>
    </Provider>
  </StrictMode>
);
