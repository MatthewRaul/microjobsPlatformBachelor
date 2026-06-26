import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../styles/admin.css";

export default function AdminTopbar({ title, onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="admin-topbar">
      <div style={{ display: "flex", alignItems: "center" }}>
        <button className="admin-hamburger" onClick={onMenuClick} aria-label="Deschide meniul">
          <span className="admin-hamburger__bar" />
          <span className="admin-hamburger__bar" />
          <span className="admin-hamburger__bar" />
        </button>

        <div>
          <h1 className="admin-topbar__title">{title}</h1>
          <p className="admin-topbar__subtitle">Zona de administrare a platformei</p>
        </div>
      </div>

      <div className="admin-topbar__right">
        <div className="admin-topbar__user-box">
          {user ? `${user.firstName || ""} (${user.role})` : "Admin"}
        </div>
        <button onClick={handleLogout} className="admin-topbar__logout-btn">
          Logout
        </button>
      </div>
    </header>
  );
}