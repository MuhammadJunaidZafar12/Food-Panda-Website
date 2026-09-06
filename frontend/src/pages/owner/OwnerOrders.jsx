import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getMyRestaurantsThunk } from "../../redux/restaurant/restaurantThunk";
import {
  getRestaurantOrdersThunk,
  updateOrderStatusThunk,
  getOrderStatsThunk,
  assignRiderThunk,
} from "../../redux/order/orderThunk";
import { clearOrderSuccess, clearOrderError } from "../../redux/order/orderSlice";
import OrderStatusBadge from "../../components/order/OrderStatusBadge";
import OrderItemRow from "../../components/order/OrderItemRow";
import AssignRiderModal from "../../components/order/AssignRiderModal";
import RiderInfoCard from "../../components/order/RiderInfoCard";
import {
  ShoppingBag,
  TrendingUp,
  Clock,
  DollarSign,
  X,
  Eye,
  Utensils,
  User,
  MapPin,
  Phone,
  Bike,
  UserPlus,
} from "lucide-react";
import toast from "react-hot-toast";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Pagination from "@mui/material/Pagination";

// A rider can only be handed an order the kitchen has already taken on.
const ASSIGNABLE_STATUSES = ["accepted", "preparing", "ready"];

const riderStatusChips = {
  assigned: { label: "Awaiting reply", className: "bg-amber-50 text-amber-700" },
  accepted: { label: "Accepted", className: "bg-green-50 text-green-700" },
  rejected: { label: "Declined", className: "bg-red-50 text-red-600" },
};

const OwnerOrdersPage = () => {
  const dispatch = useDispatch();

  const { restaurants = [], loading: restaurantLoading } = useSelector(
    (state) => state.restaurant
  );
  const {
    orders = [],
    pagination,
    stats,
    loading: ordersLoading,
    statusUpdateLoading,
    assignLoading,
    success: orderSuccess,
    error: orderError,
  } = useSelector((state) => state.order);

  const [chosenRestaurantId, setChosenRestaurantId] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  // The owner's first restaurant is used until they pick another one.
  const selectedRestaurantId = chosenRestaurantId || restaurants[0]?._id || "";

  // For Detail modal — only the id is kept, so the modal always reads the
  // freshest copy of the order from the list.
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [openDetailModal, setOpenDetailModal] = useState(false);

  const selectedOrder = selectedOrderId
    ? orders.find((order) => order._id === selectedOrderId) || null
    : null;

  // For Assign rider modal
  const [assignTarget, setAssignTarget] = useState(null);

  // Fetch owner's restaurants on mount
  useEffect(() => {
    dispatch(getMyRestaurantsThunk());
  }, [dispatch]);

  // Fetch orders and stats when selected restaurant, status filter, or page changes
  useEffect(() => {
    if (selectedRestaurantId) {
      dispatch(
        getRestaurantOrdersThunk({
          restaurantId: selectedRestaurantId,
          params: {
            status: statusFilter,
            page,
            limit: 8,
          },
        })
      );
      dispatch(getOrderStatsThunk()); // stats are owner-wide or aggregated automatically
    }
  }, [dispatch, selectedRestaurantId, statusFilter, page]);

  // Handle successes & errors
  useEffect(() => {
    if (orderSuccess) {
      toast.success("Order updated successfully!");
      dispatch(clearOrderSuccess());
      // Refresh current orders list
      if (selectedRestaurantId) {
        dispatch(
          getRestaurantOrdersThunk({
            restaurantId: selectedRestaurantId,
            params: {
              status: statusFilter,
              page,
              limit: 8,
            },
          })
        );
        dispatch(getOrderStatsThunk());
      }
      // The open detail modal picks up the refreshed order on its own.
    }
  }, [orderSuccess, dispatch, selectedRestaurantId, statusFilter, page]);

  useEffect(() => {
    if (orderError) {
      toast.error(orderError);
      dispatch(clearOrderError());
    }
  }, [orderError, dispatch]);

  const handleRestaurantChange = (e) => {
    setChosenRestaurantId(e.target.value);
    setPage(1);
  };

  const handleStatusTabChange = (status) => {
    setStatusFilter(status);
    setPage(1);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleUpdateStatus = (orderId, newStatus, note = "") => {
    dispatch(updateOrderStatusThunk({ orderId, status: newStatus, note }));
  };

  const handleViewDetails = (order) => {
    setSelectedOrderId(order._id);
    setOpenDetailModal(true);
  };

  const handleAssignRider = async (riderId) => {
    if (!assignTarget) return;

    try {
      // The success toast and the list refresh are handled by the effect above.
      await dispatch(
        assignRiderThunk({ orderId: assignTarget._id, riderId })
      ).unwrap();
      setAssignTarget(null);
    } catch {
      // Keep the modal open on failure so another rider can be picked; the
      // error toast comes from the effect watching `orderError`.
    }
  };

  const getNextStatuses = (currentStatus) => {
    switch (currentStatus) {
      case "pending":
        return [
          { status: "accepted", label: "Accept Order" },
          { status: "rejected", label: "Reject" },
          { status: "cancelled", label: "Cancel" },
        ];
      case "accepted":
        return [
          { status: "preparing", label: "Start Preparing" },
          { status: "cancelled", label: "Cancel Order" },
        ];
      case "preparing":
        return [{ status: "ready", label: "Mark as Ready" }];
      case "ready":
        return [
          { status: "picked_up", label: "Handed to Rider" },
          { status: "out_for_delivery", label: "Send Out for Delivery" },
        ];
      case "picked_up":
        return [{ status: "out_for_delivery", label: "Send Out for Delivery" }];
      case "out_for_delivery":
        return [{ status: "delivered", label: "Mark as Delivered" }];
      default:
        return [];
    }
  };

  const tabs = [
    { id: "all", label: "All" },
    { id: "pending", label: "Pending" },
    { id: "accepted", label: "Accepted" },
    { id: "preparing", label: "Preparing" },
    { id: "ready", label: "Ready" },
    { id: "picked_up", label: "Picked Up" },
    { id: "out_for_delivery", label: "Out" },
    { id: "delivered", label: "Delivered" },
    { id: "cancelled", label: "Cancelled" },
    { id: "rejected", label: "Rejected" },
  ];

  const selectedRestaurant = restaurants.find((r) => r._id === selectedRestaurantId);

  // The orders list populates the restaurant with name + logo only, so the
  // owner's own restaurant record is used to give AssignRiderModal the
  // coordinates it needs to show how far each rider is from the kitchen.
  const assignOrder = assignTarget
    ? {
        ...assignTarget,
        restaurant: assignTarget.restaurant?.location
          ? assignTarget.restaurant
          : { ...assignTarget.restaurant, location: selectedRestaurant?.location },
      }
    : null;

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Top Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Orders Manager
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage incoming orders and update preparation status.
          </p>
        </div>

        {/* Restaurant Selector */}
        {restaurants.length > 0 && (
          <div className="w-full md:w-72">
            <FormControl fullWidth size="small">
              <InputLabel id="restaurant-select-label">Select Restaurant</InputLabel>
              <Select
                labelId="restaurant-select-label"
                value={selectedRestaurantId}
                label="Select Restaurant"
                onChange={handleRestaurantChange}
                sx={{ borderRadius: "14px" }}
              >
                {restaurants.map((res) => (
                  <MenuItem key={res._id} value={res._id}>
                    {res.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 bg-pink-50 text-pink-600 rounded-xl flex items-center justify-center shrink-0">
              <ShoppingBag size={22} />
            </div>
            <div>
              <span className="text-xs text-gray-400 block font-bold uppercase tracking-wider">
                Total Orders
              </span>
              <span className="text-xl font-extrabold text-gray-900">
                {stats.totalOrders}
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
              <Clock size={22} />
            </div>
            <div>
              <span className="text-xs text-gray-400 block font-bold uppercase tracking-wider">
                Pending Orders
              </span>
              <span className="text-xl font-extrabold text-gray-900">
                {stats.pendingOrders}
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shrink-0">
              <TrendingUp size={22} />
            </div>
            <div>
              <span className="text-xs text-gray-400 block font-bold uppercase tracking-wider">
                Active Orders
              </span>
              <span className="text-xl font-extrabold text-gray-900">
                {stats.activeOrders}
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center shrink-0">
              <DollarSign size={22} />
            </div>
            <div>
              <span className="text-xs text-gray-400 block font-bold uppercase tracking-wider">
                Total Revenue
              </span>
              <span className="text-xl font-extrabold text-gray-900">
                Rs. {stats.totalRevenue.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto pb-px gap-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleStatusTabChange(tab.id)}
            className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition whitespace-nowrap px-1 cursor-pointer ${
              statusFilter === tab.id
                ? "border-pink-600 text-pink-600"
                : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      {restaurantLoading || (ordersLoading && orders.length === 0) ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-24 bg-white rounded-2xl border border-gray-100 animate-pulse"
            />
          ))}
        </div>
      ) : !selectedRestaurantId ? (
        <div className="text-center py-16 bg-white border border-gray-100 rounded-3xl p-8 space-y-6">
          <div className="w-16 h-16 bg-pink-50 text-pink-500 rounded-full flex items-center justify-center mx-auto">
            <Utensils size={28} />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-gray-900">No restaurants found</h3>
            <p className="text-sm text-gray-500 max-w-xs mx-auto">
              Please create a restaurant before viewing orders.
            </p>
          </div>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-100 rounded-3xl p-8 space-y-6">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mx-auto">
            <ShoppingBag size={28} />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-gray-900">No orders found</h3>
            <p className="text-sm text-gray-500 max-w-xs mx-auto">
              There are no orders here right now.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Table / List View */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              {/* min-width keeps the seven columns readable on phones — the
                  wrapper scrolls instead of squashing them. */}
              <table className="w-full min-w-[960px] text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold uppercase tracking-wider text-gray-400">
                    <th className="py-4 px-6">Order ID</th>
                    <th className="py-4 px-6">Customer</th>
                    <th className="py-4 px-6">Items</th>
                    <th className="py-4 px-6">Total Amount</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6">Rider</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                  {orders.map((order) => {
                    const nextActions = getNextStatuses(order.orderStatus);
                    const canAssign = ASSIGNABLE_STATUSES.includes(
                      order.orderStatus
                    );
                    const riderChip = riderStatusChips[order.riderStatus];

                    return (
                      <tr key={order._id} className="hover:bg-gray-50/50 transition">
                        <td className="py-4 px-6">
                          <span className="font-mono font-bold text-gray-900 block">
                            {order.orderNumber}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {new Date(order.createdAt).toLocaleString()}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-semibold text-gray-900">
                            {order.user?.name}
                          </div>
                          <div className="text-xs text-gray-400 font-mono mt-0.5">
                            {order.phone}
                          </div>
                        </td>
                        <td className="py-4 px-6 max-w-xs truncate">
                          {order.items
                            .map((i) => `${i.quantity}x ${i.name}`)
                            .join(", ")}
                        </td>
                        <td className="py-4 px-6 font-bold text-gray-900">
                          Rs. {order.total.toLocaleString()}
                        </td>
                        <td className="py-4 px-6">
                          <OrderStatusBadge status={order.orderStatus} />
                        </td>

                        {/* Assigned rider */}
                        <td className="py-4 px-6">
                          {order.assignedRider ? (
                            <div className="space-y-1">
                              <span className="font-semibold text-gray-900 flex items-center gap-1.5">
                                <Bike size={13} className="text-pink-600" />
                                {order.assignedRider.name}
                              </span>
                              <span className="text-[10px] text-gray-400 block capitalize">
                                {order.assignedRider.vehicleType}
                                {order.assignedRider.vehicleNumber
                                  ? ` • ${order.assignedRider.vehicleNumber}`
                                  : ""}
                              </span>
                              {riderChip && (
                                <span
                                  className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${riderChip.className}`}
                                >
                                  {riderChip.label}
                                </span>
                              )}
                            </div>
                          ) : order.riderStatus === "rejected" ? (
                            <span className="inline-block rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-600">
                              Declined — reassign
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">
                              Not assigned
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                          {/* Details View Button */}
                          <button
                            onClick={() => handleViewDetails(order)}
                            className="p-2 bg-gray-50 text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-xl transition cursor-pointer"
                            title="View Order Details"
                          >
                            <Eye size={16} />
                          </button>

                          {/* Assign / reassign a delivery rider */}
                          {canAssign && (
                            <button
                              onClick={() => setAssignTarget(order)}
                              className="px-3 py-2 text-xs font-bold rounded-xl transition cursor-pointer bg-gray-900 text-white hover:bg-gray-800 inline-flex items-center gap-1.5"
                              title="Assign a delivery rider"
                            >
                              <UserPlus size={13} />
                              {order.assignedRider ? "Reassign" : "Assign Rider"}
                            </button>
                          )}

                          {/* Quick Workflow Action Button */}
                          {nextActions.map((act) => {
                            const isNegative =
                              act.status === "cancelled" ||
                              act.status === "rejected";

                            return (
                              <button
                                key={act.status}
                                disabled={statusUpdateLoading}
                                onClick={() =>
                                  handleUpdateStatus(
                                    order._id,
                                    act.status,
                                    act.status === "cancelled"
                                      ? "Cancelled by restaurant owner"
                                      : act.status === "rejected"
                                      ? "Rejected by restaurant"
                                      : undefined
                                  )
                                }
                                className={`px-3 py-2 text-xs font-bold rounded-xl transition cursor-pointer disabled:opacity-50 ${
                                  isNegative
                                    ? "bg-red-50 text-red-600 hover:bg-red-100"
                                    : "bg-pink-600 text-white hover:bg-pink-700 shadow-sm"
                                }`}
                              >
                                {act.label}
                              </button>
                            );
                          })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex justify-center pt-4">
              <Pagination
                count={pagination.pages}
                page={page}
                onChange={handlePageChange}
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
        </div>
      )}

      {/* Details View Modal */}
      <Dialog
        open={openDetailModal && Boolean(selectedOrder)}
        onClose={() => setOpenDetailModal(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: "24px" },
        }}
      >
        {selectedOrder && (
          <>
            <DialogTitle className="font-bold text-gray-900 border-b border-gray-100 flex items-center justify-between p-6">
              <div>
                <span className="text-xs text-gray-400 block font-mono">
                  ORDER ID
                </span>
                <span className="font-mono text-xl">{selectedOrder.orderNumber}</span>
              </div>
              <button
                onClick={() => setOpenDetailModal(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X size={18} />
              </button>
            </DialogTitle>

            <DialogContent className="p-6 space-y-6 divide-y divide-gray-100">
              {/* Customer Details */}
              <div className="space-y-4 pt-0">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">
                  Customer & Delivery Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
                  <div className="flex gap-2">
                    <User size={16} className="text-gray-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold block text-gray-900">
                        {selectedOrder.user?.name}
                      </span>
                      <span className="text-xs text-gray-400">
                        {selectedOrder.user?.email}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Phone size={16} className="text-gray-400 shrink-0 mt-0.5" />
                    <span>{selectedOrder.phone}</span>
                  </div>
                  <div className="flex gap-2">
                    <MapPin size={16} className="text-gray-400 shrink-0 mt-0.5" />
                    <span>{selectedOrder.deliveryAddress}</span>
                  </div>
                </div>
                {selectedOrder.notes && (
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 mt-2 text-xs">
                    <span className="font-bold text-gray-800">Special Notes:</span>{" "}
                    {selectedOrder.notes}
                  </div>
                )}
              </div>

              {/* Delivery rider */}
              <div className="space-y-4 pt-6">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">
                    Delivery Rider
                  </h3>

                  {ASSIGNABLE_STATUSES.includes(selectedOrder.orderStatus) && (
                    <button
                      onClick={() => setAssignTarget(selectedOrder)}
                      className="flex items-center gap-1.5 rounded-xl bg-gray-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-gray-800 cursor-pointer"
                    >
                      <UserPlus size={13} />
                      {selectedOrder.assignedRider ? "Reassign" : "Assign Rider"}
                    </button>
                  )}
                </div>

                <RiderInfoCard
                  rider={selectedOrder.assignedRider}
                  riderStatus={selectedOrder.riderStatus}
                  title="Delivery Rider"
                />

                {selectedOrder.riderStatus === "rejected" &&
                  selectedOrder.riderRejectionReason && (
                    <p className="rounded-xl bg-red-50 p-3 text-xs text-red-700">
                      <span className="font-bold">Rider declined:</span>{" "}
                      {selectedOrder.riderRejectionReason}
                    </p>
                  )}
              </div>

              {/* Items Ordered */}
              <div className="space-y-4 pt-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">
                  Items Ordered
                </h3>
                <div className="divide-y divide-gray-100">
                  {selectedOrder.items.map((item, idx) => (
                    <OrderItemRow key={idx} item={item} />
                  ))}
                </div>
              </div>

              {/* Pricing and Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 items-start">
                <div className="space-y-2.5 text-sm text-gray-600">
                  <div className="flex justify-between border-b border-gray-50 pb-2">
                    <span>Payment Method</span>
                    <span className="font-bold uppercase text-gray-900">
                      {selectedOrder.paymentMethod}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-gray-50 pb-2">
                    <span>Payment Status</span>
                    <span className="font-bold capitalize text-gray-900">
                      {selectedOrder.paymentStatus}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-gray-50 pb-2">
                    <span>Order Status</span>
                    <span>
                      <OrderStatusBadge status={selectedOrder.orderStatus} />
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-5 text-sm text-gray-600 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-bold text-gray-900">
                      Rs. {Number(selectedOrder.subtotal ?? 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span className="font-bold text-gray-900">
                      Rs. {Number(selectedOrder.deliveryFee ?? 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST (5%)</span>
                    <span className="font-bold text-gray-900">
                      Rs. {Number(selectedOrder.tax ?? 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-extrabold text-pink-600 border-t border-gray-200 pt-3 mt-1">
                    <span>Total Amount</span>
                    <span>Rs. {Number(selectedOrder.total ?? 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </DialogContent>

            <DialogActions className="p-6 border-t border-gray-100 gap-2">
              <button
                onClick={() => setOpenDetailModal(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-5 py-2.5 rounded-xl text-xs transition cursor-pointer"
              >
                Close
              </button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Assign / reassign a delivery rider */}
      <AssignRiderModal
        open={Boolean(assignTarget)}
        order={assignOrder}
        onClose={() => setAssignTarget(null)}
        onAssign={handleAssignRider}
        loading={assignLoading}
      />
    </div>
  );
};

export default OwnerOrdersPage;
