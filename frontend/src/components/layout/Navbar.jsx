import { useState, useRef, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";
import { Menu, X, ShoppingCart, User, ChevronDown, MapPin } from "lucide-react";

import Logo from "../ui/Logo";
import { logout } from "../../redux/auth/authSlice";
import { resetCart } from "../../redux/cart/cartSlice";
import { getCartThunk } from "../../redux/cart/cartThunk";
import CartDrawer from "../cart/CartDrawer";
import DestinationModal from "../map/DestinationModal";
import useUserLocation from "../../hooks/useUserLocation";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const { label, city, address, radius, hasCoordinates } = useUserLocation();

  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { cart } = useSelector((state) => state.cart);

  const cartItemCount = cart?.totalItems || 0;

  // Fetch cart on mount if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getCartThunk());
    }
  }, [isAuthenticated, dispatch]);

  // Logout function
  const handleLogout = () => {
    dispatch(logout());
    dispatch(resetCart());
    setIsDropdownOpen(false);
    navigate("/login");
  };

  const handleSearch = () => {
    const keyword = search.trim();

    if (!keyword) return;

    navigate(`/restaurants?search=${encodeURIComponent(keyword)}`);

    setSearch("");
  };
  // Handle click outside for dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const navLinkClass = ({ isActive }) =>
    `transition-colors duration-200 ${
      isActive
        ? "text-pink-600 font-semibold"
        : "text-gray-700 hover:text-pink-600"
    }`;

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          {/* Logo & Location */}
          <div className="flex items-center gap-6">
            <Logo variant="navbar" size="sm" />

            {/* Destination Location Badge */}
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="hidden items-center gap-1.5 rounded-full border border-pink-200 bg-pink-50/80 px-3.5 py-1.5 text-xs font-semibold text-pink-700 transition hover:bg-pink-100 md:flex shadow-xs"
              title="Set Delivery Location / Destination"
            >
              <MapPin size={14} className="text-pink-600 shrink-0" />
              <span className="max-w-[140px] truncate text-gray-800">
                {hasCoordinates ? (label || city || address || "Selected Location") : "Deliver to: Set Location"}
              </span>
              <span className="rounded-full bg-pink-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                {radius || 5} km
              </span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-8 lg:flex">
            <NavLink to="/" className={navLinkClass}>
              Home
            </NavLink>

            <NavLink to="/restaurants" className={navLinkClass}>
              Restaurants
            </NavLink>

            <NavLink to="/offers" className={navLinkClass}>
              Offers
            </NavLink>
          </nav>

          {/* Right Side */}
          <div className="hidden items-center gap-5 lg:flex">
            {/* Search */}
            <SearchBar
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onSearch={handleSearch}
            />

            {/* Cart */}
            {isAuthenticated && (
              <button
                className="relative rounded-full p-2 transition hover:bg-gray-100"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingCart size={22} />

                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-pink-600 text-xs text-white">
                  {cartItemCount}
                </span>
              </button>
            )}

            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 rounded-full border border-gray-200 px-3 py-2 transition hover:bg-gray-50"
                >
                  <div className="flex h-9 w-12 items-center justify-center rounded-full bg-pink-100">
                    <User size={18} className="text-pink-600" />
                  </div>

                  <span className="font-medium">{user?.name || "User"}</span>

                  <ChevronDown
                    size={18}
                    className={`transition-transform ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isDropdownOpen && (
                  <div
                    className={`absolute right-0 mt-3
                    w-56
                    origin-top-right
                    overflow-hidden
                    rounded-xl
                    border
                    border-gray-200
                    bg-white
                    shadow-xl
                    transition-all
                    duration-200
                  ${
                    isDropdownOpen
                      ? "translate-y-0 scale-100 opacity-100"
                      : "-translate-y-2 scale-95 opacity-0 pointer-events-none"
                  }
                `}
                  >
                    {" "}
                    <Link
                      to="/profile"
                      className="block px-5 py-3 transition hover:bg-gray-100"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/my-orders"
                      className="block px-5 py-3 transition hover:bg-gray-100"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      My Orders
                    </Link>
                    {user?.role === "owner" && (
                      <Link
                        to="/owner/dashboard"
                        className="block px-5 py-3 transition hover:bg-gray-100"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Owner Dashboard
                      </Link>
                    )}
                    {user?.role === "admin" && (
                      <Link
                        to="/admin/dashboard"
                        className="block px-5 py-3 transition hover:bg-gray-100"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    {user?.role === "rider" && (
                      <Link
                        to="/rider/dashboard"
                        className="block px-5 py-3 transition hover:bg-gray-100"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Rider Dashboard
                      </Link>
                    )}
                    <hr />
                    <button
                      onClick={handleLogout}
                      className="w-full px-5 py-3 text-left text-red-600 transition hover:bg-red-50"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="rounded-lg border border-pink-600 px-5 py-2 font-medium text-pink-600 transition hover:bg-pink-50"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="rounded-lg bg-pink-600 px-5 py-2 font-medium text-white transition hover:bg-pink-700"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-3 lg:hidden">
            {isAuthenticated && (
              <button
                className="relative rounded-full p-2 transition hover:bg-gray-100"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingCart size={22} />
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-pink-600 text-xs text-white">
                  {cartItemCount}
                </span>
              </button>
            )}
            <button onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X size={30} /> : <Menu size={30} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="border-t border-gray-200 bg-white lg:hidden">
            <nav className="flex flex-col px-6 py-5">
              <NavLink to="/" className="py-3" onClick={() => setIsOpen(false)}>
                Home
              </NavLink>

              <NavLink
                to="/restaurants"
                className="py-3"
                onClick={() => setIsOpen(false)}
              >
                Restaurants
              </NavLink>

              <NavLink
                to="/offers"
                className="py-3"
                onClick={() => setIsOpen(false)}
              >
                Offers
              </NavLink>

              <hr className="my-3" />

              {isAuthenticated ? (
                <>
                  <p className="py-2 font-semibold">{user?.name || "User"}</p>

                  <Link
                    to="/profile"
                    className="py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    Profile
                  </Link>

                  <Link
                    to="/my-orders"
                    className="py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    Orders
                  </Link>

                  {user?.role === "admin" && (
                    <Link
                      to="/admin/dashboard"
                      className="py-2"
                      onClick={() => setIsOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  )}

                  {user?.role === "rider" && (
                    <Link
                      to="/rider/dashboard"
                      className="py-2"
                      onClick={() => setIsOpen(false)}
                    >
                      Rider Dashboard
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="py-2 text-left text-red-600"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>

                  <Link
                    to="/register"
                    className="py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}

              <hr className="my-3" />
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsLocationModalOpen(true);
                }}
                className="flex items-center gap-2 py-2 text-left text-sm font-semibold text-pink-600"
              >
                <MapPin size={16} />
                <span>
                  {hasCoordinates ? (label || city || "Change Location") : "Set Delivery Location (5km)"}
                </span>
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Destination Location Modal */}
      <DestinationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default Navbar;

