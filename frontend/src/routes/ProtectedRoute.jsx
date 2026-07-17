import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children }) => {

  const {
    isAuthenticated,
    isCheckingAuth,
  } = useSelector((state) => state.auth);

  if (isCheckingAuth) {

    return (
      <div className="flex h-screen items-center justify-center">
        <h2 className="text-xl font-semibold">
          Loading...
        </h2>
      </div>
    );

  }

  if (!isAuthenticated) {

    return <Navigate to="/login" replace />;

  }

  return children;
};

export default ProtectedRoute;