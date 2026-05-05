import { useEffect, useState } from "react";
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
  const [openMenuId, setOpenMenuId] = useState(null);

  // State-uri pentru filtre
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterParticipants, setFilterParticipants] = useState("");

  const navigate = useNavigate();

  const fetchJobs = async (customFilters = null) => {
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

  const handleApplyFilters = async () => {
    const filters = {};

    if (filterStartDate) {
      filters.startDate = new Date(filterStartDate).toISOString().slice(0, 19);
    }

    if (filterEndDate) {
      filters.endDate = new Date(filterEndDate).toISOString().slice(0, 19);
    }

    if (filterLocation.trim()) {
      filters.location = filterLocation.trim();
    }

    if (filterParticipants) {
      filters.participants = Number(filterParticipants);
    }

    await fetchJobs(filters);
  };

  const handleResetFilters = async () => {
    setFilterStartDate("");
    setFilterEndDate("");
    setFilterLocation("");
    setFilterParticipants("");
    await fetchJobs();
  };

  const handleApplyClick = (job) => {
    if (!isAuthenticated) {
      navigate("/login", {
        state: { redirectTo: "/" },
      });
      return;
    }

    const jobId = job.id || job._id;

    const isOwner =
      isAuthenticated &&
      (user?.email === job.postedBy ||
        user?.email === job.ownerEmail ||
        user?.id === job.ownerId);

    const isFilled =
      job.status === "FILLED" ||
      (job.neededWorkers != null &&
        job.acceptedWorkers != null &&
        job.acceptedWorkers >= job.neededWorkers);

    const isClosed =
      job.status === "CANCELED" || job.status === "COMPLETED";

    const isInProgress = job.status === "IN_PROGRESS";

    if (isOwner) {
      setError("Nu poți aplica la propriul job.");
      return;
    }

    if (appliedJobIds.includes(jobId)) {
      setError("Ai aplicat deja la acest job.");
      return;
    }

    if (isClosed) {
      setError("Nu poți aplica la un job închis.");
      return;
    }

    if (isInProgress) {
      setError("Jobul este deja în desfășurare.");
      return;
    }

    if (isFilled) {
      setError("Locurile pentru acest job s-au ocupat.");
      return;
    }

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

  const handleDeleteJob = async (jobId) => {
    const confirmDelete = window.confirm("Sigur vrei să ștergi acest job?");
    if (!confirmDelete) return;

    try {
      await deleteJob(jobId);

      setJobs((prevJobs) =>
        prevJobs.filter((job) => (job.id || job._id) !== jobId)
      );
      setOpenMenuId(null);

      alert("Jobul a fost șters.");
    } catch (err) {
      console.error("Eroare la ștergerea jobului:", err);
      alert("Nu s-a putut șterge jobul.");
    }
  };

  return (
    <section className="page">
      <h1>Platformă de microjoburi</h1>

      {isAuthenticated ? (
        <div className="card">
          <p>Bine ai venit, {user.firstName}!</p>

          <button className="primary-button" onClick={logout}>
            Logout
          </button>
        </div>
      ) : (
        <p>Nu ești logat.</p>
      )}

      <div className="jobs-section">
        <h2>Joburi disponibile</h2>

        <div className="card" style={{ marginBottom: "20px" }}>
          <h3>Filtre</h3>

          <p>
            <strong>Locație:</strong>
          </p>
          <input
            type="text"
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            placeholder="Ex: Cluj-Napoca"
          />

          <p>
            <strong>Data de start minimă:</strong>
          </p>
          <input
            type="datetime-local"
            value={filterStartDate}
            onChange={(e) => setFilterStartDate(e.target.value)}
          />

          <p>
            <strong>Data de final maximă:</strong>
          </p>
          <input
            type="datetime-local"
            value={filterEndDate}
            onChange={(e) => setFilterEndDate(e.target.value)}
          />

          <p>
            <strong>Număr minim participanți:</strong>
          </p>
          <input
            type="number"
            min="1"
            value={filterParticipants}
            onChange={(e) => setFilterParticipants(e.target.value)}
            placeholder="Ex: 3"
          />

          <div style={{ marginTop: "12px", display: "flex", gap: "10px" }}>
            <button className="primary-button" onClick={handleApplyFilters}>
              Aplică filtrele
            </button>

            <button className="primary-button" onClick={handleResetFilters}>
              Resetează
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

              const isOwner =
                isAuthenticated &&
                (user?.email === job.postedBy ||
                  user?.email === job.ownerEmail ||
                  user?.id === job.ownerId);

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
                    <strong>Locuri ocupate:</strong> {job.acceptedWorkers ?? 0}/
                    {job.neededWorkers ?? 0}
                  </p>

                  <p>
                    <strong>Salariu:</strong> {job.salary ?? "0"}
                  </p>

                  <p>
                    <strong>Locație:</strong>{" "}
                    {job.location
                      ? `${job.location}${job.county ? `, ${job.county}` : ""}`
                      : "Nespecificat"}
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

                  <div className="job-actions">
                    <Link to={`/jobs/${jobId}`} className="primary-button">
                      Vezi detalii
                    </Link>

                    {isOwner ? (
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
                            <Link
                              to={`/jobs/${jobId}/edit`}
                              className="primary-button"
                            >
                              Editează
                            </Link>

                            <button
                              className="primary-button"
                              onClick={() => handleDeleteJob(jobId)}
                            >
                              Șterge
                            </button>

                            <button className="primary-button">Informații</button>
                          </div>
                        )}
                      </div>
                    ) : hasApplied ? (
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

export default HomePage;