import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Pagination from "@mui/material/Pagination";
import { Package, RefreshCw } from "lucide-react";

import {
  getMyDeliveriesThunk,
  getMyRiderStatsThunk,
  respondToAssignmentThunk,
} from "../../redux/rider/riderThunk";
import RiderOrderCard from "../../components/rider/RiderOrderCard";
import RejectDeliveryModal from "../../components/rider/RejectDeliveryModal";

const tabs = [
  { id: "new", label: "New" },
  { id: "active", label: "In Progress" },
  { id: "completed", label: "Delivered" },
  { id: "all", label: "All" },
];

const emptyMessages = {
  new: "No new assignments waiting for you.",
  active: "You have no deliveries in progress.",
  completed: "You haven't completed any deliveries yet.",
  all: "No deliveries have been assigned to you yet.",
};

const RiderOrders = () => {
  const dispatch = useDispatch();

  const { deliveries, pagination, loading, actionLoading } = useSelector(
    (state) => state.rider
  );

  const [status, setStatus] = useState("active");
  const [page, setPage] = useState(1);
  const [rejectTarget, setRejectTarget] = useState(null);

  const load = useCallback(() => {
    dispatch(getMyDeliveriesThunk({ status, page, limit: 8 }));
  }, [dispatch, status, page]);

  useEffect(() => {
    load();
  }, [load]);

  const handleTabChange = (next) => {
    setStatus(next);
    setPage(1);
  };

  const handleAccept = async (order) => {
    try {
      await dispatch(
        respondToAssignmentThunk({ orderId: order._id, action: "accept" })
      ).unwrap();
      load();
      dispatch(getMyRiderStatsThunk());
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
      load();
      dispatch(getMyRiderStatsThunk());
    } catch {
      // The error toast is handled by the rider layout.
    } finally {
      setRejectTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900">
            My Deliveries
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Everything assigned to you, past and present.
          </p>
        </div>

        <button
          type="button"
          onClick={load}
          className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-600 transition hover:bg-gray-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 overflow-x-auto border-b border-gray-200 pb-px">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleTabChange(tab.id)}
            className={`whitespace-nowrap border-b-2 px-1 pb-3 text-xs font-bold uppercase tracking-wider transition ${
              status === tab.id
                ? "border-pink-600 text-pink-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading && deliveries.length === 0 ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-44 animate-pulse rounded-2xl border border-gray-100 bg-white"
            />
          ))}
        </div>
      ) : deliveries.length === 0 ? (
        <div className="rounded-3xl border border-gray-100 bg-white p-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 text-gray-400">
            <Package size={26} />
          </div>
          <h3 className="mt-4 text-lg font-bold text-gray-900">
            Nothing here yet
          </h3>
          <p className="mx-auto mt-1 max-w-xs text-sm text-gray-500">
            {emptyMessages[status]}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {deliveries.map((order) => (
              <RiderOrderCard
                key={order._id}
                order={order}
                onAccept={handleAccept}
                onReject={setRejectTarget}
                actionLoading={actionLoading}
              />
            ))}
          </div>

          {pagination && pagination.pages > 1 && (
            <div className="flex justify-center pt-2">
              <Pagination
                count={pagination.pages}
                page={page}
                onChange={(event, value) => setPage(value)}
                color="primary"
                sx={{
                  "& .Mui-selected": {
                    backgroundColor: "#e21b70 !important",
                    color: "white",
                  },
                }}
              />
            </div>
          )}
        </>
      )}

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

export default RiderOrders;
