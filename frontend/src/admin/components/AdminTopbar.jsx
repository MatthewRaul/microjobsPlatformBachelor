import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AdminTopbar({ title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header style={styles.header}>
      <div>
        <h1 style={styles.title}>{title}</h1>
        <p style={styles.subtitle}>Zona de administrare a platformei</p>
      </div>

      <div style={styles.rightSide}>
        <div style={styles.userBox}>
          {user ? `${user.firstName || ""} (${user.role})` : "Admin"}
        </div>

        <button onClick={handleLogout} style={styles.logoutButton}>
          Logout
        </button>
      </div>
    </header>
  );
}

const styles = {
  header: {
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
    padding: "20px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    flexWrap: "wrap",
  },
  title: {
    margin: 0,
    fontSize: "24px",
    color: "#111827",
  },
  subtitle: {
    margin: "4px 0 0",
    color: "#6b7280",
    fontSize: "14px",
  },
  rightSide: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },
  userBox: {
    backgroundColor: "#f3f4f6",
    padding: "10px 14px",
    borderRadius: "10px",
    fontWeight: "600",
    color: "#111827",
  },
  logoutButton: {
    border: "none",
    borderRadius: "10px",
    padding: "10px 16px",
    cursor: "pointer",
    fontWeight: "700",
    backgroundColor: "#dc2626",
    color: "#ffffff",
  },
};