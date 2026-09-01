import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Home from "../pages/home/Home";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import MainLayout from "../components/layout/MainLayout";
import Restaurants from "../pages/restaurant/Restaurants";
import DashboardLayout from "../components/layout/OwenerLayout";
import AdminLayout from "../components/layout/AdminLayout";
import Dashboard from "../pages/owner/Dashboard";
import CreateRestaurant from "../pages/owner/CreateRestaurant";
import OwnerRestaurants from "../pages/owner/OwnerRestaurants";
import OwnerProtected from "./OwnerProtected";
import AdminProtected from "./AdminProtected";
import EditRestaurant from "../pages/owner/EditRestaurant";
import AdminDashboard from "../pages/admin/Dashboard";
import PendingRestaurants from "../pages/admin/PendingRestaurants";
import ApprovedRestaurants from "../pages/admin/ApprovedRestaurants";
import RejectedRestaurants from "../pages/admin/RejectedRestaurants";
import ManageUsers from "../pages/admin/Users";
import OwnerProducts from "../pages/owner/OwnerProducts";
import RestaurantDetails from "../pages/restaurant/RestaurantDetails";
import Checkout from "../pages/order/CheckoutPage";
import MyOrders from "../pages/order/MyOrdersPage";
import OrderDetails from "../pages/order/OrderDetailsPage";
import OrderConfirmation from "../pages/order/OrderConfirmationPage";
import OrderTracking from "../pages/order/OrderTrackingPage";
import OwnerOrders from "../pages/owner/OwnerOrders";
import AdminOrders from "../pages/admin/AdminOrders";
import AdminRiders from "../pages/admin/AdminRiders";
import RiderProtected from "./RiderProtected";
import RiderLayout from "../components/layout/RiderLayout";
import RiderDashboard from "../pages/rider/RiderDashboard";
import RiderOrders from "../pages/rider/RiderOrders";
import RiderOrderDetails from "../pages/rider/RiderOrderDetails";


const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Home />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/orders/:id" element={<OrderDetails />} />
          <Route path="/orders/:id/confirmation" element={<OrderConfirmation />} />
          <Route path="/orders/:id/track" element={<OrderTracking />} />
        </Route>

        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        <Route
          path="/restaurants"
          element={
            <ProtectedRoute>
              <Restaurants />
            </ProtectedRoute>
          }
        />

        <Route
          path="/restaurants/:id"
          element={
            <ProtectedRoute>
              <RestaurantDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/owner"
          element={
            <ProtectedRoute>
              <OwnerProtected>
                <DashboardLayout />
              </OwnerProtected>
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="restaurants" element={<OwnerRestaurants />} />
          <Route path="restaurants/create" element={<CreateRestaurant />} />
          <Route path="restaurants/:id/edit" element={<EditRestaurant />} />
          <Route path="products" element={<OwnerProducts />} />
          <Route path="orders" element={<OwnerOrders />} />

        </Route>

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminProtected>
                <AdminLayout />
              </AdminProtected>
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="pending-restaurants" element={<PendingRestaurants />} />
          <Route path="restaurants" element={<ApprovedRestaurants />} />
          <Route
            path="rejected-restaurants"
            element={<RejectedRestaurants />}
          />
          <Route path="users" element={<ManageUsers />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="riders" element={<AdminRiders />} />
        </Route>

        {/* Rider dashboard */}
        <Route
          path="/rider"
          element={
            <ProtectedRoute>
              <RiderProtected>
                <RiderLayout />
              </RiderProtected>
            </ProtectedRoute>
          }
        >
          <Route index element={<RiderDashboard />} />
          <Route path="dashboard" element={<RiderDashboard />} />
          <Route path="deliveries" element={<RiderOrders />} />
          <Route path="deliveries/:id" element={<RiderOrderDetails />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
