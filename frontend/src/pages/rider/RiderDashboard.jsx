import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Banknote,
  Bell,
  Bike,
  CheckCircle2,
  Package,
  RefreshCw,
  TrendingUp,
} from "lucide-react";

import {
  getMyDeliveriesThunk,
  getMyRiderStatsThunk,
  respondToAssignmentThunk,
} from "../../redux/rider/riderThunk";
import RiderOrderCard from "../../components/rider/RiderOrderCard";
import RejectDeliveryModal from "../../components/rider/RejectDeliveryModal";

const ACTIVE_STATUSES = [
  "accepted",
  "preparing",
  "ready",
  "picked_up",
  "out_for_delivery",
];

const StatCard = ({ icon: Icon, label, value, tone = "pink" }) => {
  const tones = {
    pink: "bg-pink-50 text-pink-600",
    amber: "bg-amber-50 text-amber-600",
    green: "bg-green-50 text-green-600",
    blue: "bg-blue-50 text-blue-600",
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-xs">
      <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${tones[tone]}`}>
        <Icon size={17} />
      </div>
      <p className="mt-3 text-2xl font-black text-gray-900">{value}</p>
      <p className="text-xs font-semibold text-gray-500">{label}</p>
    </div>
  );
};

const RiderDashboard = () => {
  const dispatch = useDispatch();

  const { deliveries, stats, loading, actionLoading } = useSelector(
    (state) => state.rider
  );

  const [rejectTarget, setRejectTarget] = useState(null);

  // One request covers both lists below, so they can never disagree.
  const refresh = useCallback(() => {
    dispatch(getMyDeliveriesThunk({ status: "all", limit: 50 }));
    dispatch(getMyRiderStatsThunk());
  }, [dispatch]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const newAssignments = useMemo(
    () => deliveries.filter((o) => o.riderStatus === "assigned"),
    [deliveries]
  );

  const activeDeliveries = useMemo(
    () =>
      deliveries.filter(
        (o) =>
          o.riderStatus === "accepted" && ACTIVE_STATUSES.includes(o.orderStatus)
      ),
    [deliveries]
  );

  const handleAccept = async (order) => {
    try {
      await dispatch(
        respondToAssignmentThunk({ orderId: order._id, action: "accept" })
      ).unwrap();
      refresh();
    } catch {
      // The error toast is handled by the rider layout.
    }
  };

  const handleReject = async (reason) => {
    if (!rejectTarget) return;

    try {
      await dispatch(
        respondToAssignmentThunk({
          orderId: rejectTarget._id,
          action: "reject",
          reason,
        })
      ).unwrap();
      refresh();
    } catch {
      // The error toast is handled by the rider layout.
    } finally {
      setRejectTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          icon={Bell}
          label="New assignments"
          value={stats?.newAssignments ?? 0}
          tone="amber"
        />
        <StatCard
          icon={Bike}
          label="Active deliveries"
          value={stats?.activeDeliveries ?? 0}
          tone="pink"
        />
        <StatCard
          icon={CheckCircle2}
          label="Delivered today"
          value={stats?.todayDeliveries ?? 0}
          tone="green"
        />
        <StatCard
          icon={TrendingUp}
          label="Total delivered"
          value={stats?.totalDeliveries ?? 0}
          tone="blue"
        />
      </div>

      {/* Earnings strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-xs">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
            <Banknote size={18} />
          </span>
          <div>
            <p className="text-xs font-semibold text-gray-500">
              Delivery fees earned
            </p>
            <p className="text-xl font-black text-gray-900">
              Rs. {(stats?.totalDeliveryFees ?? 0).toLocaleString()}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={refresh}
          className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold text-gray-600 transition hover:bg-gray-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* New assignments */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <Bell size={18} className="text-amber-500" />
            New Assignments
            {newAssignments.length > 0 && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">
                {newAssignments.length}
              </span>
            )}
          </h2>
        </div>

        {loading && deliveries.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-pink-600" />
          </div>
        ) : newAssignments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center">
            <Bell size={26} className="mx-auto text-gray-300" />
            <p className="mt-2 text-sm font-semibold text-gray-700">
              Nothing waiting for you
            </p>
            <p className="mt-1 text-xs text-gray-500">
              New deliveries show up here as soon as a restaurant assigns you one.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {newAssignments.map((order) => (
              <RiderOrderCard
                key={order._id}
                order={order}
                onAccept={handleAccept}
                onReject={setRejectTarget}
                actionLoading={actionLoading}
              />
            ))}
          </div>
        )}
      </section>

      {/* Active deliveries */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <Package size={18} className="text-pink-600" />
            In Progress
          </h2>

          <Link
            to="/rider/deliveries"
            className="text-xs font-bold text-pink-600 transition hover:text-pink-700"
          >
            View all deliveries
          </Link>
        </div>

        {activeDeliveries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center">
            <Bike size={26} className="mx-auto text-gray-300" />
            <p className="mt-2 text-sm font-semibold text-gray-700">
              No deliveries in progress
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Accept an assignment to start delivering.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {activeDeliveries.map((order) => (
              <RiderOrderCard key={order._id} order={order} />
            ))}
          </div>
        )}
      </section>

      <RejectDeliveryModal
        open={Boolean(rejectTarget)}
        order={rejectTarget}
        onClose={() => setRejectTarget(null)}
        onConfirm={handleReject}
        loading={actionLoading}
      />
    </div>
  );
};

export default RiderDashboard;
