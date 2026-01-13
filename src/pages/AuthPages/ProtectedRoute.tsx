/* eslint-disable react-hooks/rules-of-hooks */
import { Navigate } from "react-router";
import { getToken, isTokenExpired, logout } from "./Auth.ts"
import toast from "react-hot-toast";
import { JSX } from "react/jsx-runtime";
import { useEffect } from "react";
import { autoLogout } from "./Auth.ts";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const token = getToken();

  useEffect(() => {
    autoLogout();
  }, []);

  if (!token) {
    return <Navigate to="/signin" replace />;
  }

  if (isTokenExpired(token)) {
    logout();
    toast.error("Session expired. Please login again.");
    return <Navigate to="/signin" replace />;
  }

  return children;
}
