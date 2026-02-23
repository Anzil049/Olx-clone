import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

// Wraps any route that needs authentication
// allowedRoles is optional — if not passed, just checks login status
// Usage:
//   <PrivateRoute> — only login required
//   <PrivateRoute allowedRoles={["seller","admin"]}> — needs specific role
const PrivateRoute = ({ children, allowedRoles }) => {
    const { token, user } = useAuth();

    // Not logged in → redirect to login
    if (!token) return <Navigate to="/login" replace />;

    // Logged in but doesn't have required role → redirect home
    if (allowedRoles && !allowedRoles.some((r) => user?.roles?.includes(r))) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default PrivateRoute;