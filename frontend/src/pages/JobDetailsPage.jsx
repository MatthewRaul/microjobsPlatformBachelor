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
import StatusBadge from "../components/StatusBadge";
import ConfirmModal from "../components/ConfirmModal";
import {
  IconDoc, IconLocation, IconUsers, IconMoney, IconClock,
  IconEdit, IconCancel, IconCheck, IconTrash, IconStar,
  IconUser, IconMail,
} from "../components/Icons";

function OwnerCard({ ownerFirstName, ownerRating, ownerPublicProfilePath }) {
  const inner = (
    <div className="card card--accent" style={{ marginTop: 20 }}>
      <div className="job-meta">
        <div className="job-meta__item">
          <IconUser />
          <span>Postat de <strong>{ownerFirstName}</strong></span>
        </div>
        <div className="job-meta__item">
          <IconStar small />
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
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [showDeleteJobModal, setShowDeleteJobModal] = useState(false);
  const [isDeletingJob, setIsDeletingJob] = useState(false);

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
  const handleCompleteJob = () => setShowCompleteModal(true);
  const confirmCompleteJob = async () => {
    try {
      setIsCompleting(true);
      await completeJob(id);
      setShowCompleteModal(false);
      await fetchJobDetails();
    } catch { setMessage("Nu s-a putut finaliza jobul."); }
    finally { setIsCompleting(false); }
  };
  const handleDeleteJob = () => setShowDeleteJobModal(true);
  const confirmDeleteJob = async () => {
    try {
      setIsDeletingJob(true);
      await deleteJob(id);
      navigate("/");
    } catch {
      setMessage("Nu s-a putut șterge jobul.");
      setShowDeleteJobModal(false);
      setIsDeletingJob(false);
    }
  };

  if (loading) return <div className="page"><p>Se încarcă jobul...</p></div>;
  if (error)   return <div className="page"><p className="error-message">{error}</p></div>;
  if (!job)    return <div className="page"><p>Jobul nu există.</p></div>;

  const formatDate = (d) => d ? new Date(d).toLocaleString("ro-RO", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : null;
  const startFmt = formatDate(job.startDate);
  const endFmt   = formatDate(job.endDate);

  return (
    <div className="page">
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

        {isOwner && !isClosed && (
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
                <IconStar small />
                <span>{ownerRating?.averageRating != null ? Number(ownerRating.averageRating).toFixed(1) : "0.0"}</span>
                <span style={{ opacity: 0.65, fontSize: 13 }}>· {ownerRating?.reviewCount ?? 0} review-uri</span>
              </div>
            </div>
            {canReviewOwner && (
              <div className="owner-actions" style={{ marginTop: 14 }}>
                <Link to={`/jobs/${id}/review/${ownerUserId}`} className="icon-btn--review" onClick={(e) => e.stopPropagation()}>
                  <IconStar small /> Lasă review
                </Link>
              </div>
            )}
            {ownerPublicProfilePath && <p style={{ marginTop: 10, fontSize: 13, opacity: 0.6 }}>› Apasă pentru profil public</p>}
          </div>
        );
      })()}

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
                    <IconStar small />
                    <span>{app.applicantAverageRating != null ? Number(app.applicantAverageRating).toFixed(1) : "0.0"}</span>
                    <span style={{ opacity: 0.65, fontSize: 13 }}>· {app.applicantReviewCount || 0} review-uri</span>
                  </div>
                </div>
                {canReview && (
                  <div className="owner-actions" style={{ marginTop: 14 }}>
                    <Link to={`/jobs/${id}/review/${appUserId}`} className="icon-btn--review" onClick={(e) => e.stopPropagation()}>
                      <IconStar small /> Lasă review
                    </Link>
                  </div>
                )}
                {profilePath && <p className="hint-text">› Apasă pentru profil public</p>}
              </div>
            );
          })}
        </>
      )}

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

      <ConfirmModal
        open={showApplyModal}
        title="Confirmare aplicare"
        message="Sigur vrei să aplici la acest job?"
        confirmText="Da, aplică"
        onConfirm={confirmApply}
        onCancel={() => setShowApplyModal(false)}
        isLoading={isApplying}
      />
      <ConfirmModal
        open={showWithdrawModal}
        title="Retragere aplicare"
        message="Sigur vrei să îți retragi aplicarea? Această acțiune nu poate fi anulată."
        confirmText="Da, retrage"
        onConfirm={confirmWithdraw}
        onCancel={() => setShowWithdrawModal(false)}
        isLoading={isWithdrawing}
        danger
      />
      <ConfirmModal
        open={showAcceptModal}
        title="Acceptă aplicare"
        message="Sigur vrei să accepți această aplicare?"
        confirmText="Da, acceptă"
        onConfirm={confirmAccept}
        onCancel={() => { setShowAcceptModal(false); setPendingAppId(null); }}
        isLoading={isActioning}
      />
      <ConfirmModal
        open={showRejectModal}
        title="Respinge aplicare"
        message="Sigur vrei să respingi această aplicare?"
        confirmText="Da, respinge"
        onConfirm={confirmReject}
        onCancel={() => { setShowRejectModal(false); setPendingAppId(null); }}
        isLoading={isActioning}
        danger
      />
      <ConfirmModal
        open={showCompleteModal}
        title="Finalizare job"
        message="Sigur vrei să marchezi acest job ca finalizat? Acțiunea nu poate fi anulată."
        confirmText="Da, finalizează"
        onConfirm={confirmCompleteJob}
        onCancel={() => setShowCompleteModal(false)}
        isLoading={isCompleting}
      />
      <ConfirmModal
        open={showDeleteJobModal}
        title="Ștergere job"
        message="Sigur vrei să ștergi acest job? Această acțiune nu poate fi anulată."
        confirmText="Da, șterge"
        onConfirm={confirmDeleteJob}
        onCancel={() => setShowDeleteJobModal(false)}
        isLoading={isDeletingJob}
        danger
      />
    </div>
  );
}