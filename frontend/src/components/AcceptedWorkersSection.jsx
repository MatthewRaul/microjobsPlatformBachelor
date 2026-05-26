import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAplicariForJob } from "../api/jobApi";
import { getMe } from "../api/userApi";

export default function AcceptedWorkersSection({ job }) {
  const [acceptedWorkers, setAcceptedWorkers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError("");
        const [aplicariData, meData] = await Promise.all([
          getAplicariForJob(job.id),
          getMe(),
        ]);
        const accepted = aplicariData.filter((a) => a.status === "ACCEPTED");
        setAcceptedWorkers(accepted);
        setCurrentUser(meData);
      } catch {
        setError("Nu am putut încărca participanții jobului.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [job.id]);

  if (loading) return <div className="page"><p>Se încarcă participanții...</p></div>;
  if (error)   return <div className="page"><p className="error-message">{error}</p></div>;
  if (acceptedWorkers.length === 0) return <div className="page"><p>Nu există participanți acceptați.</p></div>;

  return (
    <div style={{ marginTop: "30px" }}>
      <h2>Participanți acceptați</h2>
      {acceptedWorkers.map((worker) => {
        const canReview =
          job.status === "COMPLETED" &&
          currentUser &&
          currentUser.id !== worker.applicantUserId;

        return (
          <div key={worker.id} className="worker-card">
            <div className="worker-card__info">
              <div className="worker-card__name">
                {worker.applicantFirstName} {worker.applicantLastName}
              </div>
              <div className="worker-card__email">{worker.applicantEmail}</div>
              <div className="worker-card__rating">
                ⭐ {worker.applicantAverageRating?.toFixed(1) ?? "0.0"}
                <span className="worker-card__review-count">
                  ({worker.applicantReviewCount || 0} review-uri)
                </span>
              </div>
            </div>

            <div className="worker-card__actions">
              {worker.applicantUserId && (
                <Link to={`/users/${worker.applicantUserId}`} className="icon-btn icon-btn--info">
                  Vezi profil
                </Link>
              )}
              {canReview && worker.applicantUserId && (
                <Link to={`/jobs/${job.id}/review/${worker.applicantUserId}`} className="icon-btn icon-btn--review">
                  Lasă review
                </Link>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}