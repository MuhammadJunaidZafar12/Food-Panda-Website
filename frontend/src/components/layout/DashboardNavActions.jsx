import { House, LogOut } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../redux/auth/authSlice";
import { resetCart } from "../../redux/cart/cartSlice";

const DashboardNavActions = ({ mobile = false }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    dispatch(resetCart());
    navigate("/login");
  };

  const itemClass = mobile
    ? "flex min-w-[76px] flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-semibold text-gray-500 transition hover:text-pink-600"
    : "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-pink-50 hover:text-pink-600";

  return (
    <div className={mobile ? "contents" : "mt-auto space-y-2 border-t border-gray-100 pt-4"}>
      <NavLink to="/" className={itemClass}>
        <House size={mobile ? 20 : 18} />
        <span>Home</span>
      </NavLink>
      <button type="button" onClick={handleLogout} className={itemClass}>
        <LogOut size={mobile ? 20 : 18} />
        <span>Logout</span>
      </button>
    </div>
  );
};

export default DashboardNavActions;
