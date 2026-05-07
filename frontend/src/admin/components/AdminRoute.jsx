import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AdminRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Asteptam sa se incarce userul logat
  if (loading) {
    return <div>Se verifică accesul...</div>;
  }

  // Daca nu exista user logat, il trimitem la login
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Daca userul exista dar nu e admin, nu are voie in zona de admin
  if (user.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  // Daca e admin, afisam ruta copil
  return <Outlet />;
}