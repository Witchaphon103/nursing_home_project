import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ children, requiredRole }) => {
    const { user, role, loading } = useContext(AuthContext);

    if (loading) return <p>กำลังโหลด...</p>;
    if (!user) return <Navigate to="/login" />;
    if (role !== requiredRole && role !== "owner") return <Navigate to="/unauthorized" />;

    return children;
};

export default ProtectedRoute;
