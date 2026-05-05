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
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  const fetchJobDetails = async () => {
    try {
      setError("");

      const jobData = await getJobById(id);
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

  const isOwner =
    job &&
    user &&
    (job.postedBy === user.email ||
      job.ownerEmail === user.email ||
      job.ownerId === user.id);

  const isFilled =
    job &&
    (job.status === "FILLED" ||
      ((job.acceptedWorkers ?? 0) >= (job.neededWorkers ?? 0) &&
        (job.neededWorkers ?? 0) > 0));

  const isClosed =
    job && (job.status === "CANCELED" || job.status === "COMPLETED");

  const isInProgress = job && job.status === "IN_PROGRESS";

  const handleApplyClick = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (hasApplied) {
      setMessage("Ai aplicat deja la acest job.");
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

    if (isClosed) {
      setMessage("Jobul nu mai este disponibil.");
      return;
    }

    setShowApplyModal(true);
  };

  const confirmApply = async () => {
    try {
      setIsApplying(true);
      await applyToJob(id);
      setMessage("Aplicarea a fost trimisă cu succes.");
      setHasApplied(true);
      setShowApplyModal(false);
      await fetchJobDetails();
    } catch (err) {
      console.log("EROARE APPLY", err);
      setMessage("Nu s-a putut trimite aplicarea.");
    } finally {
      setIsApplying(false);
    }
  };

  const handleAccept = async (applicationId) => {
    try {
      await acceptApplication(applicationId);
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

  if (loading) return <p>Se încarcă jobul...</p>;
  if (error) return <p>{error}</p>;
  if (!job) return <p>Jobul nu există.</p>;

  return (
    <div className="page">
      <h1>{job.title}</h1>

      <p>
        <strong>Descriere:</strong> {job.description || "Fără descriere"}
      </p>

      <p>
        <strong>Status:</strong> {job.status}
      </p>

      <p>
        <strong>Capacitate:</strong> {job.neededWorkers ?? "Nespecificat"}
      </p>

      <p>
        <strong>Locuri ocupate:</strong> {job.acceptedWorkers ?? 0} / {job.neededWorkers ?? "Nespecificat"}
      </p>

      <p>
        <strong>Salariu:</strong> {job.salary ?? "0"}
      </p>

      <p>
      <strong>Locație:</strong>{" "}
        {job.location
          ? `${job.location}${job.county ? `, ${job.county}` : ""}`
          : "Nespecificată"}
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
        <>
          {hasApplied ? (
            <p>Ai aplicat deja la acest job.</p>
          ) : isClosed ? (
            <p>Jobul nu mai este disponibil.</p>
          ) : isInProgress ? (
            <p>Job în desfășurare.</p>
          ) : isFilled ? (
            <p>Locurile pentru acest job s-au ocupat.</p>
          ) : (
            <button onClick={handleApplyClick}>Aplică</button>
          )}
        </>
      )}

      {message && <p>{message}</p>}

      {isOwner && (
        <div>
          <h2>Acțiuni owner</h2>

          <Link to={`/jobs/${id}/edit`}>Editează jobul</Link>
          <button onClick={handleCancelJob}>Anulează jobul</button>
          <button onClick={handleCompleteJob}>Finalizează jobul</button>
          <button onClick={handleDeleteJob}>Șterge jobul</button>

          <h2>Aplicanți</h2>

          {applications.length === 0 ? (
            <p>Nu există aplicări pentru acest job.</p>
          ) : (
            applications.map((application) => {
              const applicantEmail = application.applicantEmail || application.email || "";
              const applicantName =
                application.applicantFirstName && application.applicantLastName
                  ? `${application.applicantFirstName} ${application.applicantLastName}`
                  : applicantEmail || "Utilizator";

              return (
                <div key={application.id || application._id}>
                  <p>
                    <strong>ID aplicare:</strong> {application.id || application._id}
                  </p>

                  <p>
                    <strong>Status:</strong> {application.status}
                  </p>

                  <p>
                    <strong>Aplicant:</strong>{" "}
                    {applicantEmail ? (
                      <Link to={`/profile/${applicantEmail}`}>{applicantName}</Link>
                    ) : (
                      applicantName
                    )}
                  </p>

                  <p>
                    <strong>Email aplicant:</strong>{" "}
                    {applicantEmail ? (
                      <Link to={`/profile/${applicantEmail}`}>{applicantEmail}</Link>
                    ) : (
                      "-"
                    )}
                  </p>

                  {application.status === "PENDING" ? (
                    <div>
                      <button onClick={() => handleAccept(application.id || application._id)}>
                        Acceptă
                      </button>
                      <button onClick={() => handleReject(application.id || application._id)}>
                        Respinge
                      </button>
                    </div>
                  ) : (
                    <p>Aplicarea a fost deja procesată.</p>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {showApplyModal && (
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
              Sigur vrei să aplici la acest job?
            </p>

            <button onClick={confirmApply} disabled={isApplying}>
              {isApplying ? "Se trimite..." : "Da"}
            </button>

            <button
              onClick={() => setShowApplyModal(false)}
              disabled={isApplying}
            >
              Nu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}