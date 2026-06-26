import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyJobs, completeJob, deleteJob } from "../api/jobApi";
import StatusBadge from "../components/StatusBadge";
import {
  IconLocation, IconUsers, IconMoney,
  IconEdit, IconCheck, IconTrash, IconInfo,
} from "../components/Icons";

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
      

      

      {myJobs.length === 0 ? (
        <>
          <div className="empty-state-box">
            <p className="empty-state-box__text">
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

            return (
              <div key={jobId} className="card" style={{ cursor: "pointer" }} onClick={() => navigate(`/jobs/${jobId}`)}>

                <div className="job-title">{job.title}</div>

                <StatusBadge status={job.status || "open"} />

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

      {deleteModalJobId && (
        <div className="modal-overlay">
          <div role="dialog" aria-modal="true" className="modal-dialog">
            <h3 className="modal-dialog__title">Șterge job</h3>
            <p className="modal-dialog__body">
              Ești sigur că vrei să ștergi acest job? Acțiunea este ireversibilă.
            </p>
            <div className="modal-dialog__actions">
              <button className="primary-button modal-dialog__btn-danger" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? "Se șterge..." : "Șterge"}
              </button>
              <button className="primary-button modal-dialog__btn-cancel" onClick={() => setDeleteModalJobId(null)} disabled={isDeleting}>
                Anulează
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}