import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { isAuthenticated } = useAuth();

  return (
    <nav
      style={{
        display: "flex",
        gap: "12px",
        padding: "16px",
        borderBottom: "1px solid #ccc",
        marginBottom: "20px",
      }}
    >
      <Link to="/">Home</Link>

      {isAuthenticated && <Link to="/add-job">Adaugă job</Link>}
      {isAuthenticated && <Link to="/my-jobs">Joburile mele</Link>}
      {isAuthenticated && <Link to="/my-applications">Aplicările mele</Link>}
      {isAuthenticated && <Link to="/profile">Profil</Link>}

      {!isAuthenticated && <Link to="/login">Login</Link>}
      {!isAuthenticated && <Link to="/register">Register</Link>}
    </nav>
  );
}