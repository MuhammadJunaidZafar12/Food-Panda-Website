import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getMyOrdersThunk } from "../../redux/order/orderThunk";
import { clearOrderError } from "../../redux/order/orderSlice";
import OrderCard from "../../components/order/OrderCard";
import { ShoppingBag } from "lucide-react";
import Pagination from "@mui/material/Pagination";
import toast from "react-hot-toast";

const MyOrdersPage = () => {
  const dispatch = useDispatch();
  const { orders = [], loading, error, pagination } = useSelector(
    (state) => state.order
  );

  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  // Fetch orders when tab status or page changes
  useEffect(() => {
    dispatch(getMyOrdersThunk({ status, page, limit: 8 }));
  }, [dispatch, status, page]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearOrderError());
    }
  }, [error, dispatch]);

  const handleTabChange = (newStatus) => {
    setStatus(newStatus);
    setPage(1); // reset to page 1 on tab switch
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const tabs = [
    { id: "all", label: "All Orders" },
    { id: "active", label: "Active" },
    { id: "completed", label: "Completed" },
    { id: "cancelled", label: "Cancelled" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            My Orders
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Track status and view order history
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-8 overflow-x-auto pb-px gap-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`pb-4 text-sm font-semibold tracking-wide border-b-2 transition whitespace-nowrap px-1 cursor-pointer ${
              status === tab.id
                ? "border-pink-600 text-pink-600"
                : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4 py-8">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-32 bg-white rounded-2xl border border-gray-100 animate-pulse"
            />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-100 rounded-3xl p-8 space-y-6">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mx-auto">
            <ShoppingBag size={28} />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-gray-900">No orders found</h3>
            <p className="text-sm text-gray-500 max-w-xs mx-auto">
              You haven't placed any orders matching this status yet.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order._id} order={order} />
          ))}

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex justify-center pt-6">
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
    </div>
  );
};

export default MyOrdersPage;
