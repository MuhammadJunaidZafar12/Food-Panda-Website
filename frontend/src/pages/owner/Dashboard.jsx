import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
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
  Store,
  Plus,
  Package,
  BarChart3,
  XCircle,
} from "lucide-react";
import { getAnalyticsDashboardThunk } from "../../redux/analytics/analyticsThunk";

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

  const cards = [
    {
      title: "Create Restaurant",
      description: "Add a new restaurant to the platform.",
      icon: Plus,
      path: "/owner/restaurants/create",
    },
    {
      title: "My Restaurants",
      description: "View and manage your restaurants.",
      icon: Store,
      path: "/owner/restaurants",
    },
    {
      title: "Products",
      description: "Manage restaurant menu and products.",
      icon: Package,
      path: "/owner/products",
    },
    {
      title: "Orders",
      description: "View customer orders.",
      icon: ShoppingBag,
      path: "/owner/orders",
    },
    {
      title: "Analytics",
      description: "Track restaurant performance.",
      icon: BarChart3,
      path: "/owner/dashboard/analytics",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Owner Dashboard</h1>
        <p className="mt-2 text-gray-500">
          Monitor your restaurants, orders, and revenue at a glance.
        </p>
      </div>

      {/* <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <Link
              key={card.title}
              to={card.path}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-100">
                <Icon size={28} className="text-pink-600" />
              </div>

              <h2 className="text-xl font-semibold text-gray-800">{card.title}</h2>
              <p className="mt-2 text-sm leading-6 text-gray-500">{card.description}</p>
            </Link>
          );
        })}
      </div> */}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
          {error}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl bg-white p-6 shadow">
          <ShoppingBag className="mb-3 text-blue-600" size={35} />
          <h2 className="text-3xl font-bold">{loading ? "..." : metrics.totalOrders || 0}</h2>
          <p className="text-gray-500">Orders this week</p>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow">
          <DollarSign className="mb-3 text-green-600" size={35} />
          <h2 className="text-3xl font-bold">
            {loading ? "..." : `Rs ${Number(metrics.totalRevenue || 0).toLocaleString()}`}
          </h2>
            <p className="text-gray-500">Delivered revenue this week</p>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow">
          <CheckCircle2 className="mb-3 text-emerald-600" size={35} />
          <h2 className="text-3xl font-bold">{loading ? "..." : metrics.completedOrders || 0}</h2>
          <p className="text-gray-500">Completed orders</p>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow">
          <Clock3 className="mb-3 text-amber-500" size={35} />
          <h2 className="text-3xl font-bold">
            {loading ? "..." : `${Number(metrics.completionRate || 0).toFixed(1)}%`}
          </h2>
          <p className="text-gray-500">Completion rate</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">Revenue Trend</h2>
            <p className="text-sm text-gray-500">Revenue during the last 7 days</p>
          </div>
          <div className="h-80">
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

        <div className="rounded-2xl bg-white p-6 shadow">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">Order Status</h2>
            <p className="text-sm text-gray-500">Orders grouped by their current status</p>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="status" angle={-20} textAnchor="end" height={60} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="orders" fill="#2563eb" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Top Products</h2>
          <p className="text-sm text-gray-500">Best-selling products during the last 7 days</p>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topProducts} layout="vertical" margin={{ left: 20, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="name" width={110} tickLine={false} axisLine={false} />
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