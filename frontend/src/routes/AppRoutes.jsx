import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Home from "../pages/home/Home";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import MainLayout from "../components/layout/MainLayout";
import Restaurants from "../pages/restaurant/Restaurants";
import DashboardLayout from "../components/layout/OwenerLayout";
import Dashboard from "../pages/owner/Dashboard";
import CreateRestaurant from "../pages/owner/CreateRestaurant";
import OwnerRestaurants from "../pages/owner/OwnerRestaurants";
import OwnerProtected from "./OwnerProtected";
import EditRestaurant from "../pages/owner/EditRestaurant"

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
          <Route
            path="restaurants/:id/edit"
            element={<EditRestaurant />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
