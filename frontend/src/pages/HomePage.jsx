import { useCallback, useEffect, useState } from "react";
import DatePickerInput from "../components/DatePickerInput";
import { useAuth } from "../context/AuthContext";
import {
  getAllJobs,
  applyToJob,
  getMyApplications,
  deleteJob,
} from "../api/jobApi";
import { useNavigate, Link } from "react-router-dom";

function HomePage() {
  const { user, isAuthenticated, logout } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [appliedJobIds, setAppliedJobIds] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [error, setError] = useState("");
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const [deleteModalJobId, setDeleteModalJobId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [filterStartDate, setFilterStartDate] = useState(null);
  const [filterEndDate, setFilterEndDate] = useState(null);
  const [filterLocation, setFilterLocation] = useState("");
  const [filterParticipants, setFilterParticipants] = useState("");

  const navigate = useNavigate();

  const [debouncedLocation, setDebouncedLocation] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedLocation(filterLocation), 500);
    return () => clearTimeout(timer);
  }, [filterLocation]);

  const fetchJobs = useCallback(async (customFilters = null) => {
    try {
      setLoadingJobs(true);
      setError("");
      const filters = customFilters || {};
      const data = await getAllJobs(filters);
      setJobs(data);
      if (isAuthenticated) {
        const myApplications = await getMyApplications();
        const ids = myApplications.map((application) => application.jobId);
        setAppliedJobIds(ids);
      } else {
        setAppliedJobIds([]);
      }
    } catch (err) {
      console.log("EROARE HOME PAGE", err);
      setError("Nu am putut încărca joburile.");
    } finally {
      setLoadingJobs(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const filters = {};
    if (filterStartDate) filters.startDate = filterStartDate.toISOString().slice(0, 19);
    if (filterEndDate) filters.endDate = filterEndDate.toISOString().slice(0, 19);
    if (debouncedLocation.trim()) filters.location = debouncedLocation.trim();
    if (filterParticipants) filters.participants = Number(filterParticipants);
    fetchJobs(Object.keys(filters).length > 0 ? filters : null);
  }, [isAuthenticated, filterStartDate, filterEndDate, debouncedLocation, filterParticipants, fetchJobs]);

  const handleAddJobClick = () => {
    if (isAuthenticated) navigate("/add-job");
    else navigate("/login", { state: { redirectTo: "/add-job" } });
  };

  const handleResetFilters = () => {
    setFilterStartDate(null);
    setFilterEndDate(null);
    setFilterLocation("");
    setFilterParticipants("");
  };

  const handleApplyClick = (e, job) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate("/login", { state: { redirectTo: "/" } });
      return;
    }
    const jobId = job.id || job._id;
    const isOwner = isAuthenticated && (user?.email === job.postedBy || user?.email === job.ownerEmail || user?.id === job.ownerId);
    const isFilled = job.status === "FILLED" || (job.neededWorkers != null && job.acceptedWorkers != null && job.acceptedWorkers >= job.neededWorkers);
    const isClosed = job.status === "CANCELED" || job.status === "COMPLETED";
    const isInProgress = job.status === "IN_PROGRESS";

    if (isOwner) { setError("Nu poți aplica la propriul job."); return; }
    if (appliedJobIds.includes(jobId)) { setError("Ai aplicat deja la acest job."); return; }
    if (isClosed) { setError("Nu poți aplica la un job închis."); return; }
    if (isInProgress) { setError("Jobul este deja în desfășurare."); return; }
    if (isFilled) { setError("Locurile pentru acest job s-au ocupat."); return; }

    setError("");
    setSelectedJob(job);
    setShowApplyModal(true);
  };

  const confirmApply = async () => {
    if (!selectedJob) return;
    const jobId = selectedJob.id || selectedJob._id;
    try {
      setIsApplying(true);
      setError("");
      await applyToJob(jobId);
      setAppliedJobIds((prev) => [...prev, jobId]);
      setShowApplyModal(false);
      setSelectedJob(null);
      await fetchJobs();
    } catch (err) {
      console.log("EROARE APPLY", err);
      setError("Nu s-a putut trimite aplicarea.");
    } finally {
      setIsApplying(false);
    }
  };

  const closeApplyModal = () => {
    setShowApplyModal(false);
    setSelectedJob(null);
  };

  const handleDeleteJob = async () => {
    if (!deleteModalJobId) return;
    try {
      setIsDeleting(true);
      await deleteJob(deleteModalJobId);
      setJobs((prevJobs) => prevJobs.filter((job) => (job.id || job._id) !== deleteModalJobId));
      setDeleteModalJobId(null);
    } catch (err) {
      console.error("Eroare la ștergerea jobului:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <section className="page">

      {isAuthenticated && (
        <div className="welcome-banner">
          <p className="welcome-banner__text">
            Bine ai venit, {user.firstName}!
          </p>
        </div>
      )}

      <div className="jobs-section">

        <div className="card" style={{ marginBottom: "20px" }}>
          <h3 style={{ marginBottom: "24px" }}>Filtre</h3>
          <div className="user-box">
            <input type="text" placeholder=" " value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)} />
            <label>Locație</label>
          </div>
          <DatePickerInput label="Data de start minimă" selected={filterStartDate} onChange={(date) => setFilterStartDate(date)} showTime={false} />
          <DatePickerInput label="Data de final maximă" selected={filterEndDate} onChange={(date) => setFilterEndDate(date)} showTime={false} />
          <div className="user-box">
            <input type="number" min="1" placeholder=" " value={filterParticipants} onChange={(e) => setFilterParticipants(e.target.value)} />
            <label>Număr minim participanți</label>
          </div>
          <div style={{ display: "flex", gap: "10px", marginTop: "8px", flexWrap: "wrap" }}>
            <button className="primary-button" style={{ flex: 1 }} onClick={handleResetFilters}>
              Resetează filtrele
            </button>
          </div>
        </div>

        {loadingJobs && <p>Se încarcă joburile...</p>}
        {error && <p className="error-message">{error}</p>}

        {!loadingJobs && !error && jobs.length === 0 && (
          <p>Nu există joburi disponibile momentan.</p>
        )}

        {!loadingJobs && !error && jobs.length > 0 && (
          <div className="jobs-list">
            {jobs.map((job) => {
              const jobId = job.id || job._id;
              const isOwner = isAuthenticated && (user?.email === job.postedBy || user?.email === job.ownerEmail || user?.id === job.ownerId);
              const hasApplied = appliedJobIds.includes(jobId);
              const isFilled = job.status === "FILLED" || (job.neededWorkers != null && job.acceptedWorkers != null && job.acceptedWorkers >= job.neededWorkers);
              const isClosed = job.status === "CANCELED" || job.status === "COMPLETED";
              const isInProgress = job.status === "IN_PROGRESS";

              return (
                <div key={jobId} className="card" onClick={() => navigate(`/jobs/${jobId}`)} style={{ cursor: "pointer" }}>
                  <h3 className="job-title">{job.title}</h3>

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
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                      </svg>
                      {job.startDate ? new Date(job.startDate).toLocaleString("ro-RO", { dateStyle: "medium", timeStyle: "short" }) : "Dată nespecificată"}
                      {" — "}
                      {job.endDate ? new Date(job.endDate).toLocaleString("ro-RO", { dateStyle: "medium", timeStyle: "short" }) : "Nespecificat"}
                    </span>
                  </div>

                  <div className="job-actions">
                    {isOwner ? (
                      <div className="owner-actions">
                        <Link to={`/jobs/${jobId}`} className="icon-btn icon-btn--info" title="Detalii job" onClick={(e) => e.stopPropagation()}>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                          </svg>
                          Info
                        </Link>
                        <Link to={`/jobs/${jobId}/edit`} className="icon-btn icon-btn--edit" title="Editează job" onClick={(e) => e.stopPropagation()}>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                          Edit
                        </Link>
                        <button className="icon-btn icon-btn--delete" title="Șterge job" onClick={(e) => { e.stopPropagation(); setDeleteModalJobId(jobId); }}>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                            <path d="M10 11v6"/><path d="M14 11v6"/>
                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                          </svg>
                          Delete
                        </button>
                      </div>
                    ) : hasApplied ? (
                      <Link to={`/jobs/${jobId}`} className="status-box applied-box" style={{ textDecoration: "none", cursor: "pointer" }}>
                        Ai aplicat deja
                      </Link>
                    ) : isClosed ? (
                      <div className="status-box filled-box">Jobul nu mai este disponibil</div>
                    ) : isInProgress ? (
                      <div className="status-box filled-box">Job în desfășurare</div>
                    ) : isFilled ? (
                      <div className="status-box" style={{
                        background: "rgba(254,249,195,0.9)", color: "#854d0e",
                        border: "1px solid rgba(253,224,71,0.6)", padding: "10px 14px",
                        borderRadius: "8px", fontWeight: "600", fontSize: "13px",
                      }}>
                        Locuri momentan ocupate — poate deveni disponibil
                      </div>
                    ) : (
                      <>
                        <Link to={`/jobs/${jobId}`} className="primary-button" onClick={(e) => e.stopPropagation()}>
                          Vezi detalii
                        </Link>
                        <button
                          className="primary-button"
                          onClick={(e) => handleApplyClick(e, job)}
                        >
                          Aplică la job
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <button className="primary-button" onClick={handleAddJobClick}>
        Postează un job
      </button>

      {/* ── Modal aplicare ── */}
      {showApplyModal && selectedJob && (
        <div style={{
          position: "fixed", inset: 0,
          backgroundColor: "rgba(0,0,0,0.55)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 9999,
        }}>
          <div role="dialog" aria-modal="true" style={{
            backgroundColor: "white",
            padding: "28px 24px",
            borderRadius: "12px",
            minWidth: "300px",
            maxWidth: "420px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          }}>
            <h3 style={{ marginBottom: 10, color: "var(--color-text-dark)", fontSize: "18px", fontWeight: "700" }}>
              Confirmare aplicare
            </h3>
            <p style={{ color: "var(--color-text-medium)", marginBottom: 24, lineHeight: 1.5 }}>
              Sigur vrei să aplici la jobul <strong style={{ color: "var(--color-primary)" }}>{selectedJob.title}</strong>?
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                className="primary-button"
                onClick={confirmApply}
                disabled={isApplying}
                style={{ flex: 1 }}
              >
                {isApplying ? "Se trimite..." : "Da, aplică"}
              </button>
              <button
                className="primary-button"
                onClick={closeApplyModal}
                disabled={isApplying}
                style={{ flex: 1, background: "var(--color-neutral-light)", color: "var(--color-text-dark)" }}
              >
                Renunță
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal ștergere job ── */}
      {deleteModalJobId && (
        <div style={{
          position: "fixed", inset: 0,
          backgroundColor: "rgba(0,0,0,0.55)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 9999,
        }}>
          <div role="dialog" aria-modal="true" style={{
            backgroundColor: "white",
            padding: "28px 24px",
            borderRadius: "12px",
            minWidth: "300px",
            maxWidth: "420px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          }}>
            <h3 style={{ marginBottom: 10, color: "var(--color-text-dark)", fontSize: "18px", fontWeight: "700" }}>
              Șterge job
            </h3>
            <p style={{ color: "var(--color-text-medium)", marginBottom: 24, lineHeight: 1.5 }}>
              Ești sigur că vrei să ștergi acest job? Acțiunea este ireversibilă.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                className="primary-button"
                onClick={handleDeleteJob}
                disabled={isDeleting}
                style={{ flex: 1, background: "var(--color-error)", color: "var(--color-text-light)" }}
              >
                {isDeleting ? "Se șterge..." : "Șterge"}
              </button>
              <button
                className="primary-button"
                onClick={() => setDeleteModalJobId(null)}
                disabled={isDeleting}
                style={{ flex: 1, background: "var(--color-neutral-light)", color: "var(--color-text-dark)" }}
              >
                Anulează
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default HomePage;