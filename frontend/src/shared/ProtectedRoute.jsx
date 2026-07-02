import React from "react";
import { protectedRouteStyles as s } from "../assets/dummyStyles";
import { useAuth } from "./AuthContext";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const ProtectedRoute = ({ allowedRole }) => {
  const { currentUser, ready } = useAuth();
  const location = useLocation();

  // 1. Auth not ready
  if (!ready) {
    console.log("Protected Route: Auth not ready yet");
    return (
      <div className={s.loadingContainer}>
        <div className={s.loadingCard}>
          Loading your library workspace...
        </div>
      </div>
    );
  }

  // 2. No user logged in
  if (!currentUser) {
    const hasToken = localStorage.getItem("library-auth-token");

    console.log(
      "Protected Route: No currentUser. HasToken:",
      !!hasToken,
      "AllowedRole:",
      allowedRole
    );

    if (hasToken) {
      return (
        <div className={s.loadingContainer}>
          <div className={s.loadingCard}>
            Syncing your workspace...
          </div>
        </div>
      );
    }

    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 3. Role check
  console.log(
    "Protected Route: CurrentUser:",
    currentUser.role,
    "AllowedRole:",
    allowedRole
  );

  if (currentUser.role !== allowedRole) {
    console.warn("ProtectedRoute: Role mismatch! redirecting...");

    return <Navigate to="/" replace />;
  }

  // 4. Access granted
  console.log("ProtectedRoute: Access Granted");
  return <Outlet />;
};

export default ProtectedRoute;