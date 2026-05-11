import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getPublicUserReviews, getPublicUserRating } from "../api/userApi";

export default function PublicUserReviewsPage() {
  const { id } = useParams();

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

    if (id) {
      fetchReviews();
    } else {
      setLoading(false);
      setError("Utilizator invalid.");
    }
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
        <p>Se încarcă review-urile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ marginBottom: "20px" }}>
        <Link
          to={`/users/public/${id}`}
          style={{ textDecoration: "none", color: "#0077cc" }}
        >
          ← Înapoi la profil
        </Link>
      </div>

      <h1>Review-uri utilizator</h1>

      {ratingData && (
        <div
          style={{
            marginBottom: "20px",
            padding: "14px 16px",
            border: "1px solid #ddd",
            borderRadius: "10px",
            backgroundColor: "#fafafa",
          }}
        >
          <strong>
            Rating mediu: ⭐ {ratingData.averageRating?.toFixed(1) ?? "0.0"}
          </strong>
          <div>{ratingData.reviewCount || 0} review-uri</div>
        </div>
      )}

      {reviews.length === 0 ? (
        <p>Acest utilizator nu are încă review-uri.</p>
      ) : (
        reviews.map((review) => (
          <div
            key={review.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "10px",
              padding: "16px",
              marginBottom: "16px",
              backgroundColor: "white",
            }}
          >
            <div style={{ marginBottom: "8px" }}>
              <strong>
                {review.reviewerFirstName || "Utilizator"}{" "}
                {review.reviewerLastName || ""}
              </strong>
            </div>

            <div style={{ marginBottom: "8px", fontSize: "18px" }}>
              {"⭐".repeat(review.rating || 0)}
            </div>

            <div style={{ marginBottom: "8px", color: "#444" }}>
              {review.message?.trim() ? review.message : "Fără comentariu."}
            </div>

            <div style={{ fontSize: "13px", color: "#777" }}>
              {review.createdAt
                ? new Date(review.createdAt).toLocaleString("ro-RO")
                : ""}
            </div>
          </div>
        ))
      )}
    </div>
  );
}