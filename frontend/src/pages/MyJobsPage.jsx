import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyJobs, cancelJob, completeJob, deleteJob } from "../api/jobApi";
import "../styles/auth.css";

export default function MyJobsPage() {
  const { user } = useAuth();

  const [myJobs, setMyJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Modal states
  const [cancelModalJobId, setCancelModalJobId] = useState(null);
  const [completeModalJobId, setCompleteModalJobId] = useState(null);
  const [deleteModalJobId, setDeleteModalJobId] = useState(null);
  const [isActioning, setIsActioning] = useState(false);

  const fetchMyJobs = async () => {
    try {
      setError("");
      setLoading(true);
      const data = await getMyJobs();
      setMyJobs(data);
    } catch (err) {
      console.log("EROARE MY JOBS", err);
      setError("Nu am putut încărca joburile tale.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email) fetchMyJobs();
  }, [user]);

  const handleCancel = async () => {
    try {
      setIsActioning(true);
      await cancelJob(cancelModalJobId);
      setMessage("Jobul a fost anulat.");
      setCancelModalJobId(null);
      await fetchMyJobs();
    } catch (err) {
      setMessage("Nu s-a putut anula jobul.");
    } finally {
      setIsActioning(false);
    }
  };

  const handleComplete = async () => {
    try {
      setIsActioning(true);
      await completeJob(completeModalJobId);
      setMessage("Jobul a fost marcat ca finalizat.");
      setCompleteModalJobId(null);
      await fetchMyJobs();
    } catch (err) {
      setMessage("Nu s-a putut finaliza jobul.");
    } finally {
      setIsActioning(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsActioning(true);
      await deleteJob(deleteModalJobId);
      setMessage("Jobul a fost șters.");
      setDeleteModalJobId(null);
      await fetchMyJobs();
    } catch (err) {
      setMessage("Nu s-a putut șterge jobul.");
    } finally {
      setIsActioning(false);
    }
  };

  const getStatusLabel = (status) => {
    const map = {
      OPEN: "Deschis",
      FILLED: "Locuri ocupate",
      IN_PROGRESS: "În desfășurare",
      COMPLETED: "Finalizat",
      CANCELED: "Anulat",
    };
    return map[status] || status;
  };

  const getStatusStyle = (status) => {
    const styles = {
      OPEN:        { background: "rgba(220,252,231,0.9)", color: "#166534", border: "1px solid rgba(134,239,172,0.6)" },
      FILLED:      { background: "rgba(254,249,195,0.9)", color: "#854d0e", border: "1px solid rgba(253,224,71,0.6)" },
      IN_PROGRESS: { background: "rgba(219,234,254,0.9)", color: "#1e40af", border: "1px solid rgba(147,197,253,0.6)" },
      COMPLETED:   { background: "rgba(237,233,254,0.9)", color: "#5b21b6", border: "1px solid rgba(196,181,253,0.6)" },
      CANCELED:    { background: "rgba(254,226,226,0.9)", color: "#991b1b", border: "1px solid rgba(252,165,165,0.6)" },
    };
    return styles[status] || {};
  };

  if (loading) return <div style={{ padding: "20px", color: "#333" }}>Se încarcă joburile tale...</div>;
  if (error) return <div style={{ padding: "20px", color: "#dc2626" }}>{error}</div>;

  return (
    <section className="page">

      {message && (
        <p style={{
          background: "#7c3aed",
          color: "#fff",
          padding: "12px 16px",
          borderRadius: "8px",
          marginBottom: "16px",
          fontSize: "14px",
        }}>
          {message}
        </p>
      )}

      {myJobs.length === 0 ? (
        <div className="card" style={{ textAlign: "center" }}>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "15px" }}>
            Nu ai postat încă niciun job.
          </p>
        </div>
      ) : (
        <div className="jobs-list">
          {myJobs.map((job) => {
            const jobId = job.id || job._id;
            const isClosed = job.status === "CANCELED" || job.status === "COMPLETED";

            return (
              <div key={jobId} className="card">
                <h3 className="job-title">{job.title}</h3>

                {/* Status badge */}
                <div style={{ marginBottom: "12px" }}>
                  <span style={{
                    ...getStatusStyle(job.status),
                    padding: "4px 10px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "600",
                  }}>
                    {getStatusLabel(job.status)}
                  </span>
                </div>

                <div className="job-meta">
                  <span className="job-meta__item">
                    <svg className="job-meta__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                      <circle cx="12" cy="9" r="2.5"/>
                    </svg>
                    {job.location ? `${job.location}${job.county ? `, ${job.county}` : ""}` : "Locație nespecificată"}
                  </span>

                  <span className="job-meta__item">
                    <svg className="job-meta__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                    {job.acceptedWorkers ?? 0} / {job.neededWorkers ?? 0} locuri ocupate
                  </span>

                  <span className="job-meta__item">
                    <svg className="job-meta__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="1" x2="12" y2="23"/>
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                    </svg>
                    {job.salary ?? 0} RON
                  </span>

                  <span className="job-meta__item">
                    <svg className="job-meta__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    {job.startDate
                      ? new Date(job.startDate).toLocaleString("ro-RO", { dateStyle: "medium", timeStyle: "short" })
                      : "Dată nespecificată"}
                    {" — "}
                    {job.endDate
                      ? new Date(job.endDate).toLocaleString("ro-RO", { dateStyle: "medium", timeStyle: "short" })
                      : "Nespecificat"}
                  </span>
                </div>

                {/* Butoane owner */}
                <div className="owner-actions">
                  <Link to={`/jobs/${jobId}`} className="icon-btn icon-btn--info" title="Vezi detalii">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="16" x2="12" y2="12"/>
                      <line x1="12" y1="8" x2="12.01" y2="8"/>
                    </svg>
                    Info
                  </Link>

                  <Link to={`/jobs/${jobId}/edit`} className="icon-btn icon-btn--edit" title="Editează">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Edit
                  </Link>

                  

                  <button
                    className="icon-btn icon-btn--delete"
                    title="Șterge job"
                    onClick={() => setDeleteModalJobId(jobId)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                      <path d="M10 11v6"/><path d="M14 11v6"/>
                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                    </svg>
                    Șterge
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {/* Modal Ștergere */}
      {deleteModalJobId && (
        <ConfirmModal
          title="Șterge job"
          message="Ești sigur că vrei să ștergi acest job? Acțiunea este ireversibilă."
          confirmLabel="Șterge"
          confirmStyle={{ background: "#dc2626" }}
          onConfirm={handleDelete}
          onCancel={() => setDeleteModalJobId(null)}
          isLoading={isActioning}
        />
      )}
    </section>
  );
}

/* Modal generic reutilizabil */
function ConfirmModal({ title, message, confirmLabel, confirmStyle, onConfirm, onCancel, isLoading }) {
  return (
    <div style={{
      position: "fixed", top: 0, left: 0,
      width: "100%", height: "100%",
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 9999,
    }}>
      <div role="dialog" aria-modal="true" style={{
        backgroundColor: "white",
        padding: "28px 24px",
        borderRadius: "10px",
        minWidth: "300px",
        maxWidth: "420px",
        width: "90vw",
        textAlign: "center",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
      }}>
        <h3 style={{ marginBottom: "10px", fontSize: "18px", color: "#111" }}>{title}</h3>
        <p style={{ marginBottom: "24px", color: "#555", fontSize: "14px", lineHeight: "1.5" }}>{message}</p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            style={{
              padding: "10px 24px",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "14px",
              ...confirmStyle,
            }}
          >
            {isLoading ? "Se procesează..." : confirmLabel}
          </button>
          <button
            onClick={onCancel}
            disabled={isLoading}
            style={{
              padding: "10px 24px",
              background: "#f3f4f6",
              color: "#333",
              border: "1px solid #ddd",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "14px",
            }}
          >
            Anulează
          </button>
        </div>
      </div>
    </div>
  );
}