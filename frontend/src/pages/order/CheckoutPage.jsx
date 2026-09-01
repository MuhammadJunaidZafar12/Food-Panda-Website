import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { placeOrderThunk } from "../../redux/order/orderThunk";
import { clearOrderSuccess, clearOrderError } from "../../redux/order/orderSlice";
import { getCartThunk } from "../../redux/cart/cartThunk";
import OrderSummary from "../../components/order/OrderSummary";
import LocationPicker from "../../components/map/LocationPicker";
import { MapPin, Phone, FileText, ArrowLeft, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { cart, loading: cartLoading } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const { loading: orderLoading, error: orderError, success: orderSuccess, currentOrder } = useSelector(
    (state) => state.order
  );

  const [address, setAddress] = useState("");

  // Stays null until the customer types their own number, so the one saved on
  // their account still fills in when the profile finishes loading.
  const [typedPhone, setTypedPhone] = useState(null);
  const phone = typedPhone ?? user?.phone ?? "";

  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");

  // Coordinates picked on the map — needed for live delivery tracking.
  const [location, setLocation] = useState(null);

  // Once the customer edits the address themselves we stop overwriting it
  // with the address looked up from the map.
  const addressEdited = useRef(false);

  // Fetch cart if not already loaded
  useEffect(() => {
    dispatch(getCartThunk());
  }, [dispatch]);

  // Handle Order Success
  useEffect(() => {
    if (orderSuccess && currentOrder) {
      toast.success("Order placed successfully!");
      const orderId = currentOrder._id;
      dispatch(clearOrderSuccess());
      // Navigate to the confirmation screen
      navigate(`/orders/${orderId}/confirmation`);
    }
  }, [orderSuccess, currentOrder, navigate, dispatch]);

  // Handle Order Error
  useEffect(() => {
    if (orderError) {
      toast.error(orderError);
      dispatch(clearOrderError());
    }
  }, [orderError, dispatch]);

  // Map pin moved — remember the coordinates and, unless the customer has
  // already written their own address, use the looked-up one.
  const handleLocationChange = (next) => {
    setLocation(next);

    if (!addressEdited.current && next?.address) {
      setAddress(next.address);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!address.trim()) {
      return toast.error("Please enter your delivery address.");
    }
    if (!phone.trim()) {
      return toast.error("Please enter your contact phone number.");
    }
    if (!location?.latitude || !location?.longitude) {
      return toast.error(
        "Please mark your delivery location on the map so the rider can find you."
      );
    }

    // Minimum order check
    if (cart?.restaurant?.minimumOrder > 0 && cart.subtotal < cart.restaurant.minimumOrder) {
      return toast.error(`Minimum order from this restaurant is Rs. ${cart.restaurant.minimumOrder}`);
    }

    dispatch(
      placeOrderThunk({
        deliveryAddress: address,
        deliveryLocation: {
          latitude: location.latitude,
          longitude: location.longitude,
          city: location.city,
          postalCode: location.postalCode,
        },
        phone,
        notes,
        paymentMethod,
      })
    );
  };

  const hasItems = cart?.items?.length > 0;

  if (cartLoading && !cart) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600" />
      </div>
    );
  }

  if (!hasItems) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6 min-h-[70vh] flex flex-col justify-center items-center">
        <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center text-pink-600 mx-auto">
          <ShoppingBag size={38} />
        </div>
        <h2 className="text-2xl font-black text-gray-900">Your cart is empty</h2>
        <p className="text-gray-500 max-w-sm mx-auto">
          Add items to your cart before proceeding to checkout.
        </p>
        <button
          onClick={() => navigate("/restaurants")}
          className="bg-pink-600 hover:bg-pink-700 text-white font-bold px-8 py-3 rounded-xl transition shadow-md"
        >
          Browse Restaurants
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-pink-600 transition mb-6"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-8">
        Checkout
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Checkout Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          {/* Delivery Details Card */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Delivery Details</h2>

            {/* Address */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
                <MapPin size={16} className="text-gray-400" />
                Delivery Address
              </label>
              <textarea
                value={address}
                onChange={(e) => {
                  addressEdited.current = true;
                  setAddress(e.target.value);
                }}
                placeholder="Enter your complete delivery address (house/flat number, building, street, area)"
                className="w-full min-h-[100px] bg-gray-50 border border-gray-200 focus:border-pink-600 focus:ring-1 focus:ring-pink-600 rounded-2xl p-4 text-sm transition outline-none resize-none"
                required
              />
            </div>

            {/* Map location — gives the rider exact coordinates to navigate to */}
            <div className="space-y-2">
              <LocationPicker
                value={location}
                onChange={handleLocationChange}
                height={280}
                label="Mark your delivery location"
                helperText="Your rider navigates to this pin, so place it as precisely as you can. The address above is filled in automatically and you can edit it freely."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Phone */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
                  <Phone size={16} className="text-gray-400" />
                  Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setTypedPhone(e.target.value)}
                  placeholder="e.g. 03001234567"
                  className="w-full h-12 bg-gray-50 border border-gray-200 focus:border-pink-600 focus:ring-1 focus:ring-pink-600 rounded-2xl px-4 text-sm transition outline-none"
                  required
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
                  <FileText size={16} className="text-gray-400" />
                  Delivery Notes (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Drop off at reception, ring bell"
                  className="w-full h-12 bg-gray-50 border border-gray-200 focus:border-pink-600 focus:ring-1 focus:ring-pink-600 rounded-2xl px-4 text-sm transition outline-none"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Card */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Payment Method</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* COD */}
              <label
                className={`flex flex-col items-center justify-center p-4 border rounded-2xl cursor-pointer transition-all duration-200 hover:bg-gray-50 ${paymentMethod === "cod"
                    ? "border-pink-600 bg-pink-50/30 text-pink-600 ring-1 ring-pink-600"
                    : "border-gray-200 text-gray-600"
                  }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                  className="sr-only"
                />
                <span className="text-sm font-bold mt-1">Cash on Delivery</span>
              </label>

              {/* Card */}
              <label
                className={`flex flex-col items-center justify-center p-4 border rounded-2xl cursor-pointer transition-all duration-200 hover:bg-gray-50 ${paymentMethod === "card"
                    ? "border-pink-600 bg-pink-50/30 text-pink-600 ring-1 ring-pink-600"
                    : "border-gray-200 text-gray-600"
                  }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={paymentMethod === "card"}
                  onChange={() => setPaymentMethod("card")}
                  className="sr-only"
                />
                <span className="text-sm font-bold mt-1">Debit/Credit Card</span>
              </label>

              {/* Wallet */}
              <label
                className={`flex flex-col items-center justify-center p-4 border rounded-2xl cursor-pointer transition-all duration-200 hover:bg-gray-50 ${paymentMethod === "wallet"
                    ? "border-pink-600 bg-pink-50/30 text-pink-600 ring-1 ring-pink-600"
                    : "border-gray-200 text-gray-600"
                  }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="wallet"
                  checked={paymentMethod === "wallet"}
                  onChange={() => setPaymentMethod("wallet")}
                  className="sr-only"
                />
                <span className="text-sm font-bold mt-1">Digital Wallet</span>
              </label>
            </div>
          </div>
        </form>

        {/* Order Summary Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Your Order</h2>
              <span className="text-xs font-bold text-pink-600 bg-pink-50 px-2.5 py-1 rounded-full">
                {cart?.restaurant?.name}
              </span>
            </div>

            {/* Item list preview */}
            <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto pr-1">
              {cart?.items?.map((item) => (
                <div key={item._id} className="py-3 flex justify-between items-center gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {item.product?.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Qty: {item.quantity} × Rs. {item.price}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-gray-900 shrink-0">
                    Rs. {item.subtotal}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations summary component */}
            <OrderSummary
              subtotal={cart.subtotal}
              deliveryFee={cart.deliveryFee}
              tax={cart.grandTotal - cart.subtotal - cart.deliveryFee} // calculated server-equivalent tax
              discount={0}
              total={cart.grandTotal}
            />

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={orderLoading}
              className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-4 px-6 rounded-2xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {orderLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  Placing Order...
                </>
              ) : (
                "Place Order"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
