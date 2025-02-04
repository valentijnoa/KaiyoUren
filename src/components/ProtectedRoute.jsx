import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import { Outlet } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return currentUser ? <Outlet /> : <Navigate to="/login" />;
}
