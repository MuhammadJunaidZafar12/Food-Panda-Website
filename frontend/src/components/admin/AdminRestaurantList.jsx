import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  Building2,
  CheckCircle2,
  Clock3,
  Mail,
  MapPin,
  Phone,
  Store,
  XCircle,
} from "lucide-react";
import {
  approveRestaurantThunk,
  rejectRestaurantThunk,
} from "../../redux/restaurant/restaurantThunk";
import EmptyState from "../ui/EmptyState";

const statusConfig = {
  pending: {
    badge: "bg-amber-50 text-amber-700 ring-amber-200",
    label: "Pending",
    icon: Clock3,
  },
  approved: {
    badge: "bg-green-50 text-green-700 ring-green-200",
    label: "Approved",
    icon: CheckCircle2,
  },
  rejected: {
    badge: "bg-red-50 text-red-700 ring-red-200",
    label: "Rejected",
    icon: XCircle,
  },
};

const AdminRestaurantList = ({
  title,
  description,
  restaurants = [],
  variant = "approved",
  emptyTitle,
  emptyDescription,
  loading = false,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const config = statusConfig[variant] || statusConfig.approved;
  const StatusIcon = config.icon;
  const list = restaurants || [];

  const handleApprove = (id) => {
    dispatch(approveRestaurantThunk(id));
  };

  const handleReject = (id) => {
    dispatch(rejectRestaurantThunk(id));
  };

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-pink-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 sm:text-3xl">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
            {description}
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-bold text-gray-700">
          <Store size={16} className="text-pink-600" />
          {list.length} restaurant{list.length === 1 ? "" : "s"}
        </span>
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon={variant === "pending" ? Building2 : StatusIcon}
          title={emptyTitle}
          description={emptyDescription}
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:block">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                    Restaurant
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                    Category
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                    Location
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                    Contact
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                    Status
                  </th>
                  {variant === "pending" && (
                    <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-gray-500">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {list.map((restaurant) => (
                  <tr
                    key={restaurant._id}
                    className="transition hover:bg-gray-50/80"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 overflow-hidden rounded-xl bg-gray-100">
                          {restaurant.logo ? (
                            <img
                              src={restaurant.logo}
                              alt={restaurant.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-gray-400">
                              <Store size={18} />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {restaurant.name}
                          </p>
                          <p className="mt-0.5 line-clamp-1 text-xs text-gray-500">
                            {restaurant.description || "No description provided"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {restaurant.category || "—"}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={14} className="shrink-0 text-gray-400" />
                        <span>{restaurant.city || "—"}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">
                      <div className="space-y-1">
                        {restaurant.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone size={14} className="shrink-0 text-gray-400" />
                            <span>{restaurant.phone}</span>
                          </div>
                        )}
                        {restaurant.email && (
                          <div className="flex items-center gap-1.5">
                            <Mail size={14} className="shrink-0 text-gray-400" />
                            <span className="truncate">{restaurant.email}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${config.badge}`}
                      >
                        <StatusIcon size={12} />
                        {config.label}
                      </span>
                    </td>
                    {variant === "pending" && (
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleApprove(restaurant._id)}
                            className="rounded-lg bg-green-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReject(restaurant._id)}
                            className="rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-red-700"
                          >
                            Reject
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/restaurants/${restaurant._id}`)
                            }
                            className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-bold text-gray-700 transition hover:bg-gray-50"
                          >
                            View
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile / tablet cards */}
          <div className="grid gap-4 lg:hidden">
            {list.map((restaurant) => (
              <article
                key={restaurant._id}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
              >
                <div className="flex items-start gap-4 p-4">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                    {restaurant.logo ? (
                      <img
                        src={restaurant.logo}
                        alt={restaurant.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-400">
                        <Store size={22} />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="text-lg font-bold text-gray-900">
                        {restaurant.name}
                      </h2>
                      <span
                        className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold ring-1 ring-inset ${config.badge}`}
                      >
                        <StatusIcon size={11} />
                        {config.label}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-pink-600">
                      {restaurant.category || "Uncategorized"}
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm text-gray-500">
                      {restaurant.description || "No description provided."}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 border-t border-gray-100 px-4 py-3 text-sm text-gray-600">
                  <p className="flex items-center gap-2">
                    <MapPin size={15} className="shrink-0 text-gray-400" />
                    {restaurant.city || "Location not set"}
                  </p>
                  {restaurant.phone && (
                    <p className="flex items-center gap-2">
                      <Phone size={15} className="shrink-0 text-gray-400" />
                      {restaurant.phone}
                    </p>
                  )}
                  {restaurant.email && (
                    <p className="flex items-center gap-2">
                      <Mail size={15} className="shrink-0 text-gray-400" />
                      <span className="truncate">{restaurant.email}</span>
                    </p>
                  )}
                </div>

                {variant === "pending" && (
                  <div className="flex gap-2 border-t border-gray-100 p-4">
                    <button
                      type="button"
                      onClick={() => handleApprove(restaurant._id)}
                      className="flex-1 rounded-xl bg-green-600 py-2.5 text-sm font-bold text-white transition hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReject(restaurant._id)}
                      className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-bold text-white transition hover:bg-red-700"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`/restaurants/${restaurant._id}`)}
                      className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
                    >
                      View
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminRestaurantList;
