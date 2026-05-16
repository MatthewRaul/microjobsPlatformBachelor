import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { getAllReviews, deleteReviewAsAdmin } from "../api/adminReviewsApi";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filtre
  const [searchUser, setSearchUser] = useState("");
  const [minRating, setMinRating] = useState("");
  const [maxRating, setMaxRating] = useState("");

  useEffect(() => {
    fetchReviews();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [reviews, searchUser, minRating, maxRating]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await getAllReviews();
      setReviews(data || []);
    } catch {
      setError("Nu s-au putut încărca recenziile.");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...reviews];

    // Filtrare dupa numele reviewerului sau al celui evaluat
    if (searchUser.trim()) {
      const q = searchUser.trim().toLowerCase();
      result = result.filter(
        (r) =>
          `${r.reviewerFirstName || ""} ${r.reviewerLastName || ""}`.toLowerCase().includes(q) ||
          `${r.reviewedUserFirstName || ""} ${r.reviewedUserLastName || ""}`.toLowerCase().includes(q)
      );
    }

    // Filtrare dupa rating minim
    if (minRating !== "") {
      result = result.filter((r) => r.rating >= parseInt(minRating));
    }

    // Filtrare dupa rating maxim
    if (maxRating !== "") {
      result = result.filter((r) => r.rating <= parseInt(maxRating));
    }

    setFiltered(result);
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm("Ești sigur că vrei să ștergi această recenzie?")) return;
    try {
      await deleteReviewAsAdmin(reviewId);
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    } catch {
      alert("Nu s-a putut șterge recenzia.");
    }
  };

  const handleClearFilters = () => {
    setSearchUser("");
    setMinRating("");
    setMaxRating("");
  };

  return (
    <AdminLayout title="Recenzii">
    <div>
      <h1 style={{ marginBottom: "20px" }}>Recenzii</h1>

      {/* Filtre */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          marginBottom: "20px",
          alignItems: "flex-end",
        }}
      >
        <div>
          <label style={{ fontSize: "13px", display: "block", marginBottom: "4px" }}>
            Caută după nume
          </label>
          <input
            type="text"
            placeholder="Reviewer sau evaluat..."
            value={searchUser}
            onChange={(e) => setSearchUser(e.target.value)}
            style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ddd", width: "220px" }}
          />
        </div>

        <div>
          <label style={{ fontSize: "13px", display: "block", marginBottom: "4px" }}>
            Rating minim
          </label>
          <select
            value={minRating}
            onChange={(e) => setMinRating(e.target.value)}
            style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ddd" }}
          >
            <option value="">Orice</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>{n} ⭐</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ fontSize: "13px", display: "block", marginBottom: "4px" }}>
            Rating maxim
          </label>
          <select
            value={maxRating}
            onChange={(e) => setMaxRating(e.target.value)}
            style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ddd" }}
          >
            <option value="">Orice</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>{n} ⭐</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleClearFilters}
          style={{
            padding: "8px 14px",
            borderRadius: "6px",
            border: "1px solid #ddd",
            background: "white",
            cursor: "pointer",
          }}
        >
          Resetează filtrele
        </button>
      </div>

      <p style={{ fontSize: "13px", color: "#666", marginBottom: "16px" }}>
        {filtered.length} recenz{filtered.length === 1 ? "ie" : "ii"} găsite
      </p>

      {loading && <p>Se încarcă...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && filtered.length === 0 && (
        <p style={{ color: "#888" }}>Nu există recenzii care să corespundă filtrelor.</p>
      )}

      {filtered.map((review) => (
        <div
          key={review.id}
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: "10px",
            padding: "16px",
            marginBottom: "12px",
            backgroundColor: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "16px",
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: "6px", fontSize: "14px" }}>
              <strong>
                {review.reviewerFirstName || "?"} {review.reviewerLastName || ""}
              </strong>
              <span style={{ color: "#888", margin: "0 8px" }}>→</span>
              <strong>
                {review.reviewedUserFirstName || "?"} {review.reviewedUserLastName || ""}
              </strong>
            </div>

            <div style={{ fontSize: "18px", marginBottom: "6px" }}>
              {"⭐".repeat(review.rating || 0)}
              <span style={{ fontSize: "14px", color: "#666", marginLeft: "6px" }}>
                ({review.rating}/5)
              </span>
            </div>

            {review.message && (
              <p style={{ color: "#444", fontSize: "14px", marginBottom: "6px" }}>
                {review.message}
              </p>
            )}

            <p style={{ fontSize: "12px", color: "#999" }}>
              Job ID: {review.jobId} •{" "}
              {review.createdAt
                ? new Date(review.createdAt).toLocaleString("ro-RO")
                : ""}
            </p>
          </div>

          <button
            onClick={() => handleDelete(review.id)}
            style={{
              padding: "6px 12px",
              backgroundColor: "#fee2e2",
              color: "#dc2626",
              border: "1px solid #fca5a5",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "600",
              whiteSpace: "nowrap",
            }}
          >
            🗑 Șterge
          </button>
        </div>
      ))}
    </div>
    </AdminLayout>
  );
}