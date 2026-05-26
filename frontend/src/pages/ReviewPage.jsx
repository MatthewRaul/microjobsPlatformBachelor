import { useParams, useNavigate } from "react-router-dom";
import AddReviewForm from "../components/AddReviewForm";
import "../styles/auth.css";

export default function ReviewPage() {
  const { jobId, reviewedUserId } = useParams();
  const navigate = useNavigate();

  if (!jobId || !reviewedUserId || jobId === "undefined" || reviewedUserId === "undefined" || jobId === "null" || reviewedUserId === "null") {
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