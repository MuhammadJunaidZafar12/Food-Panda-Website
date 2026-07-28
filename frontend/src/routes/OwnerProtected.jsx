import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const OwnerProtected = ({ children }) => {
  const { user, isAuthenticated, isCheckingAuth } = useSelector((state) => state.auth);

  if (isCheckingAuth) {
    return (
      <div className="flex h-screen items-center justify-center">
        <h2 className="text-xl font-semibold">Loading...</h2>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "owner") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default OwnerProtected;
