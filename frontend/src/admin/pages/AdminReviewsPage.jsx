import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import ConfirmModal from "../components/ConfirmModal";
import { getAllReviews, deleteReviewAsAdmin } from "../api/adminReviewsApi";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    searchUser: "",
    minRating: "",
    maxRating: "",
  });

  const [reviewToDelete, setReviewToDelete] = useState(null);

  useEffect(() => { fetchReviews(); }, []);

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

  function handleChange(e) {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  }

  function handleResetFilters() {
    setFilters({ searchUser: "", minRating: "", maxRating: "" });
  }

  async function handleDelete() {
    if (!reviewToDelete) return;
    try {
      await deleteReviewAsAdmin(reviewToDelete.id);
      setReviews((prev) => prev.filter((r) => r.id !== reviewToDelete.id));
      setReviewToDelete(null);
    } catch {
      alert("Nu s-a putut șterge recenzia.");
    }
  }

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const matchesUser = !filters.searchUser.trim() || (
        `${r.reviewerFirstName || ""} ${r.reviewerLastName || ""}`.toLowerCase().includes(filters.searchUser.toLowerCase()) ||
        `${r.reviewedUserFirstName || ""} ${r.reviewedUserLastName || ""}`.toLowerCase().includes(filters.searchUser.toLowerCase())
      );
      const matchesMin = filters.minRating === "" || r.rating >= parseInt(filters.minRating);
      const matchesMax = filters.maxRating === "" || r.rating <= parseInt(filters.maxRating);
      return matchesUser && matchesMin && matchesMax;
    });
  }, [reviews, filters]);

  return (
    <AdminLayout title="Recenzii">
      <div className="admin-page-header">
        <h2 className="admin-page-header__title">Lista recenziilor</h2>
        <p className="admin-page-header__subtitle">
          Poți filtra și șterge recenziile din platformă.
        </p>
      </div>

      <div className="admin-filters-box">
        <input
          type="text"
          name="searchUser"
          placeholder="Caută după nume..."
          value={filters.searchUser}
          onChange={handleChange}
          className="admin-input"
        />
        <select name="minRating" value={filters.minRating} onChange={handleChange} className="admin-input">
          <option value="">Rating minim</option>
          {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} / 5</option>)}
        </select>
        <select name="maxRating" value={filters.maxRating} onChange={handleChange} className="admin-input">
          <option value="">Rating maxim</option>
          {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} / 5</option>)}
        </select>
        <button type="button" onClick={handleResetFilters} className="admin-btn admin-btn--reset">
          Reset
        </button>
      </div>

      {loading && <p>Se încarcă recenziile...</p>}
      {error && <p className="admin-text--error">{error}</p>}

      {!loading && !error && filteredReviews.length === 0 && (
        <div className="admin-empty-box">Nu există recenzii pentru filtrele selectate.</div>
      )}

      {!loading && !error && filteredReviews.length > 0 && (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Reviewer</th>
                <th>Evaluat</th>
                <th>Rating</th>
                <th>Mesaj</th>
                <th>Job ID</th>
                <th>Data</th>
                <th>Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {filteredReviews.map((review) => (
                <tr key={review.id}>
                  <td data-label="Reviewer">
                    <strong>{review.reviewerFirstName || "?"} {review.reviewerLastName || ""}</strong>
                  </td>
                  <td data-label="Evaluat">
                    <strong>{review.reviewedUserFirstName || "?"} {review.reviewedUserLastName || ""}</strong>
                  </td>
                  <td data-label="Rating">
                    <span style={{ color: "#f59e0b", fontWeight: "700", letterSpacing: "2px" }}>
                      {"★".repeat(review.rating || 0)}{"☆".repeat(5 - (review.rating || 0))}
                    </span>
                    <span style={{ marginLeft: "6px", fontSize: "13px", color: "#6b7280" }}>
                      {review.rating}/5
                    </span>
                  </td>
                  <td data-label="Mesaj" style={{ maxWidth: "220px", wordBreak: "break-word" }}>
                    {review.message || "-"}
                  </td>
                  <td data-label="Job ID">{review.jobId}</td>
                  <td data-label="Data">
                    {review.createdAt ? new Date(review.createdAt).toLocaleString("ro-RO") : "-"}
                  </td>
                  <td data-label="Acțiuni" className="td--actions">
                    <div className="admin-actions">
                      <button
                        className="admin-action-btn admin-action-btn--delete"
                        onClick={() => setReviewToDelete(review)}
                      >
                        Șterge
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        open={!!reviewToDelete}
        title="Ștergere recenzie"
        message={
          reviewToDelete
            ? `Ești sigur că vrei să ștergi recenzia lui ${reviewToDelete.reviewerFirstName} ${reviewToDelete.reviewerLastName}?`
            : "Ești sigur că vrei să ștergi această recenzie?"
        }
        confirmText="Șterge"
        cancelText="Renunță"
        onCancel={() => setReviewToDelete(null)}
        onConfirm={handleDelete}
      />
    </AdminLayout>
  );
}