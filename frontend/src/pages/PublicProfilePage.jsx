import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPublicUserProfile, getPublicUserRating, getUserCv } from "../api/userApi";
import "../styles/auth.css";

export default function PublicProfilePage() {
  const { id } = useParams(); // email encodat
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [ratingData, setRatingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cvLoading, setCvLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const profileData = await getPublicUserProfile(id);
        setProfile(profileData || null);

        if (profileData?.id) {
          try {
            const ratingResponse = await getPublicUserRating(profileData.id);
            setRatingData(ratingResponse || null);
          } catch {
            setRatingData(null);
          }
        }
      } catch (err) {
        console.log("EROARE PUBLIC PROFILE", err);
        setError("Nu am putut încărca profilul utilizatorului.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProfile();
    else {
      setLoading(false);
      setError("Utilizator invalid.");
    }
  }, [id]);

  // Navigare spre reviews — pastreaza logica originala cu profile.id
  const handleRatingClick = () => {
    if (profile?.id) {
      navigate(`/users/public/${profile.id}/reviews`, {
        state: { ownerEmail: id },
      });
    }
  };

  // Descarca CV-ul ca fisier PDF in browser
  const handleDownloadCv = async () => {
    if (!profile?.id) return;
    setCvLoading(true);
    try {
      const data = await getUserCv(profile.id);
      const byteCharacters = atob(data.cvBase64);
      const byteNumbers = new Array(byteCharacters.length)
        .fill(0)
        .map((_, i) => byteCharacters.charCodeAt(i));
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = data.fileName || "cv.pdf";
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Nu s-a putut descărca CV-ul.");
    } finally {
      setCvLoading(false);
    }
  };

  if (loading) return <div style={{ padding: "20px" }}>Se încarcă profilul...</div>;
  if (error) return <div style={{ padding: "20px", color: "#dc2626" }}>{error}</div>;
  if (!profile) return <div style={{ padding: "20px" }}>Profilul nu există.</div>;

  const fullName = `${profile.firstName || ""} ${profile.lastName || ""}`.trim() || "Utilizator";
  const initials = `${profile.firstName?.[0] || ""}${profile.lastName?.[0] || ""}`.toUpperCase() || "?";
  const hasRating = ratingData?.averageRating !== undefined && ratingData?.averageRating !== null;
  const avgRating = hasRating ? Number(ratingData.averageRating) : 0;
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
        Înapoi
      </button>

      {/* ===== CARD 1 — ALB — Info profil ===== */}
      <div style={{
        background: "#ffffff",
        borderRadius: "12px",
        padding: "24px",
        marginBottom: "16px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
      }}>
        {/* Avatar + nume + varsta */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
          {profile.profilePictureUrl ? (
            <img
              src={profile.profilePictureUrl}
              alt="Avatar"
              style={{ width: "72px", height: "72px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
              onError={(e) => { e.target.style.display = "none"; }}
            />
          ) : (
            <div style={{
              width: "72px", height: "72px", borderRadius: "50%",
              background: "#7c3aed", display: "flex", alignItems: "center",
              justifyContent: "center", color: "#fff", fontSize: "24px",
              fontWeight: "700", flexShrink: 0,
            }}>
              {initials}
            </div>
          )}
          <div>
            <h1 style={{ margin: 0, marginBottom: "4px", fontSize: "22px", fontWeight: "800", color: "#111" }}>
              {fullName}
            </h1>
            {profile.age && (
              <p style={{ margin: 0, fontSize: "14px", color: "#888" }}>{profile.age} ani</p>
            )}
          </div>
        </div>

        {/* Bio */}
        <div style={{ marginBottom: "16px" }}>
          <p style={{ fontSize: "12px", fontWeight: "600", color: "#aaa", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>
            Despre
          </p>
          <p style={{
            fontSize: "15px", color: profile.bio?.trim() ? "#333" : "#bbb",
            lineHeight: "1.6", fontStyle: profile.bio?.trim() ? "normal" : "italic",
            margin: 0,
          }}>
            {profile.bio?.trim() ? profile.bio : "Nu există biografie."}
          </p>
        </div>

        {/* Contact */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {profile.email && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" style={{ flexShrink: 0 }}>
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <span style={{ fontSize: "14px", color: "#444" }}>{profile.email}</span>
            </div>
          )}
          {profile.phoneNumber && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" style={{ flexShrink: 0 }}>
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.78a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <span style={{ fontSize: "14px", color: "#444" }}>{profile.phoneNumber}</span>
            </div>
          )}
        </div>
      </div>

      {/* ===== CARD 2 — MOV — Skills ===== */}
      {profile.skills && profile.skills.length > 0 && (
        <div style={{
          background: "#7c3aed",
          borderRadius: "12px",
          padding: "20px 24px",
          marginBottom: "16px",
          boxShadow: "0 0 24px rgba(167,80,255,0.4), 0 8px 24px rgba(124,58,237,0.3)",
        }}>
          <p style={{ fontSize: "12px", fontWeight: "600", color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px", margin: "0 0 12px" }}>
            Competențe
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {profile.skills.map((skill) => (
              <span key={skill} style={{
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.3)",
                color: "#ffffff",
                padding: "5px 14px",
                borderRadius: "20px",
                fontSize: "13px",
                fontWeight: "500",
              }}>
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ===== CARD CV — ALB ===== */}
      {profile.hasCv && (
        <div style={{
          background: "#ffffff",
          borderRadius: "12px",
          padding: "18px 24px",
          marginBottom: "16px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            <span style={{ fontSize: "14px", color: "#333", fontWeight: "500" }}>
              CV disponibil
            </span>
          </div>
          <button
            onClick={handleDownloadCv}
            disabled={cvLoading}
            className="icon-btn icon-btn--info"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            {cvLoading ? "Se descarcă..." : "Descarcă CV"}
          </button>
        </div>
      )}

      {/* ===== CARD 3 — VERDE — Reviews ===== */}
      <div
        onClick={handleRatingClick}
        style={{
          background: "#40826D",
          borderRadius: "12px",
          padding: "20px 24px",
          boxShadow: "0 4px 16px rgba(64,130,109,0.35)",
          cursor: profile.id ? "pointer" : "default",
        }}
      >
        <p style={{ fontSize: "12px", fontWeight: "600", color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 12px" }}>
          Recenzii
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
          <div style={{ display: "flex", gap: "2px" }}>
            {Array.from({ length: 5 }, (_, i) => (
              <span key={i} style={{ color: i < Math.round(avgRating) ? "#facc15" : "rgba(255,255,255,0.25)", fontSize: "20px" }}>
                ★
              </span>
            ))}
          </div>
          <span style={{ fontSize: "18px", fontWeight: "700", color: "#ffffff" }}>
            {hasRating ? avgRating.toFixed(1) : "—"}
          </span>
          <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)" }}>/ 5</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>
            {reviewCount} {reviewCount === 1 ? "recenzie" : "recenzii"}
          </span>
          {profile.id && (
            <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.9)", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
              Vezi toate recenziile
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </span>
          )}
        </div>
      </div>

    </section>
  );
}