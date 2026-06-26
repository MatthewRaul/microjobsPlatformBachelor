import { useEffect, useState } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { getPublicUserReviews, getPublicUserRating } from "../api/userApi";
import "../styles/auth.css";

export default function PublicUserReviewsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { jobId, reviewedUserId, canLeaveReview } = location.state || {};

  const [reviews, setReviews] = useState([]);
  const [ratingData, setRatingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        setError("");
        const [reviewsData, ratingResponse] = await Promise.all([
          getPublicUserReviews(id),
          getPublicUserRating(id),
        ]);
        setReviews(reviewsData || []);
        setRatingData(ratingResponse || null);
      } catch {
        setError("Nu am putut încărca review-urile.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchReviews();
    else { setLoading(false); setError("Utilizator invalid."); }
  }, [id]);

  if (loading) return <div className="page"><p>Se încarcă review-urile...</p></div>;
  if (error)   return <div className="page"><p className="error-message">{error}</p></div>;

  const avgRating = ratingData?.averageRating ?? 0;
  const reviewCount = ratingData?.reviewCount ?? 0;

  return (
    <section className="page" style={{ maxWidth: "640px" }}>

      {ratingData && (
        <div className="profile-card--accent" style={{ marginBottom: "20px" }}>
          <p className="section-label">Rating general</p>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <div style={{ display: "flex", gap: "2px" }}>
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i} className={i < Math.round(avgRating) ? "star--active" : "star--inactive"}
                  style={{ fontSize: "22px" }}>★</span>
              ))}
            </div>
            <span style={{ fontSize: "22px", fontWeight: "700", color: "var(--color-text-light)" }}>
              {Number(avgRating).toFixed(1)}
            </span>
            <span style={{ fontSize: "14px", color: "var(--color-text-light-60)" }}>/ 5</span>
          </div>
          <span style={{ fontSize: "13px", color: "var(--color-text-light-70)" }}>
            {reviewCount} {reviewCount === 1 ? "recenzie" : "recenzii"}
          </span>
          {canLeaveReview && jobId && reviewedUserId && (
            <div style={{ marginTop: "12px" }}>
              <Link to={`/jobs/${jobId}/review/${reviewedUserId}`} className="icon-btn icon-btn--review" style={{ display: "inline-flex" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                Lasă review
              </Link>
            </div>
          )}
        </div>
      )}

      {reviews.length === 0 ? (
        <div className="profile-card" style={{ textAlign: "center", color: "var(--color-text-muted)", fontSize: "15px" }}>
          Acest utilizator nu are încă recenzii.
        </div>
      ) : (
        reviews.map((review) => (
          <div key={review.id} className="profile-card" style={{ marginBottom: "12px" }}>
            <p style={{ fontWeight: "700", fontSize: "15px", color: "var(--color-text-dark)", margin: "0 0 8px" }}>
              {review.reviewerFirstName || "Utilizator"} {review.reviewerLastName || ""}
            </p>
            <div style={{ display: "flex", gap: "2px", marginBottom: "10px" }}>
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i} style={{ color: i < (review.rating || 0) ? "var(--color-star-active)" : "#e5e7eb", fontSize: "18px" }}>★</span>
              ))}
            </div>
            <p style={{
              fontSize: "14px",
              color: review.message?.trim() ? "var(--color-text-medium)" : "#aaa",
              lineHeight: "1.6",
              fontStyle: review.message?.trim() ? "normal" : "italic",
              margin: "0 0 10px",
            }}>
              {review.message?.trim() ? review.message : "Fără comentariu."}
            </p>
            <p style={{ fontSize: "12px", color: "#aaa", margin: 0 }}>
              {review.createdAt ? new Date(review.createdAt).toLocaleString("ro-RO", { dateStyle: "medium", timeStyle: "short" }) : ""}
            </p>
          </div>
        ))
      )}
    </section>
  );
}