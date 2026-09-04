import { Outlet } from "react-router-dom";
import Sidebar from "./OwnerSidebar";
import PageTransition from "./PageTransition";

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />

      <div className="min-w-0 md:ml-72">
        <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 px-4 py-4 shadow-sm backdrop-blur sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Owner Dashboard</h1>
              <p className="text-sm text-gray-500">Manage your restaurant business with ease.</p>
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

export default DashboardLayout;