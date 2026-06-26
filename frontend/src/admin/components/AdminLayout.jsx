import { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";
import "../styles/admin.css";

export default function AdminLayout({ title, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="admin-wrapper">
      <div
        className={`admin-sidebar-overlay${sidebarOpen ? " admin-sidebar-overlay--visible" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="admin-main-area">
        <AdminTopbar title={title} onMenuClick={() => setSidebarOpen((prev) => !prev)} />
        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
}