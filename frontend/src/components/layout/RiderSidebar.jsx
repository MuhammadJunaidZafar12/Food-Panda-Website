import { NavLink } from "react-router-dom";
import { LayoutDashboard, Package } from "lucide-react";
import DashboardNavActions from "./DashboardNavActions";

const navItems = [
  { to: "/rider/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/rider/deliveries", label: "My Deliveries", icon: Package },
];

/**
 * RiderSidebar
 * ------------
 * Riders work from a phone, so the navigation is a bottom bar on small screens
 * and the familiar dashboard sidebar from tablet width upwards.
 */
const RiderSidebar = () => {
  return (
    <>
      {/* Desktop / tablet */}
      <aside className="hidden h-screen w-72 shrink-0 flex-col border-r border-gray-200 bg-white px-5 py-6 shadow-sm md:flex">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-pink-600">
            Rider Panel
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-gray-900">Deliveries</h2>
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

      {/* Mobile bottom bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-gray-200 bg-white shadow-lg md:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-semibold transition ${
                  isActive ? "text-pink-600" : "text-gray-500"
                }`
              }
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
        <DashboardNavActions mobile />
      </nav>
    </>
  );
};

export default RiderSidebar;
