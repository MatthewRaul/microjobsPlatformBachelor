import { useParams, useNavigate, useLocation } from "react-router-dom";
import AddReviewForm from "../components/AddReviewForm";

export default function ReviewPage() {
  const { jobId, reviewedUserId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // De unde am venit — trimis prin state la navigate din JobDetailsPage
  // Daca nu e specificat, implicit ne intoarcem la job
  const fromProfile = location.state?.fromProfile === true;
  const reviewedUserEmail = location.state?.reviewedUserEmail || null;

  const handleBack = () => {
    navigate(`/jobs/${jobId}`);
  };

  // Dupa ce review-ul e trimis, ne intoarcem la job
  const handleReviewCreated = () => {
    navigate(`/jobs/${jobId}`);
  };

  if (
    !jobId || !reviewedUserId ||
    jobId === "undefined" || reviewedUserId === "undefined" ||
    jobId === "null" || reviewedUserId === "null"
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
        <button
          onClick={handleBack}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#0077cc",
            fontSize: "15px",
            padding: 0,
          }}
        >
          ← Înapoi la job
        </button>
      </div>

      <h1>Adaugă review</h1>
      <p>Acordă o notă și, opțional, scrie un mesaj despre colaborare.</p>

      <AddReviewForm
        jobId={jobId}
        reviewedUserId={reviewedUserId}
        onReviewCreated={handleReviewCreated}
      />
    </div>
  );
}