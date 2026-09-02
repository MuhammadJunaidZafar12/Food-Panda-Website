import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Pencil,
  Trash2,
  ShoppingCart,
  AlertTriangle,
  Check,
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
  const { loading: cartLoading } = useSelector(
    (state) => state.cart
  );

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
      // Show success indicator briefly
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
      <div className="group overflow-hidden rounded-2xl bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">

        {/* Image */}

        <div className="relative h-52 overflow-hidden bg-gray-100 sm:h-56">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">
              No Image
            </div>
          )}

          {/* Availability */}

          <div className="absolute right-3 top-3">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                product.isAvailable
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {product.isAvailable
                ? "Available"
                : "Unavailable"}
            </span>
          </div>
        </div>


        {/* Content */}

        <div className="p-4 sm:p-5">

          <div className="mb-3">
            <p className="text-sm font-medium text-pink-600">
              {product.category}
            </p>

            <h3 className="mt-1 line-clamp-1 text-lg font-bold text-gray-800 sm:text-xl">
              {product.name}
            </h3>

            <p className="mt-2 line-clamp-2 text-sm text-gray-500">
              {product.description ||
                "No description available."}
            </p>
          </div>


          {/* Price */}

          <div className="mb-4">
            <span className="text-xl font-bold text-gray-800">
              Rs. {product.price}
            </span>
          </div>


          {/* Customer - Add to Cart */}

          {role === "customer" && (
            <button
              onClick={handleAddToCart}
              disabled={!product.isAvailable || cartLoading}
              className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 font-semibold text-white transition ${
                addedSuccess
                  ? "bg-green-500 hover:bg-green-600"
                  : !product.isAvailable
                  ? "cursor-not-allowed bg-gray-300"
                  : "bg-pink-600 hover:bg-pink-700"
              }`}
            >
              {addedSuccess ? (
                <>
                  <Check size={18} />
                  Added!
                </>
              ) : (
                <>
                  <ShoppingCart size={18} />
                  Add to Cart
                </>
              )}
            </button>
          )}


          {/* Owner */}

          {role === "owner" && (
            <div className="flex flex-col gap-2 sm:flex-row">

              <button
                onClick={() => onEdit(product)}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                <Pencil size={17} />
                Edit
              </button>

              <button
                onClick={() => onDelete(product._id)}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 py-3 font-semibold text-white transition hover:bg-red-700"
              >
                <Trash2 size={17} />
                Delete
              </button>

            </div>
          )}
        </div>
      </div>

      {/* Restaurant Conflict Modal */}
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
                className="conflict-cancel-btn"
                onClick={() => setShowConflict(false)}
              >
                Cancel
              </button>
              <button
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
