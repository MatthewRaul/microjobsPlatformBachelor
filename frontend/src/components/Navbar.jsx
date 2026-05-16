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
    <nav style={{
      backgroundColor: "#40826D",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "12px 24px",
      flexWrap: "wrap",
      boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
    }}>

      {/* Logo / Home */}
      <Link
        to="/"
        style={{
          color: "#ffffff",
          textDecoration: "none",
          fontWeight: "700",
          fontSize: "18px",
          marginRight: "16px",
          letterSpacing: "0.5px",
        }}
      >
        JobY
      </Link>

      {/* Linkuri autentificat */}
      {isAuthenticated && <NavBtn to="/add-job">Adaugă job</NavBtn>}
      {isAuthenticated && <NavBtn to="/my-jobs">Joburile mele</NavBtn>}
      {isAuthenticated && <NavBtn to="/my-applications">Aplicările mele</NavBtn>}
      {isAuthenticated && <NavBtn to="/profile">Profil</NavBtn>}
      {isAuthenticated && isAdmin && <NavBtn to="/admin/jobs">Panou Admin</NavBtn>}

      {/* Spatiu flexibil */}
      <div style={{ flex: 1 }} />

      {/* Login / Register / Logout */}
      {!isAuthenticated && <NavBtn to="/login">Login</NavBtn>}
      {!isAuthenticated && <NavBtn to="/register">Register</NavBtn>}
      {isAuthenticated && (
        <button onClick={handleLogout} style={secondaryBtnStyle}>
          Logout
        </button>
      )}
    </nav>
  );
}

function NavBtn({ to, children }) {
  return (
    <Link to={to} style={secondaryBtnStyle}>
      {children}
    </Link>
  );
}

const secondaryBtnStyle = {
  display: "inline-block",
  padding: "7px 14px",
  backgroundColor: "transparent",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "600",
  border: "1px solid rgba(255, 255, 255, 0.5)",
  borderRadius: "5px",
  cursor: "pointer",
  textDecoration: "none",
  transition: "background-color 0.2s, border-color 0.2s",
  fontFamily: "inherit",
};