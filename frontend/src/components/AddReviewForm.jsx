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
    <form
      onSubmit={handleSubmit}
      style={{
        border: "1px solid #ddd",
        borderRadius: "10px",
        padding: "16px",
        marginTop: "20px",
        backgroundColor: "#fff",
        maxWidth: "420px",
      }}
    >
      <h3>Lasă un review</h3>

      <div style={{ marginBottom: "12px" }}>
        <label style={{ display: "block", marginBottom: "6px" }}>Notă</label>
        <select
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #ccc",
          }}
        >
          <option value={1}>1</option>
          <option value={2}>2</option>
          <option value={3}>3</option>
          <option value={4}>4</option>
          <option value={5}>5</option>
        </select>
      </div>

      <div style={{ marginBottom: "12px" }}>
        <label style={{ display: "block", marginBottom: "6px" }}>
          Mesaj (opțional)
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          maxLength={500}
          disabled={loading}
          placeholder="Scrie câteva cuvinte despre colaborare..."
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            resize: "vertical",
          }}
        />
      </div>

      {error && (
        <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>
      )}

      {success && (
        <div style={{ color: "green", marginBottom: "10px" }}>{success}</div>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{
          padding: "10px 16px",
          backgroundColor: "#0077cc",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? "Se trimite..." : "Trimite review"}
      </button>
    </form>
  );
}