import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyJobs, completeJob, deleteJob } from "../api/jobApi";

const STATUS_LABEL = {
  OPEN: "Deschis", FILLED: "Complet", IN_PROGRESS: "În desfășurare",
  COMPLETED: "Finalizat", CANCELED: "Anulat",
};

const STATUS_COLORS = {
  OPEN:        { background: "rgba(255,255,255,0.15)", color: "#fff",     border: "1px solid rgba(255,255,255,0.4)" },
  FILLED:      { background: "rgba(251,191,36,0.2)",  color: "#fde68a",  border: "1px solid rgba(251,191,36,0.4)" },
  IN_PROGRESS: { background: "rgba(96,165,250,0.2)",  color: "#bfdbfe",  border: "1px solid rgba(96,165,250,0.4)" },
  COMPLETED:   { background: "rgba(52,211,153,0.2)",  color: "#a7f3d0",  border: "1px solid rgba(52,211,153,0.4)" },
  CANCELED:    { background: "rgba(248,113,113,0.2)", color: "#fecaca",  border: "1px solid rgba(248,113,113,0.4)" },
};

const IconLocation = () => (
  <svg className="job-meta__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const IconUsers = () => (
  <svg className="job-meta__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IconMoney = () => (
  <svg className="job-meta__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);
const IconEdit = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconTrash = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);
const IconInfo = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
  </svg>
);

export default function MyJobsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [myJobs, setMyJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [deleteModalJobId, setDeleteModalJobId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isAdmin = user?.role === "ADMINISTRATOR";

  const fetchMyJobs = async () => {
    try {
      setError("");
      setLoading(true);
      const data = await getMyJobs();
      setMyJobs(data);
    } catch (err) {
      setError("Nu am putut încărca joburile tale.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email) fetchMyJobs();
  }, [user]);

  const handleComplete = async (jobId) => {
    try {
      await completeJob(jobId);
      setMessage("Jobul a fost marcat ca finalizat.");
      await fetchMyJobs();
    } catch {
      setMessage("Nu s-a putut finaliza jobul.");
    }
  };

  const handleDelete = async () => {
    if (!deleteModalJobId) return;
    try {
      setIsDeleting(true);
      await deleteJob(deleteModalJobId);
      setMessage("Jobul a fost șters.");
      setDeleteModalJobId(null);
      await fetchMyJobs();
    } catch {
      setMessage("Nu s-a putut șterge jobul.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) return <div className="page"><p>Se încarcă joburile tale...</p></div>;
  if (error)   return <div className="page"><p className="error-message">{error}</p></div>;

  return (
    <div className="page">
      

      {message && (
        <p style={{ color: "#16a34a", fontWeight: 600, marginBottom: 12 }}>{message}</p>
      )}

      {myJobs.length === 0 ? (
        <>
          <div style={{
            background: "#40826D", borderRadius: "12px", padding: "24px 28px",
            marginBottom: "20px", boxShadow: "0 4px 16px rgba(64,130,109,0.35)",
            textAlign: "center", marginTop: "20px",
          }}>
            <p style={{ color: "#ffffff", fontSize: "16px", fontWeight: "600", margin: 0 }}>
              {isAdmin
                ? "Nu există joburi postate de acest cont administrator."
                : "Nu ai postat încă niciun job. Publică primul tău job acum!"}
            </p>
          </div>
          {!isAdmin && (
            <button className="primary-button" onClick={() => navigate("/add-job")}>
              Publică un job
            </button>
          )}
        </>
      ) : (
        <>
          {myJobs.map((job) => {
            const jobId = job.id || job._id;
            const isClosed = job.status === "CANCELED" || job.status === "COMPLETED";
            const s = STATUS_COLORS[job.status] || STATUS_COLORS.OPEN;

            return (
              <div key={jobId} className="card" style={{ cursor: "pointer" }} onClick={() => navigate(`/jobs/${jobId}`)}>

                <div className="job-title">{job.title}</div>

                <span style={{
                  ...s,
                  display: "inline-block", padding: "3px 14px",
                  borderRadius: "999px", fontSize: "13px", fontWeight: 600,
                  marginBottom: "16px",
                }}>
                  {STATUS_LABEL[job.status] || job.status}
                </span>

                <div className="job-meta">
                  {job.location && (
                    <div className="job-meta__item">
                      <IconLocation />
                      <span>{job.location}{job.county ? `, ${job.county}` : ""}</span>
                    </div>
                  )}
                  <div className="job-meta__item">
                    <IconUsers />
                    <span>{job.acceptedWorkers ?? 0} / {job.neededWorkers ?? "?"} locuri ocupate</span>
                  </div>
                  {job.salary != null && (
                    <div className="job-meta__item">
                      <IconMoney />
                      <span>{job.salary} RON</span>
                    </div>
                  )}
                </div>

                <div className="owner-actions" onClick={(e) => e.stopPropagation()}>
                  <Link to={`/jobs/${jobId}`} className="icon-btn icon-btn--info" onClick={(e) => e.stopPropagation()}>
                    <IconInfo /> Detalii
                  </Link>
                  {!isClosed && (
                    <>
                      <Link to={`/jobs/${jobId}/edit`} className="icon-btn icon-btn--edit" onClick={(e) => e.stopPropagation()}>
                        <IconEdit /> Editează
                      </Link>
                      <button className="icon-btn icon-btn--info" onClick={(e) => { e.stopPropagation(); handleComplete(jobId); }}>
                        <IconCheck /> Finalizează
                      </button>
                    </>
                  )}
                  <button className="icon-btn icon-btn--delete" onClick={(e) => { e.stopPropagation(); setDeleteModalJobId(jobId); }}>
                    <IconTrash /> Șterge
                  </button>
                </div>
              </div>
            );
          })}

          {!isAdmin && (
            <button className="primary-button" style={{ marginTop: "8px" }} onClick={() => navigate("/add-job")}>
              Publică un job nou
            </button>
          )}
        </>
      )}

      {/* Modal confirmare ștergere */}
      {deleteModalJobId && (
        <div style={{
          position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.55)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999,
        }}>
          <div role="dialog" aria-modal="true" style={{
            backgroundColor: "white", padding: "28px 24px", borderRadius: "12px",
            minWidth: "300px", maxWidth: "420px", boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          }}>
            <h3 style={{ marginBottom: 10, color: "#111", fontSize: "18px", fontWeight: "700" }}>Șterge job</h3>
            <p style={{ color: "#444", marginBottom: 24, lineHeight: 1.5 }}>
              Ești sigur că vrei să ștergi acest job? Acțiunea este ireversibilă.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="primary-button" onClick={handleDelete} disabled={isDeleting}
                style={{ flex: 1, background: "#dc2626", color: "#fff" }}>
                {isDeleting ? "Se șterge..." : "Șterge"}
              </button>
              <button className="primary-button" onClick={() => setDeleteModalJobId(null)} disabled={isDeleting}
                style={{ flex: 1, background: "#e5e7eb", color: "#111" }}>
                Anulează
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}