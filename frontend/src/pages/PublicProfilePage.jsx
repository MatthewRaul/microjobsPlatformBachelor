import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getPublicUserProfile, getPublicUserRating, getUserCv } from "../api/userApi";
import "../styles/auth.css";
import {useAuth} from "../context/AuthContext";

export default function PublicProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { jobId, reviewedUserId, canLeaveReview } = location.state || {};

  const [profile, setProfile] = useState(null);
  const [ratingData, setRatingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cvLoading, setCvLoading] = useState(false);
  const { isAuthenticated} = useAuth();

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
          } catch { setRatingData(null); }
        }
      } catch {
        setError("Nu am putut incarca profilul utilizatorului.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProfile();
    else { setLoading(false); setError("Utilizator invalid."); }
  }, [id]);

  const handleRatingClick = () => {
    if (profile?.id) {
      navigate(`/users/public/${profile.id}/reviews`, {
        state: { ownerEmail: id, jobId, reviewedUserId, canLeaveReview },
      });
    }
  };

  const handleOpenCv = async () => {
    if (!profile?.id || cvLoading) return;
    setCvLoading(true);
    try {
      const data = await getUserCv(profile.id);
      const byteCharacters = atob(data.cvBase64);
      const byteArray = new Uint8Array(Array.from({ length: byteCharacters.length }, (_, i) => byteCharacters.charCodeAt(i)));
      const blob = new Blob([byteArray], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch {
      alert("Nu s-a putut deschide CV-ul.");
    } finally {
      setCvLoading(false);
    }
  };

  if (loading) return <div className="page"><p>Se incarca profilul...</p></div>;
  if (error)   return <div className="page"><p className="error-message">{error}</p></div>;
  if (!profile) return <div className="page"><p>Profilul nu exista.</p></div>;

  const fullName = `${profile.firstName || ""} ${profile.lastName || ""}`.trim() || "Utilizator";
  const initials = `${profile.firstName?.[0] || ""}${profile.lastName?.[0] || ""}`.toUpperCase() || "?";
  const hasRating = ratingData?.averageRating !== undefined && ratingData?.averageRating !== null;
  const avgRating = hasRating ? Number(ratingData.averageRating) : 0;
  const reviewCount = ratingData?.reviewCount ?? 0;

  return (
    <section className="page" style={{ maxWidth: "640px" }}>

      {/* CARD 1 — ALB — Info profil */}
      <div className="profile-card">
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
          {profile.profilePictureUrl ? (
            <img src={profile.profilePictureUrl} alt="Avatar"
              style={{ width: "72px", height: "72px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
              onError={(e) => { e.target.style.display = "none"; }} />
          ) : (
            <div className="avatar-initials">{initials}</div>
          )}
          <div>
            <h1 style={{ margin: 0, marginBottom: "4px", fontSize: "22px", fontWeight: "800", color: "var(--color-text-dark)" }}>
              {fullName}
            </h1>
            {profile.age && <p style={{ margin: 0, fontSize: "14px", color: "var(--color-text-muted)" }}>{profile.age} ani</p>}
          </div>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <p className="section-label--dark" style={{ marginBottom: "4px" }}>Despre</p>
          <p style={{
            fontSize: "15px",
            color: profile.bio?.trim() ? "var(--color-text-medium)" : "#bbb",
            lineHeight: "1.6",
            fontStyle: profile.bio?.trim() ? "normal" : "italic",
            margin: 0,
          }}>
            {profile.bio?.trim() ? profile.bio : "Nu exista biografie."}
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {profile.email && (
            <div className="contact-row">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2" style={{ flexShrink: 0 }}>
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <span>{profile.email}</span>
            </div>
          )}
          {profile.phoneNumber && (
            <div className="contact-row">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2" style={{ flexShrink: 0 }}>
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.78a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <span>{profile.phoneNumber}</span>
            </div>
          )}
        </div>
      </div>

      {/* CARD 2 — MOV — Skills */}
      {profile.skills && profile.skills.length > 0 && (
        <div className="profile-card--primary">
          <p className="section-label">Competente</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {profile.skills.map((skill) => (
              <span key={skill} className="skill-tag">{skill}</span>
            ))}
          </div>
        </div>
      )}

      {/* CARD CV — MOV */}
      {isAuthenticated && profile.hasCv && (
        <div
          onClick={handleOpenCv}
          className="profile-card--primary profile-card--primary-link"
          style={{ opacity: cvLoading ? 0.75 : 1, cursor: cvLoading ? "wait" : "pointer" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div className="icon-box">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
            </div>
            <div>
              <p className="section-label" style={{ marginBottom: "3px" }}>Curriculum Vitae</p>
              <p style={{ margin: 0, fontSize: "14px", color: "#ffffff", fontWeight: "600" }}>
                {cvLoading ? "Se incarca..." : "CV disponibil — apasa pentru a vizualiza"}
              </p>
            </div>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth="2" style={{ flexShrink: 0 }}>
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
        </div>
      )}

      {/* CARD 3 — VERDE — Reviews */}
      <div className="profile-card--accent" onClick={handleRatingClick}
        style={{ cursor: profile.id ? "pointer" : "default" }}>
        <p className="section-label">Recenzii</p>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
          <div style={{ display: "flex", gap: "2px" }}>
            {Array.from({ length: 5 }, (_, i) => (
              <span key={i} className={i < Math.round(avgRating) ? "star--active" : "star--inactive"}>★</span>
            ))}
          </div>
          <span style={{ fontSize: "18px", fontWeight: "700", color: "var(--color-text-light)" }}>
            {hasRating ? avgRating.toFixed(1) : "—"}
          </span>
          <span style={{ fontSize: "13px", color: "var(--color-text-light-60)" }}>/ 5</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "13px", color: "var(--color-text-light-70)" }}>
            {reviewCount} {reviewCount === 1 ? "recenzie" : "recenzii"}
          </span>
          {profile.id && (
            <span style={{ fontSize: "13px", color: "var(--color-text-light)", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
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