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

        const accepted = aplicariData.filter(
          (aplicare) => aplicare.status === "ACCEPTED"
        );

        setAcceptedWorkers(accepted);
        setCurrentUser(meData);
      } catch (err) {
        console.log("EROARE ACCEPTED WORKERS", err);
        setError("Nu am putut încărca participanții jobului.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [job.id]);

  if (loading) return <div>Se încarcă participanții...</div>;
  if (error) return <div>{error}</div>;
  if (acceptedWorkers.length === 0) return <div>Nu există participanți acceptați.</div>;

  return (
    <div style={{ marginTop: "30px" }}>
      <h2>Participanți acceptați</h2>

      {acceptedWorkers.map((worker) => {
        const canReview =
          job.status === "COMPLETED" &&
          currentUser &&
          currentUser.id !== worker.applicantUserId;

        return (
          <div
            key={worker.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "10px",
              padding: "16px",
              marginBottom: "16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div style={{ fontWeight: "bold", fontSize: "16px" }}>
                {worker.applicantFirstName} {worker.applicantLastName}
              </div>

              <div style={{ color: "#666", marginTop: "4px" }}>
                {worker.applicantEmail}
              </div>

              <div style={{ color: "#444", marginTop: "6px" }}>
                ⭐ {worker.applicantAverageRating?.toFixed(1) ?? "0.0"} ({worker.applicantReviewCount || 0} review-uri)
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {worker.applicantUserId && (
                <Link
                  to={`/users/${worker.applicantUserId}`}
                  style={{
                    padding: "8px 12px",
                    border: "1px solid #0077cc",
                    borderRadius: "8px",
                    textDecoration: "none",
                    color: "#0077cc",
                  }}
                >
                  Vezi profil
                </Link>
              )}

              {canReview && worker.applicantUserId && (
                <Link
                  to={`/jobs/${job.id}/review/${worker.applicantUserId}`}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "8px",
                    textDecoration: "none",
                    backgroundColor: "#0077cc",
                    color: "white",
                  }}
                >
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