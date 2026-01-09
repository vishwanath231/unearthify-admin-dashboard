import { JSX } from "react";
import { Navigate } from "react-router";

export default function ProtectedRoute({
  children,
}: {
  children: JSX.Element;
}) {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  if (!token) {
    return <Navigate to="/signin" replace />;
  }

  return children;
}
