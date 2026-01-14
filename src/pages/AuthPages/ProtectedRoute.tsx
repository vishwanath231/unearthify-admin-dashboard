/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/rules-of-hooks */
import { Navigate } from "react-router";
import { getToken, isTokenExpired, logout } from "./Auth.ts"
import toast from "react-hot-toast";
import { JSX } from "react/jsx-runtime";
import { useEffect } from "react";
import { autoLogout ,startIdleLogout } from "./Auth.ts";
import { jwtDecode } from "jwt-decode";



export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const token:any = getToken();
  console.log("DECODED:", jwtDecode(token));

useEffect(() => {
  autoLogout();        // token expiry
  startIdleLogout(10); // idle 10 min
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
