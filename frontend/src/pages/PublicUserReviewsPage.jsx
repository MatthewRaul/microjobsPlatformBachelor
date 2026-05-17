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
      } catch (err) {
        console.log("EROARE REVIEWS PAGE", err);
        setError("Nu am putut încărca review-urile.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchReviews();
    else { setLoading(false); setError("Utilizator invalid."); }
  }, [id]);

  if (loading) return <div style={{ padding: "20px" }}>Se încarcă review-urile...</div>;
  if (error) return <div style={{ padding: "20px", color: "#dc2626" }}>{error}</div>;

  const avgRating = ratingData?.averageRating ?? 0;
  const reviewCount = ratingData?.reviewCount ?? 0;

  return (
    <section className="page" style={{ maxWidth: "640px" }}>

      {/* Buton inapoi */}
      <button
        onClick={() => navigate(-1)}
        style={{
          background: "none", border: "none", color: "#555",
          cursor: "pointer", fontSize: "14px", padding: "0 0 16px 0",
          display: "flex", alignItems: "center", gap: "6px",
          fontFamily: "inherit",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Înapoi la profil
      </button>

      {/* ===== CARD VERDE — Sumar rating ===== */}
      {ratingData && (
        <div style={{
          background: "#40826D",
          borderRadius: "12px",
          padding: "20px 24px",
          marginBottom: "20px",
          boxShadow: "0 4px 16px rgba(64,130,109,0.35)",
        }}>
          <p style={{ fontSize: "12px", fontWeight: "600", color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 12px" }}>
            Rating general
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <div style={{ display: "flex", gap: "2px" }}>
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i} style={{ color: i < Math.round(avgRating) ? "#facc15" : "rgba(255,255,255,0.25)", fontSize: "22px" }}>
                  ★
                </span>
              ))}
            </div>
            <span style={{ fontSize: "22px", fontWeight: "700", color: "#ffffff" }}>
              {Number(avgRating).toFixed(1)}
            </span>
            <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)" }}>/ 5</span>
          </div>

          <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>
            {reviewCount} {reviewCount === 1 ? "recenzie" : "recenzii"}
          </span>

          {canLeaveReview && jobId && reviewedUserId && (
            <div style={{ marginTop: "12px" }}>
              <Link
                to={`/jobs/${jobId}/review/${reviewedUserId}`}
                className="icon-btn icon-btn--review"
                style={{ display: "inline-flex" }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                Lasă review
              </Link>
            </div>
          )}
        </div>
      )}

      {/* ===== CARDURI ALBE — Review-uri individuale ===== */}
      {reviews.length === 0 ? (
        <div style={{
          background: "#ffffff",
          borderRadius: "12px",
          padding: "24px",
          textAlign: "center",
          boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
          color: "#888",
          fontSize: "15px",
        }}>
          Acest utilizator nu are încă recenzii.
        </div>
      ) : (
        reviews.map((review) => (
          <div key={review.id} style={{
            background: "#ffffff",
            borderRadius: "12px",
            padding: "20px 24px",
            marginBottom: "12px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
          }}>
            {/* Nume reviewer */}
            <p style={{ fontWeight: "700", fontSize: "15px", color: "#111", margin: "0 0 8px" }}>
              {review.reviewerFirstName || "Utilizator"}{" "}
              {review.reviewerLastName || ""}
            </p>

            {/* Stele */}
            <div style={{ display: "flex", gap: "2px", marginBottom: "10px" }}>
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i} style={{ color: i < (review.rating || 0) ? "#facc15" : "#e5e7eb", fontSize: "18px" }}>
                  ★
                </span>
              ))}
            </div>

            {/* Mesaj */}
            <p style={{
              fontSize: "14px",
              color: review.message?.trim() ? "#333" : "#aaa",
              lineHeight: "1.6",
              fontStyle: review.message?.trim() ? "normal" : "italic",
              margin: "0 0 10px",
            }}>
              {review.message?.trim() ? review.message : "Fără comentariu."}
            </p>

            {/* Data */}
            <p style={{ fontSize: "12px", color: "#aaa", margin: 0 }}>
              {review.createdAt
                ? new Date(review.createdAt).toLocaleString("ro-RO", { dateStyle: "medium", timeStyle: "short" })
                : ""}
            </p>
          </div>
        ))
      )}

    </section>
  );
}