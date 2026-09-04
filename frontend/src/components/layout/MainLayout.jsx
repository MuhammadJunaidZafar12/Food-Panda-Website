import { Outlet } from "react-router-dom";

import Navbar from "./Navbar";
import Footer from "./Footer";
import PageTransition from "./PageTransition";

const MainLayout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default MainLayout;