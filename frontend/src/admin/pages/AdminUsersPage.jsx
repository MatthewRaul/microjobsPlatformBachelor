import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import StatusBadge from "../components/StatusBadge";
import ConfirmModal from "../components/ConfirmModal";
import {
  getAdminUsers,
  updateAdminUserRole,
  deleteAdminUser,
} from "../api/adminUsersApi";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterMessage, setFilterMessage] = useState("");

  const [filters, setFilters] = useState({
    name: "",
    email: "",
    role: "",
  });

  const [userToDelete, setUserToDelete] = useState(null);
  const [roleUpdates, setRoleUpdates] = useState({});

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      setError("");

      const data = await getAdminUsers();
      setUsers(data);

      const initialRoles = {};
      data.forEach((user) => {
        initialRoles[user.id] = user.role;
      });
      setRoleUpdates(initialRoles);
    } catch (err) {
      console.error(err);
      setError("Nu s-au putut încărca utilizatorii.");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleApplyFilters() {
    await loadUsers();
    setFilterMessage("Filtrele au fost aplicate.");
    setTimeout(() => setFilterMessage(""), 2000);
  }

  async function handleResetFilters() {
    const emptyFilters = {
      name: "",
      email: "",
      role: "",
    };

    setFilters(emptyFilters);
    setFilterMessage("");
    await loadUsers();
  }

  async function handleRoleUpdate(userId) {
    try {
      const selectedRole = roleUpdates[userId];
      await updateAdminUserRole(userId, selectedRole);
      await loadUsers();
    } catch (err) {
      console.error(err);
      alert("Nu s-a putut actualiza rolul utilizatorului.");
    }
  }

  async function handleDeleteUser() {
    if (!userToDelete) return;

    try {
      await deleteAdminUser(userToDelete.id);
      setUserToDelete(null);
      await loadUsers();
    } catch (err) {
      console.error(err);
      alert("Nu s-a putut șterge utilizatorul.");
    }
  }

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const fullName = `${user.firstName || ""} ${user.lastName || ""}`.toLowerCase();

      const matchesName =
        !filters.name || fullName.includes(filters.name.toLowerCase());

      const matchesEmail =
        !filters.email ||
        (user.email || "").toLowerCase().includes(filters.email.toLowerCase());

      const matchesRole =
        !filters.role || user.role === filters.role;

      return matchesName && matchesEmail && matchesRole;
    });
  }, [users, filters]);

  return (
    <AdminLayout title="Administrare utilizatori">
      <div style={styles.pageHeader}>
        <h2 style={styles.sectionTitle}>Lista utilizatorilor</h2>
        <p style={styles.sectionSubtitle}>
          Poți filtra utilizatori, modifica roluri și șterge conturi.
        </p>
      </div>

      <div style={styles.filtersBox}>
        <input
          type="text"
          name="name"
          placeholder="Nume"
          value={filters.name}
          onChange={handleChange}
          style={styles.input}
        />

        <input
          type="text"
          name="email"
          placeholder="Email"
          value={filters.email}
          onChange={handleChange}
          style={styles.input}
        />

        <select
          name="role"
          value={filters.role}
          onChange={handleChange}
          style={styles.input}
        >
          <option value="">Toate rolurile</option>
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
        </select>

        <button
          type="button"
          onClick={handleApplyFilters}
          style={{ ...styles.button, ...styles.searchButton }}
        >
          Filtrează
        </button>

        <button
          type="button"
          onClick={handleResetFilters}
          style={{ ...styles.button, ...styles.resetButton }}
        >
          Reset
        </button>
      </div>

      {filterMessage && <p style={styles.successText}>{filterMessage}</p>}
      {loading && <p>Se încarcă utilizatorii...</p>}
      {error && <p style={styles.errorText}>{error}</p>}

      {!loading && !error && filteredUsers.length === 0 && (
        <div style={styles.emptyBox}>
          Nu există utilizatori pentru filtrele selectate.
        </div>
      )}

      {!loading && !error && filteredUsers.length > 0 && (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Nume</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Telefon</th>
                <th style={styles.th}>Rol curent</th>
                <th style={styles.th}>Rol nou</th>
                <th style={styles.th}>Acțiuni</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} style={styles.tr}>
                  <td style={styles.td}>
                    {user.firstName} {user.lastName}
                  </td>
                  <td style={styles.td}>{user.email}</td>
                  <td style={styles.td}>{user.phoneNumber || "-"}</td>
                  <td style={styles.td}>
                    <StatusBadge status={user.role} />
                  </td>
                  <td style={styles.td}>
                    <select
                      value={roleUpdates[user.id] || user.role}
                      onChange={(e) =>
                        setRoleUpdates((prev) => ({
                          ...prev,
                          [user.id]: e.target.value,
                        }))
                      }
                      style={styles.input}
                    >
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actions}>
                      <button
                        style={{ ...styles.actionButton, ...styles.updateButton }}
                        onClick={() => handleRoleUpdate(user.id)}
                      >
                        Salvează rol
                      </button>

                      <button
                        style={{ ...styles.actionButton, ...styles.deleteButton }}
                        onClick={() => setUserToDelete(user)}
                      >
                        Șterge
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        open={!!userToDelete}
        title="Ștergere utilizator"
        message={
          userToDelete
            ? `Ești sigur că vrei să ștergi utilizatorul ${userToDelete.firstName} ${userToDelete.lastName}?`
            : "Ești sigur că vrei să ștergi acest utilizator?"
        }
        confirmText="Șterge"
        cancelText="Renunță"
        onCancel={() => setUserToDelete(null)}
        onConfirm={handleDeleteUser}
      />
    </AdminLayout>
  );
}

const styles = {
  pageHeader: {
    marginBottom: "20px",
  },
  sectionTitle: {
    margin: 0,
    fontSize: "24px",
    color: "#111827",
  },
  sectionSubtitle: {
    marginTop: "6px",
    color: "#6b7280",
    fontSize: "14px",
  },
  filtersBox: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "12px",
    marginBottom: "20px",
    backgroundColor: "#ffffff",
    padding: "16px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
  },
  input: {
    padding: "12px 14px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    backgroundColor: "#ffffff",
  },
  button: {
    padding: "12px 16px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
  searchButton: {
    backgroundColor: "#2563eb",
    color: "#ffffff",
  },
  resetButton: {
    backgroundColor: "#e5e7eb",
    color: "#111827",
  },
  successText: {
    color: "#166534",
    fontWeight: "600",
    marginBottom: "12px",
  },
  errorText: {
    color: "#dc2626",
    fontWeight: "600",
    marginTop: "12px",
  },
  emptyBox: {
    marginTop: "20px",
    padding: "18px",
    backgroundColor: "#ffffff",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
    color: "#374151",
  },
  tableWrapper: {
    overflowX: "auto",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    marginTop: "10px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "14px",
    borderBottom: "1px solid #e5e7eb",
    backgroundColor: "#f9fafb",
    fontSize: "14px",
    color: "#374151",
  },
  tr: {
    borderBottom: "1px solid #f3f4f6",
  },
  td: {
    padding: "14px",
    fontSize: "14px",
    color: "#111827",
    verticalAlign: "top",
  },
  actions: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  actionButton: {
    border: "none",
    borderRadius: "8px",
    padding: "8px 12px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "13px",
  },
  updateButton: {
    backgroundColor: "#dbeafe",
    color: "#1d4ed8",
  },
  deleteButton: {
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
  },
};