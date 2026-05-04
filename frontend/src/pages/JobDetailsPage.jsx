import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  getJobById,
  applyToJob,
  getApplicationsForJob,
  acceptApplication,
  rejectApplication,
  cancelJob,
  completeJob,
  deleteJob,
  getMyApplications,
} from "../api/jobApi";
import { useAuth } from "../context/AuthContext";

export default function JobDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [hasApplied, setHasApplied] = useState(false);
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchJobDetails = async () => {
    try {
      setError("");

      const jobData = await getJobById(id);
      console.log("JOB DATA DUPA GET", jobData);
      setJob(jobData);

      const owner =
        user &&
        (jobData.postedBy === user.email ||
          jobData.ownerEmail === user.email ||
          jobData.ownerId === user.id);

      if (owner) {
        const applicationsData = await getApplicationsForJob(id);
        setApplications(applicationsData);
      } else {
        setApplications([]);
      }

      if (isAuthenticated && user && !owner) {
        const myApplications = await getMyApplications();
        const alreadyApplied = myApplications.some(
          (application) => application.jobId === id
        );
        setHasApplied(alreadyApplied);
      } else {
        setHasApplied(false);
      }
    } catch (err) {
      console.log("EROARE fetchJobDetails", err);
      setError("Nu am putut încărca jobul.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobDetails();
  }, [id, user]);

  const handleApply = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (hasApplied) {
      setMessage("Ai aplicat deja la acest job.");
      return;
    }

    if (isFilled) {
      setMessage("Locurile pentru acest job s-au ocupat.");
      return;
    }

    try {
      await applyToJob(id);
      setMessage("Aplicarea a fost trimisă cu succes.");
      setHasApplied(true);
      fetchJobDetails();
    } catch (err) {
      console.log("EROARE APPLY", err);
      setMessage("Nu s-a putut trimite aplicarea.");
    }
  };

  const handleAccept = async (applicationId) => {
    try {
      const result = await acceptApplication(applicationId);
      console.log("ACCEPT RESULT", result);
      setMessage("Aplicarea a fost acceptată.");
      await fetchJobDetails();
    } catch (err) {
      console.log(err);
      setMessage("Nu s-a putut accepta aplicarea.");
    }
  };

  const handleReject = async (applicationId) => {
    try {
      await rejectApplication(applicationId);
      setMessage("Aplicarea a fost respinsă.");
      await fetchJobDetails();
    } catch (err) {
      setMessage("Nu s-a putut respinge aplicarea.");
    }
  };

  const handleCancelJob = async () => {
    try {
      await cancelJob(id);
      setMessage("Jobul a fost anulat.");
      await fetchJobDetails();
    } catch (err) {
      setMessage("Nu s-a putut anula jobul.");
    }
  };

  const handleCompleteJob = async () => {
    try {
      await completeJob(id);
      setMessage("Jobul a fost marcat ca finalizat.");
      await fetchJobDetails();
    } catch (err) {
      setMessage("Nu s-a putut finaliza jobul.");
    }
  };

  const handleDeleteJob = async () => {
    const confirmDelete = window.confirm("Sigur vrei să ștergi acest job?");
    if (!confirmDelete) return;

    try {
      await deleteJob(id);
      navigate("/");
    } catch (err) {
      console.error("EROARE DELETE JOB", err);
      setMessage("Nu s-a putut șterge jobul.");
    }
  };

  if (loading) return <div>Se încarcă jobul...</div>;
  if (error) return <div>{error}</div>;
  if (!job) return <div>Jobul nu există.</div>;

  const isOwner =
    user &&
    (job.postedBy === user.email ||
      job.ownerEmail === user.email ||
      job.ownerId === user.id);

  const isFilled =
    job?.status === "FILLED" ||
    (
      job?.neededWorkers != null &&
      job?.acceptedWorkers != null &&
      job.acceptedWorkers >= job.neededWorkers
    );

  return (
    <div style={{ padding: "20px" }}>
      <h1>{job.title}</h1>
      <p><strong>Descriere:</strong> {job.description || "Fără descriere"}</p>
      <p><strong>Status:</strong> {job.status}</p>
      <p><strong>Capacitate:</strong> {job.neededWorkers ?? "Nespecificat"}</p>
      <p><strong>Locuri ocupate:</strong> {job.acceptedWorkers ?? 0} / {job.neededWorkers ?? "Nespecificat"}</p>
      <p><strong>Salariu:</strong> {job.salary ?? "0"}</p>
      <p><strong>Locație:</strong> {job.location || "Nespecificată"}</p>
      <p>
        <strong>Start:</strong>{" "}
        {job.startDate ? new Date(job.startDate).toLocaleString("ro-RO") : "Nespecificat"}
      </p>
      <p>
        <strong>Final:</strong>{" "}
        {job.endDate ? new Date(job.endDate).toLocaleString("ro-RO") : "Nespecificat"}
      </p>

      {isOwner && (
        <div style={{ display: "flex", gap: "10px", marginTop: "16px", flexWrap: "wrap" }}>
          <Link to={`/jobs/${job.id || job._id}/edit`} className="primary-button">
            Editează jobul
          </Link>

          <button onClick={handleDeleteJob} className="primary-button">
            Șterge jobul
          </button>
        </div>
      )}

      {!isOwner && (
        <div style={{ marginTop: "20px" }}>
          {hasApplied ? (
            <p style={{ color: "green", fontWeight: "bold" }}>
              Ai aplicat deja la acest job.
            </p>
          ) : isFilled ? (
            <p style={{ color: "red", fontWeight: "bold" }}>
              Locurile pentru acest job s-au ocupat.
            </p>
          ) : (
            <button onClick={handleApply}>Aplică la job</button>
          )}
        </div>
      )}

      {message && <p style={{ marginTop: "12px" }}>{message}</p>}

      {isOwner && (
        <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
          {job.status !== "CANCELED" && job.status !== "COMPLETED" && (
            <button onClick={handleCancelJob}>Anulează jobul</button>
          )}

          {job.status !== "COMPLETED" && job.status !== "CANCELED" && (
            <button onClick={handleCompleteJob}>Finalizează jobul</button>
          )}
        </div>
      )}

      {isOwner && (
        <div style={{ marginTop: "24px" }}>
          <h2>Aplicanți</h2>

          {applications.length === 0 ? (
            <p>Nu există aplicări pentru acest job.</p>
          ) : (
            applications.map((application) => {
              const applicantEmail =
                application.applicantEmail || application.email || "";

              const applicantName =
                application.applicantFirstName && application.applicantLastName
                  ? `${application.applicantFirstName} ${application.applicantLastName}`
                  : applicantEmail || "Utilizator";

              return (
                <div
                  key={application.id || application._id}
                  style={{
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    padding: "12px",
                    marginBottom: "10px",
                  }}
                >
                  <p><strong>ID aplicare:</strong> {application.id || application._id}</p>
                  <p><strong>Status:</strong> {application.status}</p>

                  <p>
                    <strong>Aplicant:</strong>{" "}
                    {applicantEmail ? (
                      <Link to={`/users/public/${encodeURIComponent(applicantEmail)}`}>
                        {applicantName}
                      </Link>
                    ) : (
                      applicantName
                    )}
                  </p>

                  <p>
                    <strong>Email aplicant:</strong>{" "}
                    {applicantEmail ? (
                      <Link to={`/users/public/${encodeURIComponent(applicantEmail)}`}>
                        {applicantEmail}
                      </Link>
                    ) : (
                      "-"
                    )}
                  </p>

                  {application.status === "PENDING" ? (
                    <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                      <button onClick={() => handleAccept(application.id || application._id)}>
                        Acceptă
                      </button>
                      <button onClick={() => handleReject(application.id || application._id)}>
                        Respinge
                      </button>
                    </div>
                  ) : (
                    <p style={{ marginTop: "10px" }}>
                      Aplicarea a fost deja procesată.
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}