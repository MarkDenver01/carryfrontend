import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { JSX } from "react";

interface ProtectedRouteProps {
    children: JSX.Element;
    requiredRole?: "ADMIN" | "SUB_ADMIN"; // OPTIONAL role check
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
    const { user } = useAuth();

    // Not logged in? Block access
    if (!user) {
        return <Navigate to="/" replace />;
    }

    // If page requires a role, and user role is different → deny
    if (requiredRole && user.role !== requiredRole) {
        return <Navigate to="/dashboard" replace />;
    }

    // Allowed
    return children;
};

export default ProtectedRoute;
