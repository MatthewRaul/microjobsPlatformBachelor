import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const isAdmin = user?.role === "ADMIN";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar__logo">JobY</Link>

      {isAuthenticated && <NavBtn to="/add-job">Adaugă job</NavBtn>}
      {isAuthenticated && <NavBtn to="/my-jobs">Joburile mele</NavBtn>}
      {isAuthenticated && <NavBtn to="/my-applications">Aplicările mele</NavBtn>}
      {isAuthenticated && <NavBtn to="/profile">Profil</NavBtn>}
      {isAuthenticated && isAdmin && <NavBtn to="/admin/jobs">Panou Admin</NavBtn>}

      <div className="navbar__spacer" />

      {!isAuthenticated && <NavBtn to="/login">Login</NavBtn>}
      {!isAuthenticated && <NavBtn to="/register">Register</NavBtn>}
      {isAuthenticated && (
        <button onClick={handleLogout} className="navbar__btn">
          Logout
        </button>
      )}
    </nav>
  );
}

function NavBtn({ to, children }) {
  return (
    <Link to={to} className="navbar__btn">
      {children}
    </Link>
  );
}