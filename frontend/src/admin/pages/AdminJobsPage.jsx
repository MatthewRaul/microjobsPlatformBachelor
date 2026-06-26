import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import StatusBadge from "../../components/StatusBadge";
import ConfirmModal from "../../components/ConfirmModal";
import {
  getAdminJobs,
  cancelAdminJob,
  completeAdminJob,
  deleteAdminJob,
} from "../api/adminJobsApi";

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterMessage, setFilterMessage] = useState("");

  const [filters, setFilters] = useState({
    jobId: "",
    title: "",
    owner: "",
    location: "",
    county: "",
    status: "",
    startDate: "",
    endDate: "",
  });

  const [jobToDelete, setJobToDelete] = useState(null);
  const [jobToCancel, setJobToCancel] = useState(null);
  const [jobToComplete, setJobToComplete] = useState(null);

  useEffect(() => { loadJobs(); }, []);

  async function loadJobs() {
    try {
      setLoading(true);
      setError("");
      const data = await getAdminJobs();
      setJobs(data);
    } catch (err) {
      console.error(err);
      setError("Nu s-au putut încărca joburile.");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  }

  async function handleApplyFilters() {
    await loadJobs();
    setFilterMessage("Filtrele au fost aplicate.");
    setTimeout(() => setFilterMessage(""), 2000);
  }

  async function handleResetFilters() {
    setFilters({ jobId: "", title: "", owner: "", location: "", county: "", status: "", startDate: "", endDate: "" });
    setFilterMessage("");
    await loadJobs();
  }

  function handleCancel(job) {
    setJobToCancel(job);
  }

  async function confirmCancel() {
    if (!jobToCancel) return;
    try {
      await cancelAdminJob(jobToCancel.id);
      setJobToCancel(null);
      await loadJobs();
    } catch (err) {
      console.error(err);
      alert("Nu s-a putut anula jobul.");
    }
  }

  function handleComplete(job) {
    setJobToComplete(job);
  }

  async function confirmComplete() {
    if (!jobToComplete) return;
    try {
      await completeAdminJob(jobToComplete.id);
      setJobToComplete(null);
      await loadJobs();
    } catch (err) {
      console.error(err);
      alert("Nu s-a putut finaliza jobul.");
    }
  }

  async function handleDelete() {
    if (!jobToDelete) return;
    try {
      await deleteAdminJob(jobToDelete.id);
      setJobToDelete(null);
      await loadJobs();
    } catch (err) {
      console.error(err);
      alert("Nu s-a putut șterge jobul.");
    }
  }

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesJobId = !filters.jobId || (job.id || "").toLowerCase().includes(filters.jobId.toLowerCase());
      const matchesTitle = !filters.title || (job.title || "").toLowerCase().includes(filters.title.toLowerCase());
      const matchesOwner = !filters.owner || (job.postedBy || "").toLowerCase().includes(filters.owner.toLowerCase());
      const matchesLocation = !filters.location || (job.location || "").toLowerCase().includes(filters.location.toLowerCase());
      const matchesCounty = !filters.county || (job.county || "").toLowerCase().includes(filters.county.toLowerCase());
      const matchesStatus = !filters.status || job.status === filters.status;
      const matchesStartDate = !filters.startDate || (job.startDate && new Date(job.startDate) >= new Date(filters.startDate));
      const matchesEndDate = !filters.endDate || (job.endDate && new Date(job.endDate) <= new Date(filters.endDate + "T23:59:59"));
      return matchesJobId && matchesTitle && matchesOwner && matchesLocation && matchesCounty && matchesStatus && matchesStartDate && matchesEndDate;
    });
  }, [jobs, filters]);

  return (
    <AdminLayout title="Administrare joburi">
      <div className="admin-page-header">
        <h2 className="admin-page-header__title">Lista joburilor</h2>
        <p className="admin-page-header__subtitle">
          Poți filtra, anula, finaliza sau șterge joburile din platformă.
        </p>
      </div>

      <div className="admin-filters-box">
        <input type="text" name="jobId" placeholder="Job ID" value={filters.jobId} onChange={handleChange} className="admin-input" />
        <input type="text" name="title" placeholder="Titlu job" value={filters.title} onChange={handleChange} className="admin-input" />
        <input type="text" name="owner" placeholder="Owner (email)" value={filters.owner} onChange={handleChange} className="admin-input" />
        <input type="text" name="location" placeholder="Localitate" value={filters.location} onChange={handleChange} className="admin-input" />
        <input type="text" name="county" placeholder="Județ" value={filters.county} onChange={handleChange} className="admin-input" />
        <select name="status" value={filters.status} onChange={handleChange} className="admin-input">
          <option value="">Toate statusurile</option>
          <option value="OPEN">OPEN</option>
          <option value="FILLED">FILLED</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="CANCELED">CANCELED</option>
        </select>
        <input type="date" name="startDate" value={filters.startDate} onChange={handleChange} className="admin-input" />
        <input type="date" name="endDate" value={filters.endDate} onChange={handleChange} className="admin-input" />
        <button type="button" onClick={handleApplyFilters} className="admin-btn admin-btn--primary">Filtrează</button>
        <button type="button" onClick={handleResetFilters} className="admin-btn admin-btn--reset">Reset</button>
      </div>

      {filterMessage && <p className="admin-text--success">{filterMessage}</p>}
      {loading && <p>Se încarcă joburile...</p>}
      {error && <p className="admin-text--error">{error}</p>}

      {!loading && !error && filteredJobs.length === 0 && (
        <div className="admin-empty-box">Nu există joburi pentru filtrele selectate.</div>
      )}

      {!loading && !error && filteredJobs.length > 0 && (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Titlu</th>
                <th>Descriere</th>
                <th>Locație</th>
                <th>Județ</th>
                <th>Owner</th>
                <th>Start</th>
                <th>End</th>
                <th>Capacitate</th>
                <th>Status</th>
                <th>Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map((job) => (
                <tr key={job.id}>
                  <td data-label="ID" className="td--id">{job.id}</td>
                  <td data-label="Titlu">{job.title}</td>
                  <td data-label="Descriere" style={{ maxWidth: "220px", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{job.description || "-"}</td>
                  <td data-label="Locație">{job.location || "-"}</td>
                  <td data-label="Județ">{job.county || "-"}</td>
                  <td data-label="Owner">{job.postedBy}</td>
                  <td data-label="Start">{job.startDate ? new Date(job.startDate).toLocaleString("ro-RO") : "-"}</td>
                  <td data-label="End">{job.endDate ? new Date(job.endDate).toLocaleString("ro-RO") : "-"}</td>
                  <td data-label="Capacitate">{(job.acceptedWorkers ?? 0)} / {job.neededWorkers ?? 0}</td>
                  <td data-label="Status"><StatusBadge status={job.status} /></td>
                  <td data-label="Acțiuni" className="td--actions">
                    <div className="admin-actions">
                      {job.status !== "CANCELED" && job.status !== "COMPLETED" && (
                        <>
                          <button className="admin-action-btn admin-action-btn--cancel" onClick={() => handleCancel(job)}>Anulează</button>
                          <button className="admin-action-btn admin-action-btn--complete" onClick={() => handleComplete(job)}>Finalizează</button>
                        </>
                      )}
                      <button className="admin-action-btn admin-action-btn--delete" onClick={() => setJobToDelete(job)}>Șterge</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        open={!!jobToDelete}
        title="Ștergere job"
        message={jobToDelete ? `Ești sigur că vrei să ștergi jobul "${jobToDelete.title}"?` : "Ești sigur că vrei să ștergi acest job?"}
        confirmText="Șterge"
        cancelText="Renunță"
        onCancel={() => setJobToDelete(null)}
        onConfirm={handleDelete}
        danger
      />
      <ConfirmModal
        open={!!jobToCancel}
        title="Anulare job"
        message={jobToCancel ? `Ești sigur că vrei să anulezi jobul "${jobToCancel.title}"?` : "Ești sigur că vrei să anulezi acest job?"}
        confirmText="Anulează"
        cancelText="Renunță"
        onCancel={() => setJobToCancel(null)}
        onConfirm={confirmCancel}
        danger
      />
      <ConfirmModal
        open={!!jobToComplete}
        title="Finalizare job"
        message={jobToComplete ? `Ești sigur că vrei să marchezi jobul "${jobToComplete.title}" ca finalizat?` : "Ești sigur că vrei să finalizezi acest job?"}
        confirmText="Finalizează"
        cancelText="Renunță"
        onCancel={() => setJobToComplete(null)}
        onConfirm={confirmComplete}
      />
    </AdminLayout>
  );
}