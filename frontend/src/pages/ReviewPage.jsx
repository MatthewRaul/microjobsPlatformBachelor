import { useParams, useNavigate } from "react-router-dom";
import AddReviewForm from "../components/AddReviewForm";
import "../styles/auth.css";

export default function ReviewPage() {
  const { jobId, reviewedUserId } = useParams();
  const navigate = useNavigate();

  if (
    !jobId ||
    !reviewedUserId ||
    jobId === "undefined" ||
    reviewedUserId === "undefined" ||
    jobId === "null" ||
    reviewedUserId === "null"
  ) {
    return (
      <section className="auth-page">
        <div className="form-box">
          <p style={{ color: "rgba(255,255,255,0.8)", textAlign: "center" }}>
            Date lipsă pentru adăugarea review-ului.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="auth-page">
      <div className="form-box">
        <button
          onClick={() => navigate(-1)}
          style={{
            background: "none", border: "none",
            color: "rgba(255,255,255,0.7)", cursor: "pointer",
            fontSize: "14px", padding: "0 0 16px 0",
            display: "flex", alignItems: "center", gap: "6px",
            fontFamily: "inherit",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Înapoi
        </button>

        <h1>Lasă un review</h1>

        <AddReviewForm
          jobId={jobId}
          reviewedUserId={reviewedUserId}
          onReviewCreated={() => navigate(`/users/public/${reviewedUserId}/reviews`)}
        />
      </div>
    </section>
  );
}