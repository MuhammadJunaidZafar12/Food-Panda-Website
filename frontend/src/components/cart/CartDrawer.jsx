import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ShoppingCart,
} from "lucide-react";
import {
  getCartThunk,
  updateCartItemThunk,
  removeFromCartThunk,
  clearCartThunk,
} from "../../redux/cart/cartThunk";
import { useNavigate } from "react-router-dom";
import "./CartDrawer.css";

const CartDrawer = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { cart, loading } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Fetch cart when drawer opens
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      dispatch(getCartThunk());
    }
  }, [isOpen, isAuthenticated, dispatch]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleIncrease = (productId, currentQty) => {
    dispatch(
      updateCartItemThunk({ productId, quantity: currentQty + 1 })
    );
  };

  const handleDecrease = (productId, currentQty) => {
    if (currentQty <= 1) {
      dispatch(removeFromCartThunk(productId));
    } else {
      dispatch(
        updateCartItemThunk({ productId, quantity: currentQty - 1 })
      );
    }
  };

  const handleRemove = (productId) => {
    dispatch(removeFromCartThunk(productId));
  };

  const handleClearCart = () => {
    dispatch(clearCartThunk());
  };

  const handleCheckout = () => {
    onClose();
    navigate("/checkout");
  };

  const hasItems = cart?.items?.length > 0;

  return (
    <>
      {/* Overlay */}
      <div
        className={`cart-overlay ${isOpen ? "open" : ""}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div className={`cart-drawer ${isOpen ? "open" : ""}`}>
        {/* Header */}
        <div className="cart-drawer-header">
          <h2>
            <ShoppingBag size={22} />
            Your Cart
            {cart?.totalItems > 0 && (
              <span className="cart-count-badge">
                {cart.totalItems}
              </span>
            )}
          </h2>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Loading */}
        {loading && !cart ? (
          <div className="cart-loading">
            <div className="cart-spinner" />
          </div>
        ) : !hasItems ? (
          /* Empty Cart */
          <div className="cart-empty">
            <div className="cart-empty-icon">
              <ShoppingCart size={40} color="#e21b70" />
            </div>
            <h3>Your cart is empty</h3>
            <p>Browse restaurants and add delicious items to your cart</p>
          </div>
        ) : (
          <>
            {/* Restaurant Info */}
            {cart?.restaurant && (
              <div className="cart-restaurant-info">
                {cart.restaurant.logo ? (
                  <img
                    src={cart.restaurant.logo}
                    alt={cart.restaurant.name}
                  />
                ) : (
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: "#f3f4f6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.7rem",
                      color: "#9ca3af",
                    }}
                  >
                    🍴
                  </div>
                )}
                <span className="restaurant-name">
                  {cart.restaurant.name}
                </span>
              </div>
            )}

            {/* Items List */}
            <div className="cart-items-list">
              {cart.items.map((item) => (
                <div className="cart-item" key={item._id}>
                  {item.product?.image ? (
                    <img
                      className="cart-item-image"
                      src={item.product.image}
                      alt={item.product?.name || "Product"}
                    />
                  ) : (
                    <div className="cart-item-image-placeholder">
                      No Img
                    </div>
                  )}

                  <div className="cart-item-details">
                    <div className="cart-item-name">
                      {item.product?.name || "Product"}
                    </div>
                    <div className="cart-item-price">
                      Rs. {item.price}
                    </div>

                    <div className="cart-item-actions">
                      <div className="quantity-controls">
                        <button
                          onClick={() =>
                            handleDecrease(
                              item.product?._id,
                              item.quantity
                            )
                          }
                        >
                          <Minus size={14} />
                        </button>
                        <span className="quantity-value">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            handleIncrease(
                              item.product?._id,
                              item.quantity
                            )
                          }
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <span className="cart-item-subtotal">
                        Rs. {item.subtotal}
                      </span>

                      <button
                        className="remove-item-btn"
                        onClick={() =>
                          handleRemove(item.product?._id)
                        }
                        title="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="cart-footer">
              <div className="cart-summary-row">
                <span>Subtotal</span>
                <span>Rs. {Number(cart.subtotal ?? 0).toLocaleString()}</span>
              </div>
              <div className="cart-summary-row">
                <span>Delivery Fee</span>
                <span>
                  {cart.deliveryFee > 0
                    ? `Rs. ${Number(cart.deliveryFee).toLocaleString()}`
                    : "Free"}
                </span>
              </div>
              <div className="cart-summary-row">
                <span>GST (5%)</span>
                <span>
                  Rs. {Number(
                    cart.tax !== undefined
                      ? cart.tax
                      : Math.round(cart.subtotal * 0.05 * 100) / 100
                  ).toLocaleString()}
                </span>
              </div>
              <div className="cart-summary-row grand-total">
                <span>Grand Total</span>
                <span className="amount">
                  Rs. {Number(
                    cart.grandTotal ??
                      Math.round(
                        (cart.subtotal +
                          (cart.deliveryFee || 0) +
                          (cart.tax !== undefined
                            ? cart.tax
                            : Math.round(cart.subtotal * 0.05 * 100) / 100)) *
                          100
                      ) / 100
                  ).toLocaleString()}
                </span>
              </div>

              <div className="cart-footer-actions">
                <button
                  className="checkout-btn"
                  onClick={handleCheckout}
                >
                  Proceed to Checkout{" "}
                  <ArrowRight
                    size={18}
                    style={{
                      display: "inline",
                      verticalAlign: "middle",
                      marginLeft: 6,
                    }}
                  />
                </button>
                <button
                  className="clear-cart-btn"
                  onClick={handleClearCart}
                >
                  Clear Cart
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
