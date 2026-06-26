import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import StatusBadge from "../../components/StatusBadge";
import ConfirmModal from "../../components/ConfirmModal";
import {
  getAdminApplications,
  acceptAdminApplication,
  rejectAdminApplication,
  deleteAdminApplication,
} from "../api/adminApplicationsApi";

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterMessage, setFilterMessage] = useState("");

  const [filters, setFilters] = useState({
    email: "",
    status: "",
    jobId: "",
  });

  const [applicationToDelete, setApplicationToDelete] = useState(null);
  const [applicationToAccept, setApplicationToAccept] = useState(null);
  const [applicationToReject, setApplicationToReject] = useState(null);

  useEffect(() => { loadApplications(); }, []);

  async function loadApplications() {
    try {
      setLoading(true);
      setError("");
      const data = await getAdminApplications();
      setApplications(data);
    } catch (err) {
      console.error(err);
      setError("Nu s-au putut încărca aplicările.");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  }

  async function handleApplyFilters() {
    await loadApplications();
    setFilterMessage("Filtrele au fost aplicate.");
    setTimeout(() => setFilterMessage(""), 2000);
  }

  async function handleResetFilters() {
    setFilters({ email: "", status: "", jobId: "" });
    setFilterMessage("");
    await loadApplications();
  }

  function handleAccept(application) {
    setApplicationToAccept(application);
  }

  async function confirmAccept() {
    if (!applicationToAccept) return;
    try {
      await acceptAdminApplication(applicationToAccept.id);
      setApplicationToAccept(null);
      await loadApplications();
    } catch (err) {
      console.error(err);
      alert("Nu s-a putut accepta aplicarea.");
    }
  }

  function handleReject(application) {
    setApplicationToReject(application);
  }

  async function confirmReject() {
    if (!applicationToReject) return;
    try {
      await rejectAdminApplication(applicationToReject.id);
      setApplicationToReject(null);
      await loadApplications();
    } catch (err) {
      console.error(err);
      alert("Nu s-a putut respinge aplicarea.");
    }
  }

  async function handleDelete() {
    if (!applicationToDelete) return;
    try {
      await deleteAdminApplication(applicationToDelete.id);
      setApplicationToDelete(null);
      await loadApplications();
    } catch (err) {
      console.error(err);
      alert("Nu s-a putut șterge aplicarea.");
    }
  }

  const filteredApplications = useMemo(() => {
    return applications.filter((application) => {
      const matchesEmail = !filters.email || (application.applicantEmail || "").toLowerCase().includes(filters.email.toLowerCase());
      const matchesStatus = !filters.status || application.status === filters.status;
      const matchesJobId = !filters.jobId || (application.jobId || "").toLowerCase().includes(filters.jobId.toLowerCase());
      return matchesEmail && matchesStatus && matchesJobId;
    });
  }, [applications, filters]);

  return (
    <AdminLayout title="Administrare aplicări">
      <div className="admin-page-header">
        <h2 className="admin-page-header__title">Lista aplicărilor</h2>
        <p className="admin-page-header__subtitle">
          Poți filtra, accepta, respinge sau șterge aplicările din platformă.
        </p>
      </div>

      <div className="admin-filters-box">
        <input type="text" name="email" placeholder="Email aplicant" value={filters.email} onChange={handleChange} className="admin-input" />
        <input type="text" name="jobId" placeholder="Job ID" value={filters.jobId} onChange={handleChange} className="admin-input" />
        <select name="status" value={filters.status} onChange={handleChange} className="admin-input">
          <option value="">Toate statusurile</option>
          <option value="PENDING">PENDING</option>
          <option value="ACCEPTED">ACCEPTED</option>
          <option value="REJECTED">REJECTED</option>
        </select>
        <button type="button" onClick={handleApplyFilters} className="admin-btn admin-btn--primary">Filtrează</button>
        <button type="button" onClick={handleResetFilters} className="admin-btn admin-btn--reset">Reset</button>
      </div>

      {filterMessage && <p className="admin-text--success">{filterMessage}</p>}
      {loading && <p>Se încarcă aplicările...</p>}
      {error && <p className="admin-text--error">{error}</p>}

      {!loading && !error && filteredApplications.length === 0 && (
        <div className="admin-empty-box">Nu există aplicări pentru filtrele selectate.</div>
      )}

      {!loading && !error && filteredApplications.length > 0 && (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nume</th>
                <th>Email</th>
                <th>Job ID</th>
                <th>Status</th>
                <th>Data aplicării</th>
                <th>Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.map((application) => (
                <tr key={application.id}>
                  <td data-label="Nume">{application.applicantFirstName} {application.applicantLastName}</td>
                  <td data-label="Email">{application.applicantEmail}</td>
                  <td data-label="Job ID">{application.jobId}</td>
                  <td data-label="Status"><StatusBadge status={application.status} /></td>
                  <td data-label="Data aplicării">
                    {application.appliedAt ? new Date(application.appliedAt).toLocaleString("ro-RO") : "-"}
                  </td>
                  <td data-label="Acțiuni" className="td--actions">
                    <div className="admin-actions">
                      {application.status === "PENDING" && (
                        <>
                          <button className="admin-action-btn admin-action-btn--accept" onClick={() => handleAccept(application)}>Acceptă</button>
                          <button className="admin-action-btn admin-action-btn--reject" onClick={() => handleReject(application)}>Respinge</button>
                        </>
                      )}
                      <button className="admin-action-btn admin-action-btn--delete" onClick={() => setApplicationToDelete(application)}>Șterge</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        open={!!applicationToDelete}
        title="Ștergere aplicare"
        message={applicationToDelete ? `Ești sigur că vrei să ștergi aplicarea lui ${applicationToDelete.applicantFirstName} ${applicationToDelete.applicantLastName}?` : "Ești sigur că vrei să ștergi această aplicare?"}
        confirmText="Șterge"
        cancelText="Renunță"
        onCancel={() => setApplicationToDelete(null)}
        onConfirm={handleDelete}
        danger
      />
      <ConfirmModal
        open={!!applicationToAccept}
        title="Acceptare aplicare"
        message={applicationToAccept ? `Ești sigur că vrei să accepți aplicarea lui ${applicationToAccept.applicantFirstName} ${applicationToAccept.applicantLastName}?` : "Ești sigur că vrei să accepți această aplicare?"}
        confirmText="Acceptă"
        cancelText="Renunță"
        onCancel={() => setApplicationToAccept(null)}
        onConfirm={confirmAccept}
      />
      <ConfirmModal
        open={!!applicationToReject}
        title="Respingere aplicare"
        message={applicationToReject ? `Ești sigur că vrei să respingi aplicarea lui ${applicationToReject.applicantFirstName} ${applicationToReject.applicantLastName}?` : "Ești sigur că vrei să respingi această aplicare?"}
        confirmText="Respinge"
        cancelText="Renunță"
        onCancel={() => setApplicationToReject(null)}
        onConfirm={confirmReject}
        danger
      />
    </AdminLayout>
  );
}