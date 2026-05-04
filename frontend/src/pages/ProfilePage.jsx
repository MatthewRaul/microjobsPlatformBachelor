import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMe, update } from "../api/userApi";
import { useAuth } from "../context/AuthContext";

export default function ProfilePage() {
  const [formData, setFormData] = useState({
    firstName: "",
    email: "",
    phoneNumber: "",
    bio: "",
    profilePictureUrl: "",
    role: "",
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getMe();
        setFormData({
          firstName: data.firstName || "",
          email: data.email || "",
          phoneNumber: data.phoneNumber || "",
          bio: data.bio || "",
          profilePictureUrl: data.profilePictureUrl || "",
          role: data.role || "",
        });
      } catch (err) {
        setError("Nu am putut încărca profilul.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      await update({
        phoneNumber: formData.phoneNumber,
        bio: formData.bio,
        profilePictureUrl: formData.profilePictureUrl,
      });

      setMessage("Datele au fost actualizate cu succes.");
    } catch (err) {
      setError("Nu s-au putut salva modificările.");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) return <div style={{ padding: "20px" }}>Se încarcă profilul...</div>;
  if (error && !formData.firstName) return <div style={{ padding: "20px" }}>{error}</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Profilul meu</h1>

      {formData.role === "ADMIN" && (
        <p><strong>Administrator</strong></p>
      )}

      <form
        onSubmit={handleSave}
        style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "400px" }}
      >
        <div>
          <label>Nume</label><br />
          <input
            type="text"
            value={formData.firstName}
            disabled
          />
        </div>

        <div>
          <label>Email</label><br />
          <input
            type="email"
            value={formData.email}
            disabled
          />
        </div>

        <div>
          <label>Poză de profil</label><br />
          <input
            type="text"
            name="profilePictureUrl"
            value={formData.profilePictureUrl}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Număr de telefon</label><br />
          <input
            type="text"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Biografie</label><br />
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows="4"
            style={{ width: "300px" }}
          />
        </div>

        <button type="submit">Salvează modificările</button>
      </form>

      {message && <p style={{ marginTop: "12px", color: "green" }}>{message}</p>}
      {error && <p style={{ marginTop: "12px", color: "red" }}>{error}</p>}

      <button onClick={handleLogout} style={{ marginTop: "20px" }}>
        Logout
      </button>
    </div>
  );
}