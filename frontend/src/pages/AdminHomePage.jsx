import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getAllJobs,
  applyToJob,
  getMyApplications,
  deleteJob,
  cancelJob,
  completeJob,
} from "../api/jobApi";
import { useNavigate, Link } from "react-router-dom";

function AdminHomePage() {
  const { user, isAuthenticated, logout } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [appliedJobIds, setAppliedJobIds] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);

  const navigate = useNavigate();

  const fetchJobs = async () => {
    try {
      setLoadingJobs(true);
      setError("");
      setMessage("");

      const data = await getAllJobs();
      setJobs(data);

      if (isAuthenticated) {
        const myApplications = await getMyApplications();
        const ids = myApplications.map((application) => application.jobId);
        setAppliedJobIds(ids);
      } else {
        setAppliedJobIds([]);
      }
    } catch (err) {
      console.log("EROARE ADMIN HOME PAGE", err);
      setError("Nu am putut încărca joburile.");
    } finally {
      setLoadingJobs(false);
    }
  };

  useEffect(() => {
    fetchJobs();

    const handleClickOutside = (event) => {
      const clickedInsideMenu = event.target.closest(".job-owner-menu");
      if (!clickedInsideMenu) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isAuthenticated]);

  const handleAddJobClick = () => {
    if (isAuthenticated) {
      navigate("/add-job");
    } else {
      navigate("/login", {
        state: { redirectTo: "/add-job" },
      });
    }
  };

  const handleApplyClick = (job) => {
    if (!isAuthenticated) {
      navigate("/login", {
        state: { redirectTo: "/admin" },
      });
      return;
    }

    const jobId = job.id || job._id;

    const isOwner =
      user &&
      (user.email === job.postedBy ||
        user.email === job.ownerEmail ||
        user.id === job.ownerId);

    const hasApplied = appliedJobIds.includes(jobId);

    const isFilled =
      job.status === "FILLED" ||
      (job.neededWorkers != null &&
        job.acceptedWorkers != null &&
        job.acceptedWorkers >= job.neededWorkers);

    const isClosed =
      job.status === "CANCELED" || job.status === "COMPLETED";

    const isInProgress = job.status === "IN_PROGRESS";

    if (isOwner) {
      setMessage("Nu poți aplica la propriul job.");
      return;
    }

    if (hasApplied) {
      setMessage("Ai aplicat deja la acest job.");
      return;
    }

    if (isClosed) {
      setMessage("Nu poți aplica la un job închis.");
      return;
    }

    if (isInProgress) {
      setMessage("Jobul este deja în desfășurare.");
      return;
    }

    if (isFilled) {
      setMessage("Locurile pentru acest job s-au ocupat.");
      return;
    }

    setMessage("");
    setSelectedJob(job);
    setShowApplyModal(true);
  };

  const confirmApply = async () => {
    if (!selectedJob) return;

    const jobId = selectedJob.id || selectedJob._id;

    try {
      setIsApplying(true);
      setMessage("");

      await applyToJob(jobId);

      setAppliedJobIds((prev) => [...prev, jobId]);
      setShowApplyModal(false);
      setSelectedJob(null);

      await fetchJobs();
      setMessage("Aplicarea a fost trimisă cu succes.");
    } catch (err) {
      console.log("EROARE APPLY ADMIN", err);
      setMessage("Nu s-a putut trimite aplicarea.");
    } finally {
      setIsApplying(false);
    }
  };

  const closeApplyModal = () => {
    setShowApplyModal(false);
    setSelectedJob(null);
  };

  const handleDeleteJob = async (jobId) => {
    const confirmDelete = window.confirm("Sigur vrei să ștergi acest job?");
    if (!confirmDelete) return;

    try {
      await deleteJob(jobId);
      setJobs((prevJobs) => prevJobs.filter((job) => (job.id || job._id) !== jobId));
      setOpenMenuId(null);
      setMessage("Jobul a fost șters.");
    } catch (err) {
      console.error("Eroare la ștergerea jobului:", err);
      setMessage("Nu s-a putut șterge jobul.");
    }
  };

  const handleCancelJob = async (jobId) => {
    try {
      await cancelJob(jobId);
      setMessage("Jobul a fost anulat.");
      setOpenMenuId(null);
      await fetchJobs();
    } catch (err) {
      console.error("EROARE CANCEL JOB", err);
      setMessage("Nu s-a putut anula jobul.");
    }
  };

  const handleCompleteJob = async (jobId) => {
    try {
      await completeJob(jobId);
      setMessage("Jobul a fost marcat ca finalizat.");
      setOpenMenuId(null);
      await fetchJobs();
    } catch (err) {
      console.error("EROARE COMPLETE JOB", err);
      setMessage("Nu s-a putut finaliza jobul.");
    }
  };

  if (!isAuthenticated || user?.role !== "ADMINISTRATOR") {
    return (
      <section className="page">
        <h1>Acces interzis</h1>
        <p>Doar administratorii pot accesa această pagină.</p>
      </section>
    );
  }

  return (
    <section className="page">
      <h1>Panou administrator</h1>

      <div className="card">
        <p>Bine ai venit, {user.firstName}!</p>
        <p>
          <strong>Rol:</strong> {user.role}
        </p>

        <button className="primary-button" onClick={logout}>
          Logout
        </button>
      </div>

      <div className="jobs-section">
        <h2>Toate joburile vizibile</h2>

        {loadingJobs && <p>Se încarcă joburile...</p>}
        {error && <p className="error-message">{error}</p>}
        {message && <p>{message}</p>}

        {!loadingJobs && !error && jobs.length === 0 && (
          <p>Nu există joburi disponibile momentan.</p>
        )}

        {!loadingJobs && !error && jobs.length > 0 && (
          <div className="jobs-list">
            {jobs.map((job) => {
              const jobId = job.id || job._id;

              const isOwner =
                user &&
                (user.email === job.postedBy ||
                  user.email === job.ownerEmail ||
                  user.id === job.ownerId);

              const hasApplied = appliedJobIds.includes(jobId);

              const isFilled =
                job.status === "FILLED" ||
                (job.neededWorkers != null &&
                  job.acceptedWorkers != null &&
                  job.acceptedWorkers >= job.neededWorkers);

              const isClosed =
                job.status === "CANCELED" || job.status === "COMPLETED";

              const isInProgress = job.status === "IN_PROGRESS";

              return (
                <div key={jobId} className="card">
                  <h3>{job.title}</h3>

                  <p>
                    <strong>Descriere:</strong> {job.description || "Fără descriere"}
                  </p>

                  <p>
                    <strong>Status:</strong> {job.status}
                  </p>

                  <p>
                    <strong>Locuri ocupate:</strong> {job.acceptedWorkers ?? 0}/{job.neededWorkers ?? 0}
                  </p>

                  <p>
                    <strong>Salariu:</strong> {job.salary ?? "0"}
                  </p>

                  <p>
                    <strong>Locație:</strong> {job.location || "Nespecificată"}
                  </p>

                  <p>
                    <strong>Postat de:</strong> {job.postedBy || "Necunoscut"}
                  </p>

                  <p>
                    <strong>Start:</strong>{" "}
                    {job.startDate
                      ? new Date(job.startDate).toLocaleString("ro-RO")
                      : "Nespecificat"}
                  </p>

                  <p>
                    <strong>Final:</strong>{" "}
                    {job.endDate
                      ? new Date(job.endDate).toLocaleString("ro-RO")
                      : "Nespecificat"}
                  </p>

                  {!isOwner && (
                    <div style={{ marginBottom: "10px" }}>
                      {hasApplied ? (
                        <div className="status-box applied-box">
                          Ai aplicat deja
                        </div>
                      ) : isClosed ? (
                        <div className="status-box filled-box">
                          Jobul nu mai este disponibil
                        </div>
                      ) : isInProgress ? (
                        <div className="status-box filled-box">
                          Job în desfășurare
                        </div>
                      ) : isFilled ? (
                        <div className="status-box filled-box">
                          Locurile pentru acest job s-au ocupat
                        </div>
                      ) : (
                        <button
                          className="primary-button"
                          onClick={() => handleApplyClick(job)}
                        >
                          Aplică la job
                        </button>
                      )}
                    </div>
                  )}

                  <div className="job-actions">
                    <Link to={`/jobs/${jobId}`} className="primary-button">
                      Vezi detalii
                    </Link>

                    <div className="job-owner-menu">
                      <button
                        className="menu-button"
                        onClick={() =>
                          setOpenMenuId(openMenuId === jobId ? null : jobId)
                        }
                      >
                        . . .
                      </button>

                      {openMenuId === jobId && (
                        <div className="dropdown-menu">
                          <Link to={`/jobs/${jobId}/edit`} className="primary-button">
                            Editează
                          </Link>

                          {!isClosed && (
                            <>
                              <button
                                className="primary-button"
                                onClick={() => handleCancelJob(jobId)}
                              >
                                Anulează
                              </button>

                              <button
                                className="primary-button"
                                onClick={() => handleCompleteJob(jobId)}
                              >
                                Marchează finalizat
                              </button>
                            </>
                          )}

                          <button
                            className="primary-button"
                            onClick={() => handleDeleteJob(jobId)}
                          >
                            Șterge
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {showApplyModal && selectedJob && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="apply-modal-title"
              aria-describedby="apply-modal-description"
              style={{
                backgroundColor: "white",
                padding: "20px",
                borderRadius: "8px",
                minWidth: "300px",
              }}
            >
              <h3 id="apply-modal-title">Confirmare aplicare</h3>

              <p id="apply-modal-description">
                Sigur vrei să aplici la jobul: <strong>{selectedJob.title}</strong>?
              </p>

              <button onClick={confirmApply} disabled={isApplying}>
                {isApplying ? "Se trimite..." : "Da"}
              </button>

              <button onClick={closeApplyModal} disabled={isApplying}>
                Nu
              </button>
            </div>
          </div>
        )}
      </div>

      <button className="primary-button" onClick={handleAddJobClick}>
        Postează un job
      </button>
    </section>
  );
}

export default AdminHomePage;