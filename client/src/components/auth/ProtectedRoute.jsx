import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  // Get user from localStorage
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  console.log("User Role", user.role);

  // If user is not logged in, redirect to login
  if (!userStr) {
    return <Navigate to="/login" replace />;
  }

  // If user's role is not in allowed roles, redirect to appropriate dashboard
  if (!allowedRoles.includes(user.role)) {
    // Redirect lenders to lender dashboard and collectors to collector dashboard
    const redirectPath = user.role === "lender" ? "/lender" : "/collector";
    return <Navigate to={redirectPath} replace />;
  }

  // If all checks pass, render the protected component
  return children;
};

export default ProtectedRoute;
