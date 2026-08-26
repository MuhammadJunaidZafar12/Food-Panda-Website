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

const Dashboard = () => {
  const dispatch = useDispatch();

  const { adminDashboard, loading, error } = useSelector(
    (state) => state.restaurant,
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

  // ==========================================
  // FETCH DASHBOARD DATA
  // ==========================================

  useEffect(() => {
    dispatch(getAdminDashboardStatsThunk());
  }, [dispatch]);

  // ==========================================
  // CREATE LAST 7 DAYS
  // ==========================================

  const last7Days = useMemo(() => {
    const days = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();

      date.setDate(date.getDate() - i);

      const year = date.getFullYear();

      const month = String(date.getMonth() + 1).padStart(2, "0");

      const day = String(date.getDate()).padStart(2, "0");

      const dateString = `${year}-${month}-${day}`;

      days.push(dateString);
    }

    return days;
  }, []);

  // ==========================================
  // RESTAURANT GRAPH
  // ==========================================

  const formattedRestaurantGraph = useMemo(() => {
    return last7Days.map((date) => {
      const existingData = restaurantGraph.find(
        (item) => item._id === date || item.date === date,
      );

      return {
        date,
        count: existingData?.count || 0,
      };
    });
  }, [last7Days, restaurantGraph]);

  // ==========================================
  // USER GRAPH
  // ==========================================

  const formattedUserGraph = useMemo(() => {
    return last7Days.map((date) => {
      const existingData = userGraph.find(
        (item) => item._id === date || item.date === date,
      );

      return {
        date,
        count: existingData?.count || 0,
      };
    });
  }, [last7Days, userGraph]);

  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (date) => {
    return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-8">
      {/* ====================================== */}
      {/* HEADER */}
      {/* ====================================== */}

      <div>
        <h1 className="text-4xl font-bold">Admin Dashboard</h1>

        <p className="mt-2 text-gray-500">
          Manage restaurants and platform users.
        </p>
      </div>

      {/* ====================================== */}
      {/* ERROR */}
      {/* ====================================== */}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
          {error}
        </div>
      )}

      {/* ====================================== */}
      {/* STATS */}
      {/* ====================================== */}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {/* Pending Restaurants */}

        <div className="rounded-2xl bg-white p-6 shadow">
          <Building2 className="mb-3 text-orange-500" size={35} />

          <h2 className="text-3xl font-bold">
            {loading ? "..." : stats.pendingRestaurants}
          </h2>

          <p className="text-gray-500">Pending Restaurants</p>
        </div>

        {/* Approved Restaurants */}

        <div className="rounded-2xl bg-white p-6 shadow">
          <CheckCircle2 className="mb-3 text-green-600" size={35} />

          <h2 className="text-3xl font-bold">
            {loading ? "..." : stats.approvedRestaurants}
          </h2>

          <p className="text-gray-500">Approved Restaurants</p>
        </div>

        {/* Rejected Restaurants */}

        <div className="rounded-2xl bg-white p-6 shadow">
          <XCircle className="mb-3 text-red-500" size={35} />

          <h2 className="text-3xl font-bold">
            {loading ? "..." : stats.rejectedRestaurants}
          </h2>

          <p className="text-gray-500">Rejected Restaurants</p>
        </div>

        {/* Owners */}

        <div className="rounded-2xl bg-white p-6 shadow">
          <Users className="mb-3 text-blue-600" size={35} />

          <h2 className="text-3xl font-bold">
            {loading ? "..." : stats.totalOwners}
          </h2>

          <p className="text-gray-500">Total Owners</p>
        </div>
      </div>

      {/* ====================================== */}
      {/* GRAPHS */}
      {/* ====================================== */}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ==================================== */}
        {/* RESTAURANT GRAPH */}
        {/* ==================================== */}

        <div className="rounded-2xl bg-white p-6 shadow">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">New Restaurants</h2>

            <p className="text-sm text-gray-500">
              Restaurants created during the last 7 days
            </p>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={formattedRestaurantGraph}>
                <defs>
                  <linearGradient
                    id="restaurantGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.4} />

                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" vertical={false} />

                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  tickLine={false}
                  axisLine={false}
                />

                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                />

                <Tooltip
                  labelFormatter={formatDate}
                  formatter={(value) => [value, "Restaurants"]}
                />

                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#ec4899"
                  strokeWidth={3}
                  fill="url(#restaurantGradient)"
                  dot={{
                    r: 4,
                  }}
                  activeDot={{
                    r: 7,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ==================================== */}
        {/* USER GRAPH */}
        {/* ==================================== */}

        <div className="rounded-2xl bg-white p-6 shadow">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">New Users</h2>

            <p className="text-sm text-gray-500">
              Users registered during the last 7 days
            </p>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={formattedUserGraph}>
                <defs>
                  <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />

                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" vertical={false} />

                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  tickLine={false}
                  axisLine={false}
                />

                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                />

                <Tooltip
                  labelFormatter={formatDate}
                  formatter={(value) => [value, "Users"]}
                />

                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#2563eb"
                  strokeWidth={3}
                  fill="url(#userGradient)"
                  dot={{
                    r: 4,
                  }}
                  activeDot={{
                    r: 7,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ====================================== */}
      {/* QUICK ACTIONS */}
      {/* ====================================== */}

      <div className="rounded-2xl bg-white p-6 shadow">
        <h2 className="mb-5 text-2xl font-bold">Quick Actions</h2>

        <div className="flex flex-wrap gap-4">
          <Link
            to="/admin/pending-restaurants"
            className="rounded-lg bg-pink-600 px-6 py-3 text-white"
          >
            Pending Restaurants
          </Link>

          <Link
            to="/admin/restaurants"
            className="rounded-lg bg-blue-600 px-6 py-3 text-white"
          >
            All Restaurants
          </Link>

          <Link
            to="/admin/users"
            className="rounded-lg bg-green-600 px-6 py-3 text-white"
          >
            Manage Users
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
