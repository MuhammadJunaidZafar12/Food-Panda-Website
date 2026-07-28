import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Store,
  PlusCircle,
  Package,
  ShoppingBag,
  Settings,
} from "lucide-react";

const navItems = [
  { to: "/owner", label: "Dashboard", icon: LayoutDashboard },
  { to: "/owner/restaurants", label: "My Restaurants", icon: Store },
  { to: "/owner/restaurants/create", label: "Create Restaurant", icon: PlusCircle },
  { to: "/owner/products", label: "Products", icon: Package },
  { to: "/owner/orders", label: "Orders", icon: ShoppingBag },
  { to: "/owner/settings", label: "Settings", icon: Settings },
];

function Sidebar() {
  return (
    <aside className="flex h-screen w-72 flex-col border-r border-gray-200 bg-white px-5 py-6 shadow-sm">
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
    </aside>
  );
}

export default Sidebar;