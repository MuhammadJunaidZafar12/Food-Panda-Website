import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Filter,
} from "lucide-react";
import { getAnalyticsDashboardThunk } from "../../redux/analytics/analyticsThunk";
import { setTimeRange } from "../../redux/analytics/analyticsSlice";

const COLORS = ["#ec4899", "#f43f5e", "#fbbf24", "#34d399", "#60a5fa", "#a78bfa"];

const Analytics = () => {
  const dispatch = useDispatch();
  const { analytics, loading, timeRange } = useSelector(
    (state) => state.analytics
  );
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);

  useEffect(() => {
    dispatch(getAnalyticsDashboardThunk(selectedTimeRange));
  }, [dispatch, selectedTimeRange]);

  const handleTimeRangeChange = (range) => {
    setSelectedTimeRange(range);
    dispatch(setTimeRange(range));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-pink-200 border-t-pink-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">No analytics data available</p>
      </div>
    );
  }

  const {
    keyMetrics,
    statusDistribution,
    revenueByRestaurant,
    dailyRevenueTrend,
    topProducts,
    peakHours,
    restaurantPerformance,
  } = analytics;

  // Status distribution for pie chart
  const statusChartData = Object.entries(statusDistribution)
    .map(([status, count]) => ({ name: status, value: count }))
    .filter((item) => item.value > 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-3xl bg-linear-to-r from-pink-600 to-rose-500 p-8 text-white shadow-lg">
        <h1 className="text-3xl font-semibold">Analytics Dashboard</h1>
        <p className="mt-2 text-pink-50">
          Track your restaurant performance and business metrics
        </p>
      </div>

      {/* Time Range Selector */}
      <div className="flex flex-wrap gap-3">
        {[
          { value: "today", label: "Today" },
          { value: "week", label: "This Week" },
          { value: "month", label: "This Month" },
          { value: "year", label: "This Year" },
        ].map((range) => (
          <button
            key={range.value}
            onClick={() => handleTimeRangeChange(range.value)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-all ${
              selectedTimeRange === range.value
                ? "bg-pink-600 text-white shadow-lg"
                : "bg-white text-gray-700 border border-gray-300 hover:border-pink-600"
            }`}
          >
            <Filter size={18} />
            {range.label}
          </button>
        ))}
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {/* Total Orders */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {keyMetrics.totalOrders}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <Package size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                Rs {parseFloat(keyMetrics.totalRevenue).toLocaleString()}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <DollarSign size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        {/* Completed Orders */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {keyMetrics.completedOrders}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100">
              <CheckCircle size={24} className="text-emerald-600" />
            </div>
          </div>
        </div>

        {/* Cancelled Orders */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cancelled</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {keyMetrics.cancelledOrders}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
              <XCircle size={24} className="text-red-600" />
            </div>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                Rs {parseFloat(keyMetrics.averageOrderValue).toFixed(0)}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
              <TrendingUp size={24} className="text-purple-600" />
            </div>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {parseFloat(keyMetrics.completionRate).toFixed(1)}%
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100">
              <Clock size={24} className="text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Daily Revenue Trend */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Daily Revenue Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyRevenueTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip formatter={(value) => `Rs ${value}`} />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#ec4899"
                strokeWidth={2}
                dot={{ fill: "#ec4899", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Order Status Distribution */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Order Status Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {statusChartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue by Restaurant */}
      {revenueByRestaurant.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Revenue by Restaurant
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueByRestaurant}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip formatter={(value) => `Rs ${value}`} />
              <Bar dataKey="revenue" fill="#ec4899" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Peak Ordering Hours */}
      {peakHours.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Peak Ordering Hours
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={peakHours}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="orders" fill="#f43f5e" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top Products */}
      {topProducts.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Top Products
          </h3>
          <div className="space-y-3">
            {topProducts.slice(0, 10).map((product, index) => (
              <div
                key={index}
                className="flex items-center justify-between border-b border-gray-200 pb-3 last:border-0"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-100 text-sm font-bold text-pink-600">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">
                      {product.quantity} units sold
                    </p>
                  </div>
                </div>
                <p className="font-semibold text-gray-900">
                  Rs {parseFloat(product.revenue).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Restaurant Performance Table */}
      {restaurantPerformance.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Restaurant Performance
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Restaurant
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Orders
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Completion Rate
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Rating
                  </th>
                </tr>
              </thead>
              <tbody>
                {restaurantPerformance.map((restaurant) => (
                  <tr
                    key={restaurant.id}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {restaurant.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {restaurant.orders}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      Rs {parseFloat(restaurant.revenue).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                          parseFloat(restaurant.completionRate) >= 90
                            ? "bg-green-100 text-green-700"
                            : parseFloat(restaurant.completionRate) >= 70
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {parseFloat(restaurant.completionRate).toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      ⭐ {parseFloat(restaurant.rating).toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
