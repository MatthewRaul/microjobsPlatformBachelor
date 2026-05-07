import { NavLink } from "react-router-dom";

export default function AdminSidebar() {
  return (
    <aside style={styles.sidebar}>
      <div style={styles.logo}>Admin Panel</div>

      <nav style={styles.nav}>
        <NavLink
          to="/admin/jobs"
          style={({ isActive }) => ({
            ...styles.link,
            ...(isActive ? styles.activeLink : {}),
          })}
        >
          Joburi
        </NavLink>

        <NavLink
          to="/admin/aplicari"
          style={({ isActive }) => ({
            ...styles.link,
            ...(isActive ? styles.activeLink : {}),
          })}
        >
          Aplicări
        </NavLink>

        <NavLink
          to="/admin/users"
          style={({ isActive }) => ({
            ...styles.link,
            ...(isActive ? styles.activeLink : {}),
          })}
        >
          Utilizatori
        </NavLink>
      </nav>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: "240px",
    minHeight: "100vh",
    backgroundColor: "#111827",
    color: "#ffffff",
    padding: "24px 16px",
    boxSizing: "border-box",
  },
  logo: {
    fontSize: "22px",
    fontWeight: "700",
    marginBottom: "32px",
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  link: {
    color: "#d1d5db",
    textDecoration: "none",
    padding: "12px 14px",
    borderRadius: "8px",
    fontWeight: "500",
    transition: "0.2s ease",
  },
  activeLink: {
    backgroundColor: "#2563eb",
    color: "#ffffff",
  },
};