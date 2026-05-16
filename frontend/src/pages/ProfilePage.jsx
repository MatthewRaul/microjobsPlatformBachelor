import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getMe, update, uploadCv, uploadAvatar, getPublicUserRating, getUserCv, deleteCv } from "../api/userApi";
import { useAuth } from "../context/AuthContext";

const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23e0e0e0'/%3E%3Ccircle cx='50' cy='38' r='18' fill='%23bdbdbd'/%3E%3Cellipse cx='50' cy='85' rx='28' ry='20' fill='%23bdbdbd'/%3E%3C/svg%3E";

export default function ProfilePage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    bio: "",
    profilePictureUrl: "",
    role: "",
    skills: [],
    profileCompleted: false,
    hasCv: false,
    age: "",
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
      } catch (err) {
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
        const ratingResponse = await getPublicUserRating(userId);
        setRatingData(ratingResponse || null);
      } catch {}
    };
    fetchRating();
  }, [userId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddSkill = () => {
    const trimmed = newSkill.trim();
    if (!trimmed) return;
    if (formData.skills.includes(trimmed)) {
      setError("Această competență există deja.");
      return;
    }
    setFormData({ ...formData, skills: [...formData.skills, trimmed] });
    setNewSkill("");
    setError("");
  };

  const handleRemoveSkill = (skill) => {
    setFormData({ ...formData, skills: formData.skills.filter((s) => s !== skill) });
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === "Enter") { e.preventDefault(); handleAddSkill(); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage(""); setError("");
    try {
      await update({
        phoneNumber: formData.phoneNumber,
        bio: formData.bio,
        skills: formData.skills,
        age: formData.age !== "" ? parseInt(formData.age, 10) : undefined,
        profileCompleted: true,
      });
      setFormData((prev) => ({ ...prev, profileCompleted: true }));
      setMessage("Datele au fost actualizate cu succes.");
    } catch (err) {
      setError("Nu s-au putut salva modificările.");
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== "image/jpeg" && file.type !== "image/png") {
      setError("Doar JPG și PNG sunt acceptate."); return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Imaginea depășește limita de 2MB."); return;
    }
    setAvatarFile(file); setError("");
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    setAvatarUploading(true); setMessage(""); setError("");
    try {
      const data = await uploadAvatar(avatarFile);
      setFormData((prev) => ({ ...prev, profilePictureUrl: data.profilePictureUrl }));
      setAvatarFile(null);
      setAvatarInputKey((k) => k + 1);
      setMessage("Poza de profil a fost actualizată.");
    } catch {
      setError("Nu s-a putut încărca poza.");
    } finally {
      setAvatarUploading(false);
    }
  };

  // 1. Remove avatar
  const handleRemoveAvatar = async () => {
    if (!window.confirm("Ești sigur că vrei să ștergi poza de profil?")) return;
    setAvatarRemoving(true); setMessage(""); setError("");
    try {
      await update({ profilePictureUrl: "" });
      setFormData((prev) => ({ ...prev, profilePictureUrl: "" }));
      setAvatarInputKey((k) => k + 1);
      setMessage("Poza de profil a fost ștearsă.");
    } catch {
      setError("Nu s-a putut șterge poza.");
    } finally {
      setAvatarRemoving(false);
    }
  };

  const handleCvChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== "application/pdf") { setError("Doar fișierele PDF sunt acceptate."); return; }
    if (file.size > 5 * 1024 * 1024) { setError("Fișierul depășește limita de 5MB."); return; }
    setCvFile(file); setError("");
  };

  const handleCvUpload = async () => {
    if (!cvFile) return;
    setCvUploading(true); setMessage(""); setError("");
    try {
      await uploadCv(cvFile);
      setFormData((prev) => ({ ...prev, hasCv: true }));
      setCvFile(null);
      setCvInputKey((k) => k + 1);
      setMessage("CV-ul a fost încărcat cu succes.");
    } catch {
      setError("Nu s-a putut încărca CV-ul.");
    } finally {
      setCvUploading(false);
    }
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
    } catch {
      setError("Nu s-a putut deschide CV-ul.");
    } finally {
      setCvViewing(false);
    }
  };

  const handleDeleteCv = async () => {
    if (!window.confirm("Ești sigur că vrei să ștergi CV-ul?")) return;
    setCvDeleting(true); setMessage(""); setError("");
    try {
      await deleteCv();
      setFormData((prev) => ({ ...prev, hasCv: false }));
      setMessage("CV-ul a fost șters.");
    } catch {
      setError("Nu s-a putut șterge CV-ul.");
    } finally {
      setCvDeleting(false);
    }
  };

  const handleLogout = () => { logout(); navigate("/login"); };

  if (loading) return <div style={{ padding: "20px" }}>Se încarcă profilul...</div>;

  return (
    <div style={{ padding: "20px", maxWidth: "500px" }}>
      <h1>Profilul meu</h1>

      {isFirstLogin && !formData.profileCompleted && (
        <div style={{ backgroundColor: "#fffbea", border: "1px solid #f0c040", borderRadius: "10px", padding: "16px", marginBottom: "20px" }}>
          <strong>👋 Bine ai venit!</strong>
          <p style={{ margin: "8px 0 0" }}>
            Completează-ți profilul cu o poză, o descriere, competențele tale și un CV pentru a-ți crește șansele de a fi acceptat la un job. Toate câmpurile sunt opționale și le poți completa oricând.
          </p>
        </div>
      )}

      {formData.role === "ADMIN" && <p><strong>Administrator</strong></p>}

      {/* Poza de profil */}
      <div style={{ marginBottom: "20px" }}>
        <label><strong>Poză de profil</strong></label>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "8px" }}>
          <img
            src={formData.profilePictureUrl || DEFAULT_AVATAR}
            alt="Avatar"
            style={{ width: "80px", height: "80px", borderRadius: "50%", objectFit: "cover", border: "1px solid #ddd" }}
            onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
          />
          <div>
            <input key={avatarInputKey} type="file" accept="image/jpeg,image/png" onChange={handleAvatarChange} />
            {avatarFile && (
              <div style={{ marginTop: "6px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "13px", color: "#444" }}>{avatarFile.name}</span>
                <button type="button" onClick={handleAvatarUpload} disabled={avatarUploading}>
                  {avatarUploading ? "Se încarcă..." : "Salvează poza"}
                </button>
              </div>
            )}
            {/* 1. Buton remove poza */}
            {formData.profilePictureUrl && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                disabled={avatarRemoving}
                style={{ marginTop: "6px", fontSize: "13px", color: "red" }}
              >
                {avatarRemoving ? "Se șterge..." : "🗑 Șterge poza"}
              </button>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ display: "flex", gap: "12px" }}>
          <div>
            <label>Prenume</label><br />
            <input type="text" value={formData.firstName} disabled />
          </div>
          <div>
            <label>Nume</label><br />
            <input type="text" value={formData.lastName} disabled />
          </div>
        </div>

        <div>
          <label>Email</label><br />
          <input type="email" value={formData.email} disabled />
        </div>

        <div>
          <label>Număr de telefon</label><br />
          <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} />
        </div>

        <div>
          <label>Vârstă</label><br />
          <input type="number" name="age" min="15" max="120" value={formData.age} onChange={handleChange} placeholder="Vârsta ta" />
        </div>

        <div>
          <label>Biografie</label><br />
          <textarea name="bio" value={formData.bio} onChange={handleChange} rows="4" style={{ width: "100%" }} placeholder="Descrie-te în câteva cuvinte..." />
        </div>

        <div>
          <label><strong>Competențe</strong></label>
          <p style={{ fontSize: "13px", color: "#666", margin: "4px 0 8px" }}>Adaugă competențele tale ca taguri (ex: șofer, sudură, engleză).</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "8px" }}>
            {formData.skills.map((skill) => (
              <span key={skill} style={{ backgroundColor: "#e8f0fe", border: "1px solid #c5d8fc", borderRadius: "20px", padding: "4px 10px", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}>
                {skill}
                <button type="button" onClick={() => handleRemoveSkill(skill)} style={{ background: "none", border: "none", cursor: "pointer", color: "#888", fontSize: "14px", padding: "0", lineHeight: "1" }}>×</button>
              </span>
            ))}
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <input type="text" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyDown={handleSkillKeyDown} placeholder="Adaugă o competență..." style={{ flex: 1 }} />
            <button type="button" onClick={handleAddSkill}>Adaugă</button>
          </div>
        </div>

        <button type="submit">Salvează modificările</button>
      </form>

      {/* CV */}
      <div style={{ marginTop: "24px", padding: "16px", border: "1px solid #ddd", borderRadius: "10px" }}>
        <strong>CV (PDF, max 5MB)</strong>
        {formData.hasCv && (
          <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "6px 0" }}>
            <p style={{ fontSize: "13px", color: "green", margin: 0 }}>✓ Ai un CV încărcat</p>
            <button type="button" onClick={handleViewCv} disabled={cvViewing} style={{ fontSize: "13px" }}>
              {cvViewing ? "Se deschide..." : "📄 Vizualizează"}
            </button>
            <button type="button" onClick={handleDeleteCv} disabled={cvDeleting} style={{ fontSize: "13px", color: "red" }}>
              {cvDeleting ? "Se șterge..." : "🗑 Șterge"}
            </button>
          </div>
        )}
        <div style={{ marginTop: "10px" }}>
          <input key={cvInputKey} type="file" accept="application/pdf" onChange={handleCvChange} />
          {cvFile && (
            <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "13px", color: "#444" }}>📄 {cvFile.name} ({(cvFile.size / 1024).toFixed(0)} KB)</span>
              <button type="button" onClick={handleCvUpload} disabled={cvUploading}>
                {cvUploading ? "Se încarcă..." : "Încarcă CV"}
              </button>
            </div>
          )}
        </div>
      </div>

      {message && <p style={{ marginTop: "12px", color: "green" }}>{message}</p>}
      {error && <p style={{ marginTop: "12px", color: "red" }}>{error}</p>}

      {/* 2. Box reviews - cu fromOwnProfile pentru navigare corecta */}
      {userId && (
        <div
          onClick={() => navigate(`/users/public/${userId}/reviews`, { state: { ownerEmail: formData.email, fromOwnProfile: true } })}
          style={{ marginTop: "24px", border: "1px solid #ddd", borderRadius: "10px", padding: "16px", backgroundColor: "white", cursor: "pointer" }}
        >
          <p style={{ fontWeight: "600", marginBottom: "4px" }}>
            {ratingData?.averageRating != null ? `⭐ ${Number(ratingData.averageRating).toFixed(1)} / 5` : "Fără rating încă"}
          </p>
          <p style={{ fontSize: "13px", color: "#666" }}>{ratingData?.reviewCount ?? 0} review-uri primite</p>
          <p style={{ fontSize: "13px", color: "#0077cc", marginTop: "8px" }}>Vezi review-urile mele →</p>
        </div>
      )}

      <button onClick={handleLogout} style={{ marginTop: "20px" }}>Logout</button>
    </div>
  );
}