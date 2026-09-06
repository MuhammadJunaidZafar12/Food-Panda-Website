import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Pencil,
  Trash2,
  ShoppingCart,
  AlertTriangle,
  Check,
  Plus,
} from "lucide-react";
import { addToCartThunk, clearCartThunk } from "../../redux/cart/cartThunk";
import { clearCartError, clearCartSuccess } from "../../redux/cart/cartSlice";

const ProductCard = ({
  product,
  onEdit,
  onDelete,
  role = "customer",
}) => {
  const dispatch = useDispatch();
  const { loading: cartLoading } = useSelector((state) => state.cart);

  const [showConflict, setShowConflict] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const handleAddToCart = async () => {
    dispatch(clearCartError());
    dispatch(clearCartSuccess());

    const result = await dispatch(
      addToCartThunk({ productId: product._id, quantity: 1 })
    );

    if (addToCartThunk.rejected.match(result)) {
      const errorPayload = result.payload;
      if (errorPayload?.conflictType === "RESTAURANT_CONFLICT") {
        setShowConflict(true);
      }
    } else {
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 1500);
    }
  };

  const handleConflictConfirm = async () => {
    setShowConflict(false);
    await dispatch(clearCartThunk());
    const result = await dispatch(
      addToCartThunk({ productId: product._id, quantity: 1 })
    );
    if (addToCartThunk.fulfilled.match(result)) {
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 1500);
    }
  };

  return (
    <>
      <div className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-lg sm:flex-row sm:items-stretch">
        {/* Image */}
        <div className="relative h-44 w-full shrink-0 overflow-hidden bg-gray-100 sm:h-auto sm:w-36 md:w-40">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full min-h-[140px] items-center justify-center text-sm text-gray-400">
              No Image
            </div>
          )}

          <div className="absolute left-3 top-3 sm:hidden">
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                product.isAvailable
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {product.isAvailable ? "Available" : "Unavailable"}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex min-w-0 flex-1 flex-col justify-between p-4 sm:p-5">
          <div>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wide text-pink-600">
                  {product.category}
                </p>
                <h3 className="mt-1 line-clamp-1 text-lg font-bold text-gray-900">
                  {product.name}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-500">
                  {product.description || "Freshly prepared and ready to order."}
                </p>
              </div>

              <span
                className={`hidden shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold sm:inline-flex ${
                  product.isAvailable
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {product.isAvailable ? "Available" : "Unavailable"}
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Price
              </p>
              <p className="text-xl font-black text-gray-900">
                Rs. {product.price}
              </p>
            </div>

            {role === "customer" && (
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!product.isAvailable || cartLoading}
                aria-label={`Add ${product.name} to cart`}
                className={`flex h-11 min-w-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-bold text-white shadow-md transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 ${
                  addedSuccess
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-pink-600 hover:bg-pink-700"
                }`}
              >
                {addedSuccess ? (
                  <>
                    <Check size={18} />
                    <span className="hidden sm:inline">Added</span>
                  </>
                ) : (
                  <>
                    <Plus size={18} className="sm:hidden" />
                    <ShoppingCart size={18} className="hidden sm:block" />
                    <span className="hidden sm:inline">Add to Cart</span>
                  </>
                )}
              </button>
            )}

            {role === "owner" && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onEdit(product)}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-blue-700"
                >
                  <Pencil size={15} />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(product._id)}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-red-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-red-700"
                >
                  <Trash2 size={15} />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showConflict && (
        <div className="conflict-modal-overlay" onClick={() => setShowConflict(false)}>
          <div className="conflict-modal" onClick={(e) => e.stopPropagation()}>
            <div className="conflict-modal-icon">
              <AlertTriangle size={28} color="#f59e0b" />
            </div>
            <h3>Different Restaurant</h3>
            <p>
              Your cart contains items from another restaurant. Clear your
              current cart and add this item?
            </p>
            <div className="conflict-modal-actions">
              <button
                type="button"
                className="conflict-cancel-btn"
                onClick={() => setShowConflict(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="conflict-confirm-btn"
                onClick={handleConflictConfirm}
              >
                Clear & Add
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCard;
