import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  getJobById,
  applyToJob,
  getApplicationsForJob,
  acceptApplication,
  rejectApplication,
  completeJob,
  deleteJob,
  getMyApplications,
  withdrawApplication,
} from "../api/jobApi";
import { getPublicUserProfile, getPublicUserRating } from "../api/userApi";
import { useAuth } from "../context/AuthContext";

// ── SVG icons ──────────────────────────────────────────────
const IconDoc = () => (
  <svg className="job-meta__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
  </svg>
);
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
const IconClock = () => (
  <svg className="job-meta__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IconEdit = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const IconCancel = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
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
const IconStar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14, display: "inline", verticalAlign: "middle", marginRight: 3 }}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const IconUser = () => (
  <svg className="job-meta__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconMail = () => (
  <svg className="job-meta__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

// ── Status badge ────────────────────────────────────────────
const STATUS_LABEL = {
  OPEN: "Deschis", FILLED: "Locuri ocupate", IN_PROGRESS: "În desfășurare",
  COMPLETED: "Finalizat", CANCELED: "Anulat",
};

function StatusBadge({ status }) {
  const colors = {
    OPEN:        { background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.4)" },
    FILLED:      { background: "rgba(251,191,36,0.2)",  color: "#fde68a", border: "1px solid rgba(251,191,36,0.4)" },
    IN_PROGRESS: { background: "rgba(96,165,250,0.2)",  color: "#bfdbfe", border: "1px solid rgba(96,165,250,0.4)" },
    COMPLETED:   { background: "rgba(52,211,153,0.2)",  color: "var(--color-success-light)", border: "1px solid rgba(52,211,153,0.4)" },
    CANCELED:    { background: "rgba(248,113,113,0.2)", color: "#fecaca", border: "1px solid rgba(248,113,113,0.4)" },
  };
  const s = colors[status] || colors.OPEN;
  return (
    <span style={{
      ...s,
      display: "inline-block",
      padding: "3px 14px",
      borderRadius: "999px",
      fontSize: "13px",
      fontWeight: 600,
      marginBottom: "16px",
    }}>
      {STATUS_LABEL[status] || status}
    </span>
  );
}

// ── Modal generic ───────────────────────────────────────────
function ConfirmModal({ open, title, description, confirmText, onConfirm, onCancel, disabled, danger }) {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed", inset: 0,
      backgroundColor: "rgba(0,0,0,0.55)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 9999,
    }}>
      <div role="dialog" aria-modal="true" style={{
        backgroundColor: "white", padding: "28px 24px",
        borderRadius: "12px", minWidth: "300px", maxWidth: "420px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
      }}>
        <h3 style={{ marginBottom: 10, color: "var(--color-text-dark)" }}>{title}</h3>
        <p style={{ color: "var(--color-text-medium)", marginBottom: 20, lineHeight: 1.5 }}>{description}</p>
        <div className="modal-dialog__actions">
          <button
            className={`primary-button modal-dialog__btn-confirm${danger ? " modal-dialog__btn-danger" : ""}`}
            onClick={onConfirm}
            disabled={disabled}
          >
            {confirmText}
          </button>
          <button
            className="primary-button modal-dialog__btn-cancel"
            onClick={onCancel}
            disabled={disabled}
          >
            Renunță
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Owner card ──────────────────────────────────────────────
function OwnerCard({ ownerFirstName, ownerRating, ownerPublicProfilePath }) {
  const inner = (
    <div className="card card--accent" style={{ marginTop: 20 }}>
      <div className="job-meta">
        <div className="job-meta__item">
          <IconUser />
          <span>Postat de <strong>{ownerFirstName}</strong></span>
        </div>
        <div className="job-meta__item">
          <IconStar />
          <span>
            {ownerRating?.averageRating != null
              ? Number(ownerRating.averageRating).toFixed(1)
              : "0.0"}
          </span>
          <span style={{ opacity: 0.65, fontSize: 13 }}>
            · {ownerRating?.reviewCount ?? 0} review-uri
            {ownerPublicProfilePath ? " · Apasă pentru profil" : ""}
          </span>
        </div>
      </div>
    </div>
  );

  if (ownerPublicProfilePath) {
    return (
      <Link to={ownerPublicProfilePath} style={{ display: "block", textDecoration: "none", color: "inherit" }}>
        {inner}
      </Link>
    );
  }
  return inner;
}

// ════════════════════════════════════════════════════════════
export default function JobDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [hasApplied, setHasApplied] = useState(false);
  const [myApplicationId, setMyApplicationId] = useState(null);
  const [ownerProfile, setOwnerProfile] = useState(null);
  const [ownerRating, setOwnerRating] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [pendingAppId, setPendingAppId] = useState(null);
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
          } else setOwnerRating(null);
        } catch {
          setOwnerProfile(null);
          setOwnerRating(null);
        }
      }

      const currentOwner = !!user && !!jobData?.postedBy && jobData.postedBy === user.email;

      try {
        if (isAuthenticated && user) {
          const applicationsData = await getApplicationsForJob(id);
          setApplications(applicationsData || []);
        } else {
          setApplications([]);
        }
      } catch { setApplications([]); }

      if (isAuthenticated && user && !currentOwner) {
        try {
          const myApps = await getMyApplications();
          const myApp = myApps.find((a) => a.jobId === id);
          setHasApplied(!!myApp);
          setMyApplicationId(myApp?.id || myApp?._id || null);
        } catch {
          setHasApplied(false);
          setMyApplicationId(null);
        }
      } else {
        setHasApplied(false);
        setMyApplicationId(null);
      }
    } catch {
      setError("Nu am putut încărca jobul.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (id) fetchJobDetails(); }, [id, user, isAuthenticated]);

  const isOwner = !!job && !!user && job.postedBy === user.email;
  const isFilled = !!job && (job.status === "FILLED" || ((job.acceptedWorkers ?? 0) >= (job.neededWorkers ?? 0) && (job.neededWorkers ?? 0) > 0));
  const isClosed = !!job && (job.status === "CANCELED" || job.status === "COMPLETED");
  const isInProgress = !!job && job.status === "IN_PROGRESS";

  const acceptedApplications = useMemo(() => applications.filter((a) => a.status === "ACCEPTED"), [applications]);
  const pendingApplications  = useMemo(() => applications.filter((a) => a.status === "PENDING"),  [applications]);

  const isAcceptedParticipant = !!user && acceptedApplications.some(
    (a) => (user.id && a.applicantUserId && a.applicantUserId === user.id) ||
           (user.email && a.applicantEmail && a.applicantEmail === user.email)
  );
  const currentUserParticipated = !!job && !!user && (isOwner || isAcceptedParticipant);

  const ownerFirstName = ownerProfile?.firstName?.trim() || job?.postedBy?.split("@")[0] || "Utilizator";
  const ownerPublicProfilePath = job?.postedBy ? `/users/public/${encodeURIComponent(job.postedBy)}` : null;

  const confirmApply = async () => {
    try {
      setIsApplying(true);
      await applyToJob(id);
      setHasApplied(true);
      setShowApplyModal(false);
      await fetchJobDetails();
    } catch { setMessage("Nu s-a putut trimite aplicarea."); }
    finally { setIsApplying(false); }
  };

  const confirmWithdraw = async () => {
    if (!myApplicationId) { setMessage("Nu s-a găsit ID-ul aplicării."); setShowWithdrawModal(false); return; }
    try {
      setIsWithdrawing(true);
      await withdrawApplication(myApplicationId);
      setHasApplied(false);
      setMyApplicationId(null);
      setShowWithdrawModal(false);
      await fetchJobDetails();
    } catch { setMessage("Nu s-a putut retrage aplicarea."); }
    finally { setIsWithdrawing(false); }
  };

  const handleAccept = (appId) => {
    setPendingAppId(appId);
    setShowAcceptModal(true);
  };
  const handleReject = (appId) => {
    setPendingAppId(appId);
    setShowRejectModal(true);
  };
  const confirmAccept = async () => {
    try {
      setIsActioning(true);
      await acceptApplication(pendingAppId);
      setShowAcceptModal(false);
      setPendingAppId(null);
      await fetchJobDetails();
    } catch { setMessage("Nu s-a putut accepta aplicarea."); }
    finally { setIsActioning(false); }
  };
  const confirmReject = async () => {
    try {
      setIsActioning(true);
      await rejectApplication(pendingAppId);
      setShowRejectModal(false);
      setPendingAppId(null);
      await fetchJobDetails();
    } catch { setMessage("Nu s-a putut respinge aplicarea."); }
    finally { setIsActioning(false); }
  };
  const handleCompleteJob = async () => {
    try { await completeJob(id); await fetchJobDetails(); }
    catch { setMessage("Nu s-a putut finaliza jobul."); }
  };
  const handleDeleteJob = async () => {
    if (!window.confirm("Sigur vrei să ștergi acest job?")) return;
    try { await deleteJob(id); navigate("/"); }
    catch { setMessage("Nu s-a putut șterge jobul."); }
  };

  if (loading) return <div className="page"><p>Se încarcă jobul...</p></div>;
  if (error)   return <div className="page"><p className="error-message">{error}</p></div>;
  if (!job)    return <div className="page"><p>Jobul nu există.</p></div>;

  const formatDate = (d) => d ? new Date(d).toLocaleString("ro-RO", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : null;
  const startFmt = formatDate(job.startDate);
  const endFmt   = formatDate(job.endDate);

  return (
    <div className="page">

      {/* ── Card principal job ── */}
      <div className="card">
        <div className="job-title">{job.title}</div>

        <StatusBadge status={job.status} />

        <div className="job-meta">
          {job.description && (
            <div className="job-meta__item">
              <IconDoc />
              <span>{job.description}</span>
            </div>
          )}
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
          {(startFmt || endFmt) && (
            <div className="job-meta__item">
              <IconClock />
              <span>
                {startFmt && endFmt ? `${startFmt} — ${endFmt}` : startFmt || endFmt}
              </span>
            </div>
          )}
        </div>

        {/* Acțiuni owner */}
        {isOwner && (
          <div className="owner-actions" style={{ marginTop: 20 }}>
            <Link to={`/jobs/${id}/edit`} className="icon-btn icon-btn--edit">
              <IconEdit /> Editează
            </Link>
            <button className="icon-btn icon-btn--info" onClick={handleCompleteJob}>
              <IconCheck /> Finalizează
            </button>
            <button className="icon-btn icon-btn--delete" onClick={handleDeleteJob}>
              <IconTrash /> Șterge
            </button>
          </div>
        )}

        {/* Acțiuni aplicant */}
        {!isOwner && (
          <div className="job-actions" style={{ marginTop: 20 }}>
            {hasApplied ? (
              <>
                <div className="status-box applied-box">Ai aplicat deja la acest job</div>
                {!isClosed && (
                  <button className="icon-btn icon-btn--delete" onClick={() => setShowWithdrawModal(true)}>
                    <IconCancel /> Retrage aplicarea
                  </button>
                )}
              </>
            ) : isClosed ? (
              <div className="status-box filled-box">Jobul nu mai este disponibil</div>
            ) : isInProgress ? (
              <div className="status-box filled-box">Job în desfășurare</div>
            ) : isFilled ? (
              <div className="status-box filled-box">Locurile s-au ocupat</div>
            ) : (
              <button className="primary-button" style={{ width: "auto", padding: "10px 28px" }}
                onClick={() => isAuthenticated ? setShowApplyModal(true) : navigate("/login")}>
                Aplică
              </button>
            )}
          </div>
        )}

        {message && (
          <p className={message.includes("succes") ? "msg--success-on-dark" : "msg--error-on-dark"}>
            {message}
          </p>
        )}
      </div>

      {/* ── Card owner ── */}
      {!isOwner && (() => {
        const ownerUserId = ownerProfile?.id || null;
        const canReviewOwner = job.status === "COMPLETED" && isAcceptedParticipant && !!ownerUserId;
        return (
          <div
            className="card card--accent"
            onClick={() => ownerPublicProfilePath && navigate(ownerPublicProfilePath)}
          >
            <div className="job-meta">
              <div className="job-meta__item"><IconUser /><span style={{ fontWeight: 600 }}>{ownerFirstName}</span></div>
              {job.postedBy && <div className="job-meta__item"><IconMail /><span>{job.postedBy}</span></div>}
              <div className="job-meta__item">
                <IconStar />
                <span>{ownerRating?.averageRating != null ? Number(ownerRating.averageRating).toFixed(1) : "0.0"}</span>
                <span style={{ opacity: 0.65, fontSize: 13 }}>· {ownerRating?.reviewCount ?? 0} review-uri</span>
              </div>
            </div>
            {canReviewOwner && (
              <div className="owner-actions" style={{ marginTop: 14 }}>
                <Link to={`/jobs/${id}/review/${ownerUserId}`} className="icon-btn--review" onClick={(e) => e.stopPropagation()}>
                  <IconStar /> Lasă review
                </Link>
              </div>
            )}
            {ownerPublicProfilePath && <p style={{ marginTop: 10, fontSize: 13, opacity: 0.6 }}>› Apasă pentru profil public</p>}
          </div>
        );
      })()}

      {/* ── Participanți acceptați ── */}
      {(isOwner || isAcceptedParticipant) && acceptedApplications.length > 0 && (
        <>
          <h2 style={{ marginTop: 32, marginBottom: 12, color: "#1f2937" }}>Participanți acceptați</h2>
          {acceptedApplications.map((app) => {
            const name = [app.applicantFirstName, app.applicantLastName].filter(Boolean).join(" ") || app.applicantEmail || "Utilizator";
            const appUserId = app.applicantUserId || null;
            const isSameUser = (user?.id && appUserId && user.id === appUserId) || (user?.email && app.applicantEmail && user.email === app.applicantEmail);
            const canReview = job.status === "COMPLETED" && !isSameUser && !!appUserId;
            const profilePath = app.applicantEmail ? `/users/public/${encodeURIComponent(app.applicantEmail)}` : null;
            return (
              <div
                key={app.id || app._id}
                className="card card--accent"
                onClick={() => profilePath && navigate(profilePath)}
              >
                <div className="job-meta">
                  <div className="job-meta__item"><IconUser /><span style={{ fontWeight: 600 }}>{name}</span></div>
                  {app.applicantEmail && <div className="job-meta__item"><IconMail /><span>{app.applicantEmail}</span></div>}
                  <div className="job-meta__item">
                    <IconStar />
                    <span>{app.applicantAverageRating != null ? Number(app.applicantAverageRating).toFixed(1) : "0.0"}</span>
                    <span style={{ opacity: 0.65, fontSize: 13 }}>· {app.applicantReviewCount || 0} review-uri</span>
                  </div>
                </div>
                {canReview && (
                  <div className="owner-actions" style={{ marginTop: 14 }}>
                    <Link to={`/jobs/${id}/review/${appUserId}`} className="icon-btn--review" onClick={(e) => e.stopPropagation()}>
                      <IconStar /> Lasă review
                    </Link>
                  </div>
                )}
                {profilePath && <p className="hint-text">› Apasă pentru profil public</p>}
              </div>
            );
          })}
        </>
      )}

      {/* ── Aplicanți în așteptare (owner) ── */}
      {isOwner && (
        <>
          <h2 style={{ marginTop: 32, marginBottom: 12, color: "#1f2937" }}>Aplicanți în așteptare</h2>
          {pendingApplications.length === 0 ? (
            <p>Nu există aplicări în așteptare.</p>
          ) : pendingApplications.map((app) => {
            const name = [app.applicantFirstName, app.applicantLastName].filter(Boolean).join(" ") || app.applicantEmail || "Utilizator";
            const appId = app.id || app._id;
            return (
              <div key={appId} className="card card--white">
  <div className="job-meta">
    <div className="job-meta__item"><IconUser /><span>{name}</span></div>
    {app.applicantEmail && <div className="job-meta__item"><IconMail /><span>{app.applicantEmail}</span></div>}
  </div>
  <div className="owner-actions" style={{ marginTop: 14 }}>
    {app.applicantEmail && (
      <Link to={`/users/public/${encodeURIComponent(app.applicantEmail)}`} className="icon-btn icon-btn--info">
        <IconUser /> Vezi profil
      </Link>
    )}
    <button className="icon-btn icon-btn--edit" onClick={() => handleAccept(appId)}>
      <IconCheck /> Acceptă
    </button>
    <button className="icon-btn icon-btn--delete" onClick={() => handleReject(appId)}>
      <IconCancel /> Respinge
    </button>
  </div>
</div>
            );
          })}
        </>
      )}

      {/* ── Modals ── */}
      <ConfirmModal
        open={showApplyModal}
        title="Confirmare aplicare"
        description="Sigur vrei să aplici la acest job?"
        confirmText={isApplying ? "Se trimite..." : "Da, aplică"}
        onConfirm={confirmApply}
        onCancel={() => setShowApplyModal(false)}
        disabled={isApplying}
      />
      <ConfirmModal
        open={showWithdrawModal}
        title="Retragere aplicare"
        description="Sigur vrei să îți retragi aplicarea? Această acțiune nu poate fi anulată."
        confirmText={isWithdrawing ? "Se retrage..." : "Da, retrage"}
        onConfirm={confirmWithdraw}
        onCancel={() => setShowWithdrawModal(false)}
        disabled={isWithdrawing}
        danger
      />
      <ConfirmModal
        open={showAcceptModal}
        title="Acceptă aplicare"
        description="Sigur vrei să accepți această aplicare?"
        confirmText={isActioning ? "Se procesează..." : "Da, acceptă"}
        onConfirm={confirmAccept}
        onCancel={() => { setShowAcceptModal(false); setPendingAppId(null); }}
        disabled={isActioning}
      />
      <ConfirmModal
        open={showRejectModal}
        title="Respinge aplicare"
        description="Sigur vrei să respingi această aplicare?"
        confirmText={isActioning ? "Se procesează..." : "Da, respinge"}
        onConfirm={confirmReject}
        onCancel={() => { setShowRejectModal(false); setPendingAppId(null); }}
        disabled={isActioning}
        danger
      />
    </div>
  );
}