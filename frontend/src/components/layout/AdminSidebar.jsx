import { NavLink } from "react-router-dom";
import { LayoutDashboard, Building2, CheckCircle2, XCircle, Users } from "lucide-react";

const navItems = [
  { to: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/admin/pending-restaurants", label: "Pending Restaurants", icon: Building2 },
  { to: "/admin/restaurants", label: "Approved Restaurants", icon: CheckCircle2 },
  { to: "/admin/rejected-restaurants", label: "Rejected Restaurants", icon: XCircle },
  { to: "/admin/users", label: "Manage Users", icon: Users },
];

const AdminSidebar = () => {
  return (
    <aside className="flex h-screen w-72 flex-col border-r border-gray-200 bg-white px-5 py-6 shadow-sm">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-pink-600">Admin Panel</p>
        <h2 className="mt-2 text-2xl font-semibold text-gray-900">Food Panda</h2>
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
};

export default AdminSidebar;
