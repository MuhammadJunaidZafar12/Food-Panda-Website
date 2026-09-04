import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import PageTransition from "./PageTransition";

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />

      <div className="min-w-0 md:ml-72">
        <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 px-4 py-4 shadow-sm backdrop-blur sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-500">Manage restaurants, approvals, and users efficiently.</p>
            </div>
          </div>
        </header>

        <main className="min-w-0 p-4 pb-24 sm:p-6 md:pb-6">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
