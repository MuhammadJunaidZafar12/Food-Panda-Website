import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CheckCircle2,
  Clock3,
  DollarSign,
  ShoppingBag,
} from "lucide-react";
import { getAnalyticsDashboardThunk } from "../../redux/analytics/analyticsThunk";
import DashboardStatCard from "../../components/ui/DashboardStatCard";

const statusLabels = {
  pending: "Pending",
  accepted: "Accepted",
  preparing: "Preparing",
  ready: "Ready",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  rejected: "Rejected",
};

const Dashboard = () => {
  const dispatch = useDispatch();
  const { analytics, loading, error } = useSelector((state) => state.analytics);

  useEffect(() => {
    dispatch(getAnalyticsDashboardThunk("week"));
  }, [dispatch]);

  const metrics = analytics?.keyMetrics || {};
  const revenueTrend = (analytics?.dailyRevenueTrend || []).map((item) => ({
    ...item,
    revenue: Number(item.revenue) || 0,
  }));
  const statusTrend = Object.entries(analytics?.statusDistribution || {})
    .filter(([, count]) => count > 0)
    .map(([status, count]) => ({
      status: statusLabels[status] || status,
      orders: count,
    }));
  const topProducts = (analytics?.topProducts || []).slice(0, 5).map((item) => ({
    ...item,
    revenue: Number(item.revenue) || 0,
  }));

  return (
    <div className="space-y-8">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-black text-gray-900 sm:text-4xl">
          Owner Dashboard
        </h1>
        <p className="mt-2 text-gray-500">
          Monitor your restaurants, orders, and revenue at a glance.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard
          icon={ShoppingBag}
          label="Orders this week"
          value={loading ? "..." : metrics.totalOrders || 0}
          tone="blue"
          delay={0}
        />
        <DashboardStatCard
          icon={DollarSign}
          label="Delivered revenue this week"
          value={
            loading
              ? "..."
              : `Rs ${Number(metrics.totalRevenue || 0).toLocaleString()}`
          }
          tone="green"
          delay={80}
        />
        <DashboardStatCard
          icon={CheckCircle2}
          label="Completed orders"
          value={loading ? "..." : metrics.completedOrders || 0}
          tone="emerald"
          delay={160}
        />
        <DashboardStatCard
          icon={Clock3}
          label="Completion rate"
          value={
            loading
              ? "..."
              : `${Number(metrics.completionRate || 0).toFixed(1)}%`
          }
          tone="amber"
          delay={240}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div
          className="animate-fade-in-up rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6"
          style={{ animationDelay: "120ms" }}
        >
          <div className="mb-6">
            <h2 className="text-xl font-bold sm:text-2xl">Revenue Trend</h2>
            <p className="text-sm text-gray-500">Revenue during the last 7 days</p>
          </div>
          <div className="h-72 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrend}>
                <defs>
                  <linearGradient id="ownerRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip formatter={(value) => [`Rs ${value}`, "Revenue"]} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#ec4899"
                  strokeWidth={3}
                  fill="url(#ownerRevenueGradient)"
                  dot={{ r: 4 }}
                  activeDot={{ r: 7 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div
          className="animate-fade-in-up rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6"
          style={{ animationDelay: "200ms" }}
        >
          <div className="mb-6">
            <h2 className="text-xl font-bold sm:text-2xl">Order Status</h2>
            <p className="text-sm text-gray-500">Orders grouped by their current status</p>
          </div>
          <div className="h-72 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="status"
                  angle={-20}
                  textAnchor="end"
                  height={60}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="orders" fill="#2563eb" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div
        className="animate-fade-in-up rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6"
        style={{ animationDelay: "280ms" }}
      >
        <div className="mb-6">
          <h2 className="text-xl font-bold sm:text-2xl">Top Products</h2>
          <p className="text-sm text-gray-500">
            Best-selling products during the last 7 days
          </p>
        </div>
        <div className="h-72 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topProducts} layout="vertical" margin={{ left: 20, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tickLine={false} axisLine={false} />
              <YAxis
                type="category"
                dataKey="name"
                width={110}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip formatter={(value) => [`Rs ${value}`, "Revenue"]} />
              <Bar dataKey="revenue" fill="#f43f5e" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
