import { useState } from "react";
import { createReview } from "../api/userApi";

export default function AddReviewForm({ jobId, reviewedUserId, onReviewCreated }) {
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!jobId || !reviewedUserId) {
      setError("Lipsesc datele necesare pentru review.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await createReview({
        jobId,
        reviewedUserId,
        rating: Number(rating),
        message: message.trim(),
      });

      setSuccess("Review-ul a fost adăugat cu succes.");
      setMessage("");
      setRating(5);

      if (onReviewCreated) {
        onReviewCreated();
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data ||
          "Nu am putut salva review-ul."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>

      {/* Nota — select cu user-box */}
      <div className="user-box">
        <select
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          disabled={loading}
        >
          <option value={1}>1 — Foarte slab</option>
          <option value={2}>2 — Slab</option>
          <option value={3}>3 — Acceptabil</option>
          <option value={4}>4 — Bun</option>
          <option value={5}>5 — Foarte bine</option>
        </select>
        <label>Notă</label>
      </div>

      {/* Mesaj — textarea cu user-box */}
      <div className="user-box">
        <textarea
          placeholder=" "
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          maxLength={500}
          disabled={loading}
          style={{ resize: "vertical", minHeight: "100px" }}
        />
        <label>Mesaj (opțional)</label>
      </div>

      {error && <p className="form-error">{error}</p>}
      {success && <p className="form-success">{success}</p>}

      <button type="submit" className="primary-button" disabled={loading}>
        {loading ? "Se trimite..." : "Trimite review"}
      </button>
    </form>
  );
}