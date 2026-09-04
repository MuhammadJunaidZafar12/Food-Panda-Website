import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Store,
  PlusCircle,
  Package,
  ShoppingBag,
  BarChart3,
} from "lucide-react";
import DashboardNavActions from "./DashboardNavActions";

const navItems = [
  { to: "/owner", label: "Dashboard", icon: LayoutDashboard },
  { to: "/owner/restaurants", label: "My Restaurants", icon: Store },
  { to: "/owner/restaurants/create", label: "Create Restaurant", icon: PlusCircle },
  { to: "/owner/products", label: "Products", icon: Package },
  { to: "/owner/orders", label: "Orders", icon: ShoppingBag },
  { to: "/owner/dashboard/analytics", label: "Analytics", icon: BarChart3 },
];

function Sidebar() {
  return (
    <>
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col overflow-y-auto border-r border-gray-200 bg-white px-5 py-6 shadow-sm md:flex">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-pink-600">
          Owner Panel
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-gray-900">Restaurant Hub</h2>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-pink-600 text-white shadow"
                    : "text-gray-600 hover:bg-pink-50 hover:text-pink-600"
                }`
              }
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <DashboardNavActions />
    </aside>
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex overflow-x-auto border-t border-gray-200 bg-white/95 shadow-lg backdrop-blur md:hidden">
      {navItems.map((item) => {
        const Icon = item.icon;
        return <NavLink key={item.to} to={item.to} className={({ isActive }) => `flex min-w-[76px] flex-1 flex-col items-center gap-1 px-1 py-2.5 text-[10px] font-semibold transition ${isActive ? "text-pink-600" : "text-gray-500"}`}><Icon size={19} /><span className="max-w-full truncate">{item.label}</span></NavLink>;
      })}
      <DashboardNavActions mobile />
    </nav>
    </>
  );
}

export default Sidebar;