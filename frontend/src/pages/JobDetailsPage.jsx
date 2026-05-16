import { useEffect, useMemo, useState } from "react";
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
import { getPublicUserProfile, getPublicUserRating } from "../api/userApi";
import { useAuth } from "../context/AuthContext";

export default function JobDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [hasApplied, setHasApplied] = useState(false);

  const [ownerProfile, setOwnerProfile] = useState(null);
  const [ownerRating, setOwnerRating] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const [completeModal, setCompleteModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [acceptModal, setAcceptModal] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [isActioning, setIsActioning] = useState(false);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const jobData = await getJobById(id);
      setJob(jobData);

      if (jobData?.postedBy) {
        try {
          const publicProfile = await getPublicUserProfile(jobData.postedBy);
          setOwnerProfile(publicProfile || null);

          if (publicProfile?.id) {
            const ratingResponse = await getPublicUserRating(publicProfile.id);
            setOwnerRating(ratingResponse || null);
          } else {
            setOwnerRating(null);
          }
        } catch (ownerError) {
          console.log("EROARE OWNER PROFILE / RATING", ownerError);
          setOwnerProfile(null);
          setOwnerRating(null);
        }
      } else {
        setOwnerProfile(null);
        setOwnerRating(null);
      }

      const currentOwner =
        !!user &&
        !!jobData?.postedBy &&
        !!user?.email &&
        jobData.postedBy === user.email;

      try {
        const shouldTryLoadApplications =
          isAuthenticated && user && (currentOwner || jobData.status === "COMPLETED");

        if (shouldTryLoadApplications) {
          const applicationsData = await getApplicationsForJob(id);
          setApplications(applicationsData || []);
        } else {
          setApplications([]);
        }
      } catch (applicationsError) {
        console.log("NU S-AU PUTUT ÎNCĂRCA APLICĂRILE", applicationsError);
        setApplications([]);
      }

      if (isAuthenticated && user && !currentOwner) {
        try {
          const myApplications = await getMyApplications();
          const alreadyApplied = myApplications.some(
            (application) => application.jobId === id
          );
          setHasApplied(alreadyApplied);
        } catch (myApplicationsError) {
          console.log("NU S-AU PUTUT ÎNCĂRCA APLICĂRILE MELE", myApplicationsError);
          setHasApplied(false);
        }
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
    if (id) {
      fetchJobDetails();
    }
  }, [id, user, isAuthenticated]);

  const isOwner =
    !!job &&
    !!user &&
    !!job?.postedBy &&
    !!user?.email &&
    job.postedBy === user.email;

  const isFilled =
    !!job &&
    (
      job.status === "FILLED" ||
      ((job.acceptedWorkers ?? 0) >= (job.neededWorkers ?? 0) &&
        (job.neededWorkers ?? 0) > 0)
    );

  const isClosed =
    !!job && (job.status === "CANCELED" || job.status === "COMPLETED");

  const isInProgress = !!job && job.status === "IN_PROGRESS";

  const acceptedApplications = useMemo(() => {
    return applications.filter((application) => application.status === "ACCEPTED");
  }, [applications]);

  const pendingApplications = useMemo(() => {
    return applications.filter((application) => application.status === "PENDING");
  }, [applications]);

  const isAcceptedParticipant =
    !!user &&
    acceptedApplications.some(
      (application) =>
        (user.id &&
          application.applicantUserId &&
          application.applicantUserId === user.id) ||
        (user.email &&
          application.applicantEmail &&
          application.applicantEmail === user.email)
    );

  const currentUserParticipated =
    !!job && !!user && (isOwner || isAcceptedParticipant);

  const canSeeCompletedParticipantsSection =
    job?.status === "COMPLETED" && currentUserParticipated;

  const ownerFirstName =
    ownerProfile?.firstName && ownerProfile.firstName.trim() !== ""
      ? ownerProfile.firstName.trim()
      : job?.postedBy
      ? job.postedBy.split("@")[0]
      : "Utilizator";

  const ownerPublicProfilePath = job?.postedBy
    ? `/users/public/${encodeURIComponent(job.postedBy)}`
    : null;

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

  const handleAccept = async () => {
    try {
      setIsActioning(true);
      await acceptApplication(acceptModal);
      setMessage("Aplicarea a fost acceptată.");
      setAcceptModal(null);
      await fetchJobDetails();
    } catch (err) {
      setMessage("Nu s-a putut accepta aplicarea.");
    } finally {
      setIsActioning(false);
    }
  };

  const handleReject = async () => {
    try {
      setIsActioning(true);
      await rejectApplication(rejectModal);
      setMessage("Aplicarea a fost respinsă.");
      setRejectModal(null);
      await fetchJobDetails();
    } catch (err) {
      setMessage("Nu s-a putut respinge aplicarea.");
    } finally {
      setIsActioning(false);
    }
  };

  const handleCancelJob = async () => {
    try {
      setIsActioning(true);
      await cancelJob(id);
      setMessage("Jobul a fost anulat.");
      setCancelModal(false);
      await fetchJobDetails();
    } catch (err) {
      setMessage("Nu s-a putut anula jobul.");
    } finally {
      setIsActioning(false);
    }
  };

  const handleCompleteJob = async () => {
    try {
      setIsActioning(true);
      await completeJob(id);
      setMessage("Jobul a fost marcat ca finalizat.");
      setCompleteModal(false);
      await fetchJobDetails();
    } catch (err) {
      console.log("EROARE COMPLETE", err);
      setMessage("Nu s-a putut finaliza jobul.");
    } finally {
      setIsActioning(false);
    }
  };

  const handleDeleteJob = async () => {
    try {
      setIsActioning(true);
      await deleteJob(id);
      setDeleteModal(false);
      navigate("/");
    } catch (err) {
      setMessage("Nu s-a putut șterge jobul.");
    } finally {
      setIsActioning(false);
    }
  };

  if (loading) return <p>Se încarcă jobul...</p>;
  if (error) return <p>{error}</p>;
  if (!job) return <p>Jobul nu există.</p>;

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

  const getStatusLabel = (status) => {
    const map = { OPEN: "Deschis", FILLED: "Locuri ocupate", IN_PROGRESS: "În desfășurare", COMPLETED: "Finalizat", CANCELED: "Anulat" };
    return map[status] || status;
  };

  return (
    <div className="page">

      {/* Card alb — descriere job */}
      <div style={{ background: "#ffffff", borderRadius: "12px", padding: "24px", marginBottom: "20px", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#111", marginBottom: "16px" }}>{job.title}</h1>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
            <svg width="16" height="16" style={{ flexShrink: 0, marginTop: "2px", opacity: 0.5 }} viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
            <span style={{ color: "#333", fontSize: "15px", lineHeight: "1.5" }}>{job.description || "Fără descriere"}</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <svg width="16" height="16" style={{ flexShrink: 0, opacity: 0.5 }} viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/>
            </svg>
            <span style={{ color: "#333", fontSize: "14px" }}>{job.location ? `${job.location}${job.county ? `, ${job.county}` : ""}` : "Locație nespecificată"}</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <svg width="16" height="16" style={{ flexShrink: 0, opacity: 0.5 }} viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <span style={{ color: "#333", fontSize: "14px" }}>{job.acceptedWorkers ?? 0} / {job.neededWorkers ?? 0} locuri ocupate</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <svg width="16" height="16" style={{ flexShrink: 0, opacity: 0.5 }} viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
            <span style={{ color: "#333", fontSize: "14px" }}>{job.salary ?? 0} RON</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <svg width="16" height="16" style={{ flexShrink: 0, opacity: 0.5 }} viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            <span style={{ color: "#333", fontSize: "14px" }}>
              {job.startDate ? new Date(job.startDate).toLocaleString("ro-RO", { dateStyle: "medium", timeStyle: "short" }) : "Nespecificat"}
              {" — "}
              {job.endDate ? new Date(job.endDate).toLocaleString("ro-RO", { dateStyle: "medium", timeStyle: "short" }) : "Nespecificat"}
            </span>
          </div>

          <div style={{ marginTop: "8px" }}>
            <span style={{ ...getStatusStyle(job.status), padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600" }}>
              {getStatusLabel(job.status)}
            </span>
          </div>
        </div>
      </div>

      {/* Sectiunea owner — verde ca navbar-ul */}
      {ownerPublicProfilePath ? (
        <Link
          to={ownerPublicProfilePath}
          style={{ display: "block", textDecoration: "none", marginTop: "24px", marginBottom: "24px" }}
        >
          <div style={{
            backgroundColor: "#40826D",
            borderRadius: "10px",
            padding: "18px 20px",
            cursor: "pointer",
            boxShadow: "0 4px 16px rgba(64, 130, 109, 0.35)",
            transition: "box-shadow 0.2s",
          }}>
            <p style={{ marginBottom: "6px", fontWeight: "700", fontSize: "16px", color: "#ffffff" }}>
              Postat de {ownerFirstName}
            </p>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "14px", marginBottom: "4px" }}>
              <strong style={{ color: "#ffffff" }}>Rating:</strong>{" "}
              {ownerRating?.averageRating !== undefined && ownerRating?.averageRating !== null
                ? `★ ${Number(ownerRating.averageRating).toFixed(1)}`
                : "Fără rating"}
            </p>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)" }}>
              {ownerRating?.reviewCount ?? 0} review-uri · Apasă pentru profil
            </p>
          </div>
        </Link>
      ) : (
        <div style={{
          backgroundColor: "#40826D",
          borderRadius: "10px",
          padding: "18px 20px",
          marginTop: "24px",
          marginBottom: "24px",
          boxShadow: "0 4px 16px rgba(64, 130, 109, 0.35)",
        }}>
          <p style={{ marginBottom: "6px", fontWeight: "700", fontSize: "16px", color: "#ffffff" }}>
            Postat de {ownerFirstName}
          </p>
          <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "14px", marginBottom: "4px" }}>
            <strong style={{ color: "#ffffff" }}>Rating:</strong>{" "}
            {ownerRating?.averageRating !== undefined && ownerRating?.averageRating !== null
              ? `★ ${Number(ownerRating.averageRating).toFixed(1)}`
              : "Fără rating"}
          </p>
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)" }}>
            {ownerRating?.reviewCount ?? 0} review-uri
          </p>
        </div>
      )}

      {!isOwner && (
        <div style={{ marginBottom: "20px" }}>
          {hasApplied ? (
            <div className="status-box applied-box" style={{ display: "inline-block" }}>Ai aplicat deja la acest job</div>
          ) : isClosed ? (
            <div className="status-box filled-box" style={{ display: "inline-block" }}>Jobul nu mai este disponibil</div>
          ) : isInProgress ? (
            <div className="status-box filled-box" style={{ display: "inline-block" }}>Job în desfășurare</div>
          ) : isFilled ? (
            <div className="status-box filled-box" style={{ display: "inline-block" }}>Locurile s-au ocupat</div>
          ) : (
            <button className="primary-button" style={{ maxWidth: "220px" }} onClick={handleApplyClick}>Aplică la job</button>
          )}
        </div>
      )}

      {message && <p style={{ color: "#7c3aed", fontWeight: "600", marginBottom: "16px" }}>{message}</p>}

      {isOwner && (
        <div className="owner-actions" style={{ marginBottom: "24px" }}>
          <Link to={`/jobs/${id}/edit`} className="icon-btn icon-btn--edit">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Editează
          </Link>
          {!isClosed && (
            <>
              <button className="icon-btn icon-btn--edit" onClick={() => setCancelModal(true)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                Anulează
              </button>
              <button className="icon-btn icon-btn--info" onClick={() => setCompleteModal(true)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Finalizează
              </button>
            </>
          )}
          <button className="icon-btn icon-btn--delete" onClick={() => setDeleteModal(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/>
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
            Șterge
          </button>
        </div>
      )}

      {canSeeCompletedParticipantsSection && (
        <div style={{ marginTop: "24px", marginBottom: "32px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px", color: "#111" }}>Participanți acceptați</h2>
          {acceptedApplications.length === 0 ? (
            <p style={{ color: "#666" }}>Nu există participanți acceptați.</p>
          ) : (
            acceptedApplications.map((application) => {
              const applicantName =
                application.applicantFirstName && application.applicantLastName
                  ? `${application.applicantFirstName} ${application.applicantLastName}`
                  : application.applicantEmail || "Utilizator";
              const applicantUserId = application.applicantUserId || null;
              const isSameUser =
                (user?.id && applicantUserId && user.id === applicantUserId) ||
                (user?.email && application.applicantEmail && user.email === application.applicantEmail);
              const canLeaveReview = job.status === "COMPLETED" && currentUserParticipated && !isSameUser && !!applicantUserId;

              return (
                <div key={application.id || application._id} className="card" style={{ marginBottom: "12px" }}>
                  <h3 className="job-title" style={{ fontSize: "16px" }}>{applicantName}</h3>
                  <div className="job-meta">
                    <span className="job-meta__item">
                      <svg className="job-meta__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                      </svg>
                      {application.applicantEmail || "-"}
                    </span>
                    <span className="job-meta__item">
                      <svg className="job-meta__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                      ★ {application.applicantAverageRating != null ? Number(application.applicantAverageRating).toFixed(1) : "0.0"} ({application.applicantReviewCount || 0} review-uri)
                    </span>
                  </div>
                  <div className="owner-actions">
                    {application.applicantEmail && (
                      <Link to={`/users/public/${encodeURIComponent(application.applicantEmail)}`} className="icon-btn icon-btn--info">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                        Profil public
                      </Link>
                    )}
                    {canLeaveReview && (
                      <Link to={`/jobs/${id}/review/${applicantUserId}`} className="icon-btn icon-btn--edit">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                        Lasă review
                      </Link>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {isOwner && (
        <div style={{ marginTop: "24px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px", color: "#111" }}>Aplicanți în așteptare</h2>
          {pendingApplications.length === 0 ? (
            <p style={{ color: "#666" }}>Nu există aplicări în așteptare.</p>
          ) : (
            pendingApplications.map((application) => {
              const applicantName =
                application.applicantFirstName && application.applicantLastName
                  ? `${application.applicantFirstName} ${application.applicantLastName}`
                  : application.applicantEmail || "Utilizator";
              const appId = application.id || application._id;

              return (
                <div key={appId} className="card" style={{ marginBottom: "12px" }}>
                  <h3 className="job-title" style={{ fontSize: "16px" }}>{applicantName}</h3>
                  <div className="job-meta">
                    <span className="job-meta__item">
                      <svg className="job-meta__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                      </svg>
                      {application.applicantEmail || "-"}
                    </span>
                  </div>
                  <div className="owner-actions">
                    {application.applicantEmail && (
                      <Link to={`/users/public/${encodeURIComponent(application.applicantEmail)}`} className="icon-btn icon-btn--info">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                        Profil
                      </Link>
                    )}
                    <button className="icon-btn icon-btn--edit" onClick={() => setAcceptModal(appId)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                      Acceptă
                    </button>
                    <button className="icon-btn icon-btn--delete" onClick={() => setRejectModal(appId)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      Respinge
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Modals */}
      {showApplyModal && <ConfirmModal title="Confirmare aplicare" message="Sigur vrei să aplici la acest job?" confirmLabel="Aplică" confirmStyle={{ background: "#7c3aed" }} onConfirm={confirmApply} onCancel={() => setShowApplyModal(false)} isLoading={isApplying} />}
      {cancelModal && <ConfirmModal title="Anulează job" message="Ești sigur că vrei să anulezi acest job?" confirmLabel="Anulează jobul" confirmStyle={{ background: "#d97706" }} onConfirm={handleCancelJob} onCancel={() => setCancelModal(false)} isLoading={isActioning} />}
      {completeModal && <ConfirmModal title="Finalizează job" message="Confirmi că jobul a fost finalizat? Acțiunea este ireversibilă." confirmLabel="Finalizează" confirmStyle={{ background: "#7c3aed" }} onConfirm={handleCompleteJob} onCancel={() => setCompleteModal(false)} isLoading={isActioning} />}
      {deleteModal && <ConfirmModal title="Șterge job" message="Ești sigur că vrei să ștergi acest job? Acțiunea este ireversibilă." confirmLabel="Șterge" confirmStyle={{ background: "#dc2626" }} onConfirm={handleDeleteJob} onCancel={() => setDeleteModal(false)} isLoading={isActioning} />}
      {acceptModal && <ConfirmModal title="Acceptă aplicare" message="Confirmi acceptarea acestui aplicant?" confirmLabel="Acceptă" confirmStyle={{ background: "#166534" }} onConfirm={handleAccept} onCancel={() => setAcceptModal(null)} isLoading={isActioning} />}
      {rejectModal && <ConfirmModal title="Respinge aplicare" message="Ești sigur că vrei să respingi această aplicare?" confirmLabel="Respinge" confirmStyle={{ background: "#dc2626" }} onConfirm={handleReject} onCancel={() => setRejectModal(null)} isLoading={isActioning} />}
    </div>
  );
}

function ConfirmModal({ title, message, confirmLabel, confirmStyle, onConfirm, onCancel, isLoading }) {
  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
      <div role="dialog" aria-modal="true" style={{ backgroundColor: "white", padding: "28px 24px", borderRadius: "10px", minWidth: "300px", maxWidth: "420px", width: "90vw", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <h3 style={{ marginBottom: "10px", fontSize: "18px", color: "#111" }}>{title}</h3>
        <p style={{ marginBottom: "24px", color: "#555", fontSize: "14px", lineHeight: "1.5" }}>{message}</p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <button onClick={onConfirm} disabled={isLoading} style={{ padding: "10px 24px", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "14px", ...confirmStyle }}>
            {isLoading ? "Se procesează..." : confirmLabel}
          </button>
          <button onClick={onCancel} disabled={isLoading} style={{ padding: "10px 24px", background: "#f3f4f6", color: "#333", border: "1px solid #ddd", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "14px" }}>
            Anulează
          </button>
        </div>
      </div>
    </div>
  );
}