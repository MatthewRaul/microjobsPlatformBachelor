import { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { getAllJobs, applyToJob, getMyApplications } from "../api/jobApi";
import { useNavigate, Link } from "react-router-dom";

function HomePage() {
  const { user, isAuthenticated, logout } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [appliedJobIds, setAppliedJobIds] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoadingJobs(true);
        setError("");

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
        setError("Nu am putut încărca joburile.");
      } finally {
        setLoadingJobs(false);
      }
    };

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

  const handleApply = async (jobId) => {
    if (!isAuthenticated) {
      navigate("/login", {
        state: { redirectTo: "/" },
      });
      return;
    }

    if (appliedJobIds.includes(jobId)) {
      alert("Ai aplicat deja la acest job.");
      return;
    }

    try {
      await applyToJob(jobId);
      alert("Ai aplicat cu succes la acest job");

      setAppliedJobIds((prev) => [...prev, jobId]);
    } catch (err) {
      console.error("Eroare la aplicare: ", err);
      alert("Nu s-a putut trimite aplicarea");
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

        {loadingJobs && <p>Se încarcă joburile...</p>}
        {error && <p className="error-message">{error}</p>}

        {!loadingJobs && !error && jobs.length === 0 && (
          <p>Nu există joburi disponibile momentan.</p>
        )}

        {!loadingJobs && !error && jobs.length > 0 && (
          <div className="jobs-list">
            {jobs.map((job) => {
              const jobId = job.id || job._id;
              const isOwner = isAuthenticated && user?.email === job.postedBy;
              const hasApplied = appliedJobIds.includes(jobId);
              const isFilled =
                job.status === "FILLED" ||
                (
                  job.neededWorkers != null &&
                  job.acceptedWorkers != null &&
                  job.acceptedWorkers >= job.neededWorkers
                );

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
                      <div
                        className="job-owner-menu"
                        ref={openMenuId === jobId ? menuRef : null}
                      >
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
                            <button className="primary-button">Editează</button>
                            <button className="primary-button">Șterge</button>
                            <button className="primary-button">Informații</button>
                          </div>
                        )}
                      </div>
                    ) : hasApplied ? (
                      <div className="status-box applied-box">
                        Ai aplicat deja
                      </div>
                    ) : isFilled ? (
                      <div className="status-box filled-box">
                        Locurile pentru acest job s-au ocupat
                      </div>
                    ) : (
                      <button
                        className="primary-button"
                        onClick={() => handleApply(jobId)}
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
      </div>

      <button className="primary-button" onClick={handleAddJobClick}>
        Postează un job
      </button>
    </section>
  );
}

export default HomePage;