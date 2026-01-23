import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// The component now accepts 'children' as a prop
const ProtectedRoute = ({ children }) => {
  const { authUser } = useAuth();

  // If there's no authenticated user, redirect to the sign-in page
  if (!authUser) {
    return <Navigate to="/signin" />;
  }

  // If there is an authenticated user, render the children components that were passed in
  return children;
};

export default ProtectedRoute;
