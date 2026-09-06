import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Building2, CheckCircle2, XCircle, Users } from "lucide-react";
import { getAdminDashboardStatsThunk } from "../../redux/restaurant/restaurantThunk";
import DashboardStatCard from "../../components/ui/DashboardStatCard";

const Dashboard = () => {
  const dispatch = useDispatch();
  const { adminDashboard, loading, error } = useSelector(
    (state) => state.restaurant
  );

  const {
    stats = {
      pendingRestaurants: 0,
      approvedRestaurants: 0,
      rejectedRestaurants: 0,
      totalOwners: 0,
    },
    restaurantGraph = [],
    userGraph = [],
  } = adminDashboard;

  useEffect(() => {
    dispatch(getAdminDashboardStatsThunk());
  }, [dispatch]);

  const last7Days = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      days.push(`${year}-${month}-${day}`);
    }
    return days;
  }, []);

  const formattedRestaurantGraph = useMemo(() => {
    return last7Days.map((date) => {
      const existingData = restaurantGraph.find(
        (item) => item._id === date || item.date === date
      );
      return { date, count: existingData?.count || 0 };
    });
  }, [last7Days, restaurantGraph]);

  const formattedUserGraph = useMemo(() => {
    return last7Days.map((date) => {
      const existingData = userGraph.find(
        (item) => item._id === date || item.date === date
      );
      return { date, count: existingData?.count || 0 };
    });
  }, [last7Days, userGraph]);

  const formatDate = (date) =>
    new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

  return (
    <div className="space-y-8">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-black text-gray-900 sm:text-4xl">
          Admin Dashboard
        </h1>
        <p className="mt-2 text-gray-500">
          Manage restaurants and platform users.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard
          icon={Building2}
          label="Pending Restaurants"
          value={loading ? "..." : stats.pendingRestaurants}
          tone="orange"
          delay={0}
        />
        <DashboardStatCard
          icon={CheckCircle2}
          label="Approved Restaurants"
          value={loading ? "..." : stats.approvedRestaurants}
          tone="green"
          delay={80}
        />
        <DashboardStatCard
          icon={XCircle}
          label="Rejected Restaurants"
          value={loading ? "..." : stats.rejectedRestaurants}
          tone="red"
          delay={160}
        />
        <DashboardStatCard
          icon={Users}
          label="Total Owners"
          value={loading ? "..." : stats.totalOwners}
          tone="blue"
          delay={240}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div
          className="animate-fade-in-up rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6"
          style={{ animationDelay: "120ms" }}
        >
          <div className="mb-6">
            <h2 className="text-xl font-bold sm:text-2xl">New Restaurants</h2>
            <p className="text-sm text-gray-500">
              Restaurants created during the last 7 days
            </p>
          </div>
          <div className="h-72 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={formattedRestaurantGraph}>
                <defs>
                  <linearGradient id="restaurantGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tickFormatter={formatDate} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip labelFormatter={formatDate} formatter={(value) => [value, "Restaurants"]} />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#ec4899"
                  strokeWidth={3}
                  fill="url(#restaurantGradient)"
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
            <h2 className="text-xl font-bold sm:text-2xl">New Users</h2>
            <p className="text-sm text-gray-500">
              Users registered during the last 7 days
            </p>
          </div>
          <div className="h-72 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={formattedUserGraph}>
                <defs>
                  <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tickFormatter={formatDate} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip labelFormatter={formatDate} formatter={(value) => [value, "Users"]} />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#2563eb"
                  strokeWidth={3}
                  fill="url(#userGradient)"
                  dot={{ r: 4 }}
                  activeDot={{ r: 7 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div
        className="animate-fade-in-up rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6"
        style={{ animationDelay: "280ms" }}
      >
        <h2 className="mb-5 text-xl font-bold sm:text-2xl">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/admin/pending-restaurants"
            className="rounded-xl bg-pink-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-pink-700"
          >
            Pending Restaurants
          </Link>
          <Link
            to="/admin/restaurants"
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
          >
            All Restaurants
          </Link>
          <Link
            to="/admin/users"
            className="rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-green-700"
          >
            Manage Users
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
