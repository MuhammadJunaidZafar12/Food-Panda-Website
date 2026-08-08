import { useState, useRef, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";
import { Menu, X, ShoppingCart, User, ChevronDown } from "lucide-react";

import Logo from "../ui/Logo";
import { logout } from "../../redux/auth/authSlice";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Logout function
  const handleLogout = () => {
    dispatch(logout());
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

  // Redux
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const navLinkClass = ({ isActive }) =>
    `transition-colors duration-200 ${
      isActive
        ? "text-pink-600 font-semibold"
        : "text-gray-700 hover:text-pink-600"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Logo variant="navbar" size="sm" />

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
          <button className="relative rounded-full p-2 transition hover:bg-gray-100">
            <ShoppingCart size={22} />

            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-pink-600 text-xs text-white">
              0
            </span>
          </button>

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
                    to="/orders"
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
        <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden">
          {isOpen ? <X size={30} /> : <Menu size={30} />}
        </button>
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
                  to="/orders"
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
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
