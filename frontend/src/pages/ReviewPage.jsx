import { useParams, Link, useNavigate } from "react-router-dom";
import AddReviewForm from "../components/AddReviewForm";

export default function ReviewPage() {
  const { jobId, reviewedUserId } = useParams();
  const navigate = useNavigate();

  console.log("ReviewPage params:", { jobId, reviewedUserId });

  if (
    !jobId ||
    !reviewedUserId ||
    jobId === "undefined" ||
    reviewedUserId === "undefined" ||
    jobId === "null" ||
    reviewedUserId === "null"
  ) {
    return (
      <div style={{ padding: "20px", maxWidth: "700px", margin: "0 auto" }}>
        <p>Date lipsă pentru adăugarea review-ului.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "700px", margin: "0 auto" }}>
      <div style={{ marginBottom: "16px" }}>
        <Link
          to={`/jobs/${jobId}`}
          style={{ textDecoration: "none", color: "#0077cc" }}
        >
          ← Înapoi la job
        </Link>
      </div>

      <h1>Adaugă review</h1>
      <p>Acordă o notă și, opțional, scrie un mesaj despre colaborare.</p>

      <AddReviewForm
        jobId={jobId}
        reviewedUserId={reviewedUserId}
        onReviewCreated={() => navigate(`/users/public/${reviewedUserId}/reviews`)}
      />
    </div>
  );
}