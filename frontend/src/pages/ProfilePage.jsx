import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  getMe, update, uploadCv, uploadAvatar,
  getPublicUserRating, getUserCv, deleteCv, deleteAvatar,
} from "../api/userApi";
import { useAuth } from "../context/AuthContext";

const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23e0e0e0'/%3E%3Ccircle cx='50' cy='38' r='18' fill='%23bdbdbd'/%3E%3Cellipse cx='50' cy='85' rx='28' ry='20' fill='%23bdbdbd'/%3E%3C/svg%3E";

export default function ProfilePage() {
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", phoneNumber: "",
    bio: "", profilePictureUrl: "", role: "", skills: [],
    profileCompleted: false, hasCv: false, age: "",
  });

  const [userId, setUserId] = useState(null);
  const [ratingData, setRatingData] = useState(null);
  const [newSkill, setNewSkill] = useState("");
  const [cvFile, setCvFile] = useState(null);
  const [cvUploading, setCvUploading] = useState(false);
  const [cvInputKey, setCvInputKey] = useState(0);
  const [cvViewing, setCvViewing] = useState(false);
  const [cvDeleting, setCvDeleting] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarInputKey, setAvatarInputKey] = useState(0);
  const [avatarRemoving, setAvatarRemoving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [saveModal, setSaveModal] = useState(false);
  const [logoutModal, setLogoutModal] = useState(false);
  const [deleteAvatarModal, setDeleteAvatarModal] = useState(false);
  const [deleteCvModal, setDeleteCvModal] = useState(false);
  const [isActioning, setIsActioning] = useState(false);
  const [pendingData, setPendingData] = useState(null);

  const avatarInputRef = useRef(null);
  const cvInputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const isFirstLogin = location.state?.firstLogin === true;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getMe();
        setFormData({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          phoneNumber: data.phoneNumber || "",
          bio: data.bio || "",
          profilePictureUrl: data.profilePictureUrl || "",
          role: data.role || "",
          skills: data.skills || [],
          profileCompleted: data.profileCompleted || false,
          hasCv: data.hasCv || false,
          age: data.age ?? "",
        });
        if (data.id) setUserId(data.id);
      } catch {
        setError("Nu am putut încărca profilul.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    if (!userId) return;
    const fetchRating = async () => {
      try {
        const r = await getPublicUserRating(userId);
        setRatingData(r || null);
      } catch {}
    };
    fetchRating();
  }, [userId]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAddSkill = () => {
    const trimmed = newSkill.trim();
    if (!trimmed) return;
    if (formData.skills.includes(trimmed)) { setError("Această competență există deja."); return; }
    setFormData({ ...formData, skills: [...formData.skills, trimmed] });
    setNewSkill(""); setError("");
  };

  const handleRemoveSkill = (skill) =>
    setFormData({ ...formData, skills: formData.skills.filter((s) => s !== skill) });

  const handleSkillKeyDown = (e) => { if (e.key === "Enter") { e.preventDefault(); handleAddSkill(); } };

  const handleSaveClick = (e) => {
    e.preventDefault();
    setPendingData({
      phoneNumber: formData.phoneNumber,
      bio: formData.bio,
      skills: formData.skills,
      age: formData.age !== "" ? parseInt(formData.age, 10) : undefined,
      profileCompleted: true,
    });
    setSaveModal(true);
  };

  const handleSaveConfirm = async () => {
    setMessage(""); setError("");
    try {
      setIsActioning(true);
      await update(pendingData);
      setFormData((prev) => ({ ...prev, profileCompleted: true }));
      setMessage("Datele au fost actualizate cu succes.");
      setSaveModal(false);
    } catch {
      setError("Nu s-au putut salva modificările.");
    } finally {
      setIsActioning(false);
    }
  };

  const handleLogoutConfirm = () => { logout(); navigate("/login"); };

  // ── Avatar ──────────────────────────────────────────────
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== "image/jpeg" && file.type !== "image/png") { setError("Doar JPG și PNG sunt acceptate."); return; }
    if (file.size > 2 * 1024 * 1024) { setError("Imaginea depășește 2MB."); return; }
    setAvatarFile(file); setError("");
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    setAvatarUploading(true); setMessage(""); setError("");
    try {
      const data = await uploadAvatar(avatarFile);
      setFormData((prev) => ({ ...prev, profilePictureUrl: data.profilePictureUrl }));
      setAvatarFile(null); setAvatarInputKey((k) => k + 1);
      setMessage("Poza de profil a fost actualizată.");
    } catch { setError("Nu s-a putut încărca poza."); }
    finally { setAvatarUploading(false); }
  };

  const handleDeleteAvatarConfirm = async () => {
    setAvatarRemoving(true); setMessage(""); setError("");
    try {
      setIsActioning(true);
      await deleteAvatar();
      setFormData((prev) => ({ ...prev, profilePictureUrl: "" }));
      setAvatarInputKey((k) => k + 1);
      setMessage("Poza de profil a fost ștearsă.");
      setDeleteAvatarModal(false);
    } catch { setError("Nu s-a putut șterge poza."); }
    finally { setAvatarRemoving(false); setIsActioning(false); }
  };

  // ── CV ──────────────────────────────────────────────────
  const handleCvChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== "application/pdf") { setError("Doar PDF este acceptat."); return; }
    if (file.size > 5 * 1024 * 1024) { setError("Fișierul depășește 5MB."); return; }
    setCvFile(file); setError("");
  };

  const handleCvUpload = async () => {
    if (!cvFile) return;
    setCvUploading(true); setMessage(""); setError("");
    try {
      await uploadCv(cvFile);
      // ── FIX: actualizeaza hasCv in state dupa upload reusit ──
      setFormData((prev) => ({ ...prev, hasCv: true }));
      setCvFile(null); setCvInputKey((k) => k + 1);
      setMessage("CV-ul a fost încărcat cu succes.");
    } catch { setError("Nu s-a putut încărca CV-ul."); }
    finally { setCvUploading(false); }
  };

  const handleViewCv = async () => {
    if (!userId) return;
    setCvViewing(true);
    try {
      const data = await getUserCv(userId);
      const byteCharacters = atob(data.cvBase64);
      const byteArray = new Uint8Array(byteCharacters.length).map((_, i) => byteCharacters.charCodeAt(i));
      const blob = new Blob([byteArray], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url; link.target = "_blank"; link.rel = "noopener noreferrer";
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch { setError("Nu s-a putut deschide CV-ul."); }
    finally { setCvViewing(false); }
  };

  const handleDeleteCvConfirm = async () => {
    setCvDeleting(true); setMessage(""); setError("");
    try {
      setIsActioning(true);
      await deleteCv();
      // ── FIX: actualizeaza hasCv in state dupa stergere ──
      setFormData((prev) => ({ ...prev, hasCv: false }));
      setCvFile(null); setCvInputKey((k) => k + 1);
      setMessage("CV-ul a fost șters.");
      setDeleteCvModal(false);
    } catch { setError("Nu s-a putut șterge CV-ul."); }
    finally { setCvDeleting(false); setIsActioning(false); }
  };

  if (loading) return <div className="page"><p>Se încarcă profilul...</p></div>;

  const initials = `${formData.firstName?.[0] || ""}${formData.lastName?.[0] || ""}`.toUpperCase() || "?";
  const fullName = `${formData.firstName} ${formData.lastName}`.trim();
  const avgRating = ratingData?.averageRating ?? 0;
  const reviewCount = ratingData?.reviewCount ?? 0;

  return (
    <section className="page" style={{ maxWidth: "560px" }}>

      {isFirstLogin && !formData.profileCompleted && (
        <div style={{ background: "#fffbea", border: "1px solid #f0c040", borderRadius: "10px", padding: "16px", marginBottom: "16px" }}>
          <strong>Bine ai venit!</strong>
          <p style={{ margin: "8px 0 0", fontSize: "14px", color: "var(--color-text-medium)" }}>
            Completează-ți profilul cu o poză, o descriere și competențele tale pentru a-ți crește șansele la joburi.
          </p>
        </div>
      )}

      {/* ── Card alb — info + avatar ── */}
      <div style={{ background: "#fff", borderRadius: "12px", padding: "24px", marginBottom: "16px", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
          {formData.profilePictureUrl ? (
            <img src={formData.profilePictureUrl} alt="Avatar"
              style={{ width: "72px", height: "72px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
              onError={(e) => { e.target.src = DEFAULT_AVATAR; }} />
          ) : (
            <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "24px", fontWeight: "700", flexShrink: 0 }}>
              {initials}
            </div>
          )}
          <div>
            <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: "var(--color-text-dark)" }}>{fullName}</h2>
            {formData.role === "ADMIN" && (
              <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--color-primary)", background: "rgba(69,70,121,0.15)", padding: "2px 8px", borderRadius: "10px", display: "inline-block", marginTop: "4px" }}>
                Administrator
              </span>
            )}
          </div>
        </div>

        <p style={{ fontSize: "11px", fontWeight: "600", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px" }}>
          Date personale — nu pot fi modificate
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
          <ReadOnlyField icon="user" label="Prenume și nume" value={fullName || "—"} />
          <ReadOnlyField icon="mail" label="Email" value={formData.email || "—"} />
          <ReadOnlyField icon="phone" label="Număr de telefon" value={formData.phoneNumber || "Nespecificat"} />
          <ReadOnlyField icon="age" label="Vârstă" value={formData.age ? `${formData.age} ani` : "Nespecificată"} />
        </div>

        <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: "16px" }}>
          <p style={{ fontSize: "12px", fontWeight: "600", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px" }}>
            Poză de profil
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <input key={avatarInputKey} ref={avatarInputRef} type="file" accept="image/jpeg,image/png"
              onChange={handleAvatarChange} style={{ display: "none" }} />
            <button type="button" className="icon-btn icon-btn--avatar" onClick={() => avatarInputRef.current?.click()}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              {avatarFile ? avatarFile.name : "Alege poză"}
            </button>
            {avatarFile && (
              <button type="button" onClick={handleAvatarUpload} disabled={avatarUploading} className="icon-btn icon-btn--avatar">
                {avatarUploading ? "Se încarcă..." : "Salvează poza"}
              </button>
            )}
            {formData.profilePictureUrl && (
              <button type="button" onClick={() => setDeleteAvatarModal(true)} className="icon-btn icon-btn--delete">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  <path d="M10 11v6"/><path d="M14 11v6"/>
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                </svg>
                Șterge poza
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Card mov — editare profil ── */}
      <div className="form-box" style={{ marginBottom: "16px" }}>
        <h1 style={{ fontSize: "1.3rem" }}>Editează profilul</h1>

        <form onSubmit={handleSaveClick}>
          <div className="user-box">
            <textarea id="bio" name="bio" placeholder=" " rows={4}
              value={formData.bio} onChange={handleChange}
              style={{ resize: "vertical", minHeight: "80px" }} />
            <label htmlFor="bio">Biografie</label>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px" }}>
              Competențe
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "10px" }}>
              {formData.skills.map((skill) => (
                <span key={skill} style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", padding: "4px 12px", borderRadius: "20px", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}>
                  {skill}
                  <button type="button" onClick={() => handleRemoveSkill(skill)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.7)", fontSize: "16px", padding: 0, lineHeight: 1 }}>
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <div className="user-box" style={{ flex: 1, marginBottom: 0 }}>
                <input type="text" placeholder=" " value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)} onKeyDown={handleSkillKeyDown} />
                <label>Adaugă competență</label>
              </div>
              <button type="button" onClick={handleAddSkill} className="icon-btn icon-btn--edit" style={{ alignSelf: "center" }}>+</button>
            </div>
          </div>

          {message && <p className="form-success">{message}</p>}
          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="icon-btn icon-btn--edit" style={{ marginTop: "8px" }}>
            Salvează modificările
</button>
        </form>
      </div>

      {/* ── Card mov — CV ── */}
      <div className="card" style={{ marginBottom: "16px" }}>
        <p style={{ fontSize: "12px", fontWeight: "600", color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px" }}>
          CV (PDF, max 5MB)
        </p>

        {/* Butoane vizualizare + stergere — apar DOAR daca hasCv e true */}
        {formData.hasCv && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "rgba(255,255,255,0.85)", fontSize: "13px" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              CV încărcat
            </div>

            <button type="button" onClick={handleViewCv} disabled={cvViewing} className="icon-btn icon-btn--info">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
              {cvViewing ? "Se deschide..." : "Vizualizează"}
            </button>

            <button type="button" onClick={() => setDeleteCvModal(true)} className="icon-btn icon-btn--delete">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6"/><path d="M14 11v6"/>
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
              Șterge CV
            </button>
          </div>
        )}

        {/* Upload — intotdeauna vizibil; arata fisierul ales ca text simplu (nu link) */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <input key={cvInputKey} ref={cvInputRef} type="file" accept="application/pdf"
            onChange={handleCvChange} style={{ display: "none" }} />

          <button type="button" className="icon-btn icon-btn--edit" onClick={() => cvInputRef.current?.click()}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            {formData.hasCv ? "Înlocuiește CV" : "Alege fișier PDF"}
          </button>

          {/* Numele fisierului ales — text simplu, nu clickabil */}
          {cvFile && (
            <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.75)", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {cvFile.name}
            </span>
          )}

          {cvFile && (
            <button type="button" onClick={handleCvUpload} disabled={cvUploading} className="icon-btn icon-btn--info">
              {cvUploading ? "Se încarcă..." : "Încarcă CV"}
            </button>
          )}
        </div>
      </div>

      {/* ── Card verde — recenzii ── */}
      {userId && (
        <div
          onClick={() => navigate(`/users/public/${userId}/reviews`, { state: { ownerEmail: formData.email, fromOwnProfile: true } })}
          className="profile-card--accent"
          style={{ cursor: "pointer", marginBottom: "16px" }}
        >
          <p style={{ fontSize: "12px", fontWeight: "600", color: "rgba(0,0,0,0.5)", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 12px" }}>
            Recenziile mele
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <div style={{ display: "flex", gap: "2px" }}>
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i} style={{ color: i < Math.round(avgRating) ? "#facc15" : "rgba(0,0,0,0.2)", fontSize: "20px" }}>★</span>
              ))}
            </div>
            <span style={{ fontSize: "18px", fontWeight: "700", color: "#1a1a1a" }}>
              {ratingData?.averageRating != null ? Number(avgRating).toFixed(1) : "—"}
            </span>
            <span style={{ fontSize: "13px", color: "rgba(0,0,0,0.5)" }}>/ 5</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", color: "rgba(0,0,0,0.6)" }}>
              {reviewCount} {reviewCount === 1 ? "recenzie primită" : "recenzii primite"}
            </span>
            <span style={{ fontSize: "13px", color: "#1a1a1a", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
              Vezi toate
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </span>
          </div>
        </div>
      )}

      {/* ── Logout ── */}
      <button onClick={() => setLogoutModal(true)} className="icon-btn icon-btn--delete" style={{ marginBottom: "32px" }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        Deconectare
      </button>

      {/* ── Modals ── */}
      {saveModal && (
        <ConfirmModal title="Salvează modificările"
          message="Ești sigur că vrei să salvezi modificările?"
          confirmLabel="Salvează" confirmStyle={{ background: "var(--color-primary)" }}
          onConfirm={handleSaveConfirm} onCancel={() => setSaveModal(false)} isLoading={isActioning} />
      )}
      {logoutModal && (
        <ConfirmModal title="Deconectare"
          message="Ești sigur că vrei să te deconectezi?"
          confirmLabel="Deconectează-mă" confirmStyle={{ background: "#d97706" }}
          onConfirm={handleLogoutConfirm} onCancel={() => setLogoutModal(false)} isLoading={false} />
      )}
      {deleteAvatarModal && (
        <ConfirmModal title="Șterge poza de profil"
          message="Ești sigur că vrei să ștergi poza de profil?"
          confirmLabel="Șterge poza" confirmStyle={{ background: "var(--color-error)" }}
          onConfirm={handleDeleteAvatarConfirm} onCancel={() => setDeleteAvatarModal(false)} isLoading={isActioning} />
      )}
      {deleteCvModal && (
        <ConfirmModal title="Șterge CV"
          message="Ești sigur că vrei să ștergi CV-ul? Acțiunea este ireversibilă."
          confirmLabel="Șterge CV" confirmStyle={{ background: "var(--color-error)" }}
          onConfirm={handleDeleteCvConfirm} onCancel={() => setDeleteCvModal(false)} isLoading={isActioning} />
      )}
    </section>
  );
}

function ReadOnlyField({ icon, label, value }) {
  const paths = {
    user: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    mail: <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>,
    phone: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.78a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>,
    age: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
  };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" style={{ flexShrink: 0 }}>
        {paths[icon]}
      </svg>
      <div>
        <p style={{ margin: 0, fontSize: "11px", color: "var(--color-text-muted)", letterSpacing: "0.3px" }}>{label}</p>
        <p style={{ margin: 0, fontSize: "14px", color: "#333", fontWeight: "500" }}>{value}</p>
      </div>
    </div>
  );
}

function ConfirmModal({ title, message, confirmLabel, confirmStyle, onConfirm, onCancel, isLoading }) {
  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
      <div role="dialog" aria-modal="true" style={{ backgroundColor: "white", padding: "28px 24px", borderRadius: "10px", minWidth: "300px", maxWidth: "420px", width: "90vw", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <h3 style={{ marginBottom: "10px", fontSize: "18px", color: "var(--color-text-dark)" }}>{title}</h3>
        <p style={{ marginBottom: "24px", color: "var(--color-text-medium)", fontSize: "14px", lineHeight: "1.5" }}>{message}</p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <button onClick={onConfirm} disabled={isLoading} style={{ padding: "10px 24px", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "14px", ...confirmStyle }}>
            {isLoading ? "Se procesează..." : confirmLabel}
          </button>
          <button onClick={onCancel} disabled={isLoading} style={{ padding: "10px 24px", background: "#f3f4f6", color: "#333", border: "1px solid #ddd", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "14px" }}>
            Anulează
          </button>
        </div>
      </div>
    </div>
  );
}