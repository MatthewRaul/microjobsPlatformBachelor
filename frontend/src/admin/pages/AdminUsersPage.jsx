import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import StatusBadge from "../../components/StatusBadge";
import ConfirmModal from "../../components/ConfirmModal";
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

  const [filters, setFilters] = useState({ name: "", email: "", role: "" });
  const [userToDelete, setUserToDelete] = useState(null);
  const [userRoleChange, setUserRoleChange] = useState(null);
  const [roleUpdates, setRoleUpdates] = useState({});

  useEffect(() => { loadUsers(); }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      setError("");
      const data = await getAdminUsers();
      setUsers(data);
      const initialRoles = {};
      data.forEach((user) => { initialRoles[user.id] = user.role; });
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
    setFilters((prev) => ({ ...prev, [name]: value }));
  }

  async function handleApplyFilters() {
    await loadUsers();
    setFilterMessage("Filtrele au fost aplicate.");
    setTimeout(() => setFilterMessage(""), 2000);
  }

  async function handleResetFilters() {
    setFilters({ name: "", email: "", role: "" });
    setFilterMessage("");
    await loadUsers();
  }

  function handleRoleUpdate(user) {
    setUserRoleChange(user);
  }

  async function confirmRoleUpdate() {
    if (!userRoleChange) return;
    try {
      await updateAdminUserRole(userRoleChange.id, roleUpdates[userRoleChange.id]);
      setUserRoleChange(null);
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
      const matchesName = !filters.name || fullName.includes(filters.name.toLowerCase());
      const matchesEmail = !filters.email || (user.email || "").toLowerCase().includes(filters.email.toLowerCase());
      const matchesRole = !filters.role || user.role === filters.role;
      return matchesName && matchesEmail && matchesRole;
    });
  }, [users, filters]);

  return (
    <AdminLayout title="Administrare utilizatori">
      <div className="admin-page-header">
        <h2 className="admin-page-header__title">Lista utilizatorilor</h2>
        <p className="admin-page-header__subtitle">
          Poți filtra utilizatori, modifica roluri și șterge conturi.
        </p>
      </div>

      <div className="admin-filters-box">
        <input type="text" name="name" placeholder="Nume" value={filters.name} onChange={handleChange} className="admin-input" />
        <input type="text" name="email" placeholder="Email" value={filters.email} onChange={handleChange} className="admin-input" />
        <select name="role" value={filters.role} onChange={handleChange} className="admin-input">
          <option value="">Toate rolurile</option>
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
        </select>
        <button type="button" onClick={handleApplyFilters} className="admin-btn admin-btn--primary">Filtrează</button>
        <button type="button" onClick={handleResetFilters} className="admin-btn admin-btn--reset">Reset</button>
      </div>

      {filterMessage && <p className="admin-text--success">{filterMessage}</p>}
      {loading && <p>Se încarcă utilizatorii...</p>}
      {error && <p className="admin-text--error">{error}</p>}

      {!loading && !error && filteredUsers.length === 0 && (
        <div className="admin-empty-box">Nu există utilizatori pentru filtrele selectate.</div>
      )}

      {!loading && !error && filteredUsers.length > 0 && (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nume</th>
                <th>Email</th>
                <th>Telefon</th>
                <th>Rol curent</th>
                <th>Rol nou</th>
                <th>Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td data-label="Nume">{user.firstName} {user.lastName}</td>
                  <td data-label="Email">{user.email}</td>
                  <td data-label="Telefon">{user.phoneNumber || "-"}</td>
                  <td data-label="Rol curent"><StatusBadge status={user.role} /></td>
                  <td data-label="Rol nou">
                    <select
                      value={roleUpdates[user.id] || user.role}
                      onChange={(e) => setRoleUpdates((prev) => ({ ...prev, [user.id]: e.target.value }))}
                      className="admin-input"
                    >
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td data-label="Acțiuni" className="td--actions">
                    <div className="admin-actions">
                      <button className="admin-action-btn admin-action-btn--update" onClick={() => handleRoleUpdate(user)}>Salvează rol</button>
                      <button className="admin-action-btn admin-action-btn--delete" onClick={() => setUserToDelete(user)}>Șterge</button>
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
        message={userToDelete ? `Ești sigur că vrei să ștergi utilizatorul ${userToDelete.firstName} ${userToDelete.lastName}?` : "Ești sigur că vrei să ștergi acest utilizator?"}
        confirmText="Șterge"
        cancelText="Renunță"
        onCancel={() => setUserToDelete(null)}
        onConfirm={handleDeleteUser}
        danger
      />
      <ConfirmModal
        open={!!userRoleChange}
        title="Schimbare rol"
        message={
          userRoleChange
            ? `Ești sigur că vrei să schimbi rolul lui ${userRoleChange.firstName} ${userRoleChange.lastName} în ${roleUpdates[userRoleChange.id]}?`
            : "Ești sigur că vrei să schimbi rolul acestui utilizator?"
        }
        confirmText="Salvează rol"
        cancelText="Renunță"
        onCancel={() => setUserRoleChange(null)}
        onConfirm={confirmRoleUpdate}
      />
    </AdminLayout>
  );
}