import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPublicUserProfile } from "../api/userApi";

export default function PublicProfilePage() {
  const { id } = useParams();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setError("");
        const data = await getPublicUserProfile(id);
        setProfile(data);
      } catch (err) {
        console.log("EROARE PUBLIC PROFILE", err);
        setError("Nu am putut încărca profilul utilizatorului.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  if (loading) return <div>Se încarcă profilul...</div>;
  if (error) return <div>{error}</div>;
  if (!profile) return <div>Utilizatorul nu există.</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>
        {profile.firstName} {profile.lastName}
      </h1>

      {profile.profilePictureUrl ? (
        <img
          src={profile.profilePictureUrl}
          alt={`${profile.firstName} ${profile.lastName}`}
          style={{
            width: "140px",
            height: "140px",
            objectFit: "cover",
            borderRadius: "50%",
            marginBottom: "16px",
          }}
        />
      ) : (
        <div
          style={{
            width: "140px",
            height: "140px",
            borderRadius: "50%",
            backgroundColor: "#ddd",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "16px",
            fontSize: "14px",
            color: "#555",
          }}
        >
          Fără poză
        </div>
      )}

      <p><strong>Bio:</strong> {profile.bio || "Fără descriere."}</p>
      <p><strong>Telefon:</strong> {profile.phoneNumber || "Nespecificat"}</p>
      <p><strong>Email:</strong> {profile.email || "Nespecificat"}</p>
    </div>
  );
}