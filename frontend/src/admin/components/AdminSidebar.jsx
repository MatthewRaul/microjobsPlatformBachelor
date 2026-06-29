import { NavLink } from "react-router-dom";
import "../styles/admin.css";

export default function AdminSidebar({ open, onClose }) {
  return (
    <aside className={"admin-sidebar" + (open ? " admin-sidebar--open" : "")}>
      <div className="admin-sidebar__logo">Admin Panel</div>

      <nav className="admin-sidebar__nav">
        <NavLink
          to="/admin/jobs"
          onClick={onClose}
          className={({ isActive }) =>
            "admin-sidebar__link" + (isActive ? " admin-sidebar__link--active" : "")
          }
        >
          Joburi
        </NavLink>
        <NavLink
          to="/admin/aplicari"
          onClick={onClose}
          className={({ isActive }) =>
            "admin-sidebar__link" + (isActive ? " admin-sidebar__link--active" : "")
          }
        >
          Aplicări
        </NavLink>
        <NavLink
          to="/admin/users"
          onClick={onClose}
          className={({ isActive }) =>
            "admin-sidebar__link" + (isActive ? " admin-sidebar__link--active" : "")
          }
        >
          Utilizatori
        </NavLink>
        <NavLink
          to="/admin/reviews"
          onClick={onClose}
          className={({ isActive }) =>
            "admin-sidebar__link" + (isActive ? " admin-sidebar__link--active" : "")
          }
        >
          Recenzii
        </NavLink>
      </nav>
    </aside>
  );
}