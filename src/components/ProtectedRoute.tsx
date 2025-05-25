import { Navigate } from "react-router-dom";
import {ReactNode} from "react";

interface ProtectedRouteProps {
    children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const token = localStorage.getItem("token");

    if (!token) {
        // Not logged in: redirect to login
        return <Navigate to="/auth" replace />;
    }

    // Logged in: allow access
    return children;
};
