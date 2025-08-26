// import { Navigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";
import type { JSX } from "react";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    // const { token, role } = useAuth();
    //
    // if (!token || role !== "ROLE_ADMIN") {
    //     return <Navigate to="/" replace />;
    // }

    return children;
};

export default ProtectedRoute;
