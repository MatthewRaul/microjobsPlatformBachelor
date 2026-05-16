import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../api/axios";

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await axiosInstance.get("/api/aplicari/me");
        setApplications(response.data);
      } catch (err) {
        console.log("EROARE MY APPLICATIONS", err);
        setError("Nu am putut încărca aplicările.");
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const getStatusColor = (status) => {
    if (status === "PENDING") return "#b8860b";
    if (status === "ACCEPTED") return "#16a34a";
    if (status === "REJECTED") return "#dc2626";
    return "#333";
  };

  const getStatusLabel = (status) => {
    if (status === "PENDING") return "⏳ În așteptare";
    if (status === "ACCEPTED") return "✅ Acceptat";
    if (status === "REJECTED") return "❌ Respins";
    return status;
  };

  if (loading) return <div style={{ padding: "20px" }}>Se încarcă aplicările...</div>;
  if (error) return <div style={{ padding: "20px" }}>{error}</div>;

  return (
    <div style={{ padding: "20px", maxWidth: "700px" }}>
      <h1>Aplicările mele</h1>

      {applications.length === 0 ? (
        <p>Nu ai trimis încă nicio aplicare.</p>
      ) : (
        <div style={{ marginTop: "20px" }}>
          {applications.map((app) => (
            <div
              key={app.id || app._id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "10px",
                padding: "16px",
                marginBottom: "12px",
                backgroundColor: "white",
              }}
            >
              {/* Titlul jobului */}
              <p style={{ fontWeight: "700", fontSize: "16px", marginBottom: "8px" }}>
                {app.jobTitle || "Job fără titlu"}
              </p>

              {/* Status */}
              <p style={{ marginBottom: "6px" }}>
                <strong>Status:</strong>{" "}
                <span style={{ color: getStatusColor(app.status), fontWeight: "600" }}>
                  {getStatusLabel(app.status)}
                </span>
              </p>

              {/* Data aplicării */}
              {app.appliedAt && (
                <p style={{ marginBottom: "6px", fontSize: "13px", color: "#666" }}>
                  <strong>Aplicat la:</strong>{" "}
                  {new Date(app.appliedAt).toLocaleString("ro-RO")}
                </p>
              )}

              {/* Link spre job */}
              {app.jobId && (
                <div style={{ marginTop: "10px" }}>
                  <Link
                    to={`/jobs/${app.jobId}`}
                    style={{
                      padding: "6px 14px",
                      border: "1px solid #0077cc",
                      borderRadius: "6px",
                      textDecoration: "none",
                      color: "#0077cc",
                      fontSize: "13px",
                    }}
                  >
                    Vezi jobul →
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}