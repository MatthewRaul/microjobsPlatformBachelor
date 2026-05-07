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
    if (status === "ACCEPTED") return "green";
    if (status === "REJECTED") return "red";
    return "#333";
  };

  if (loading) {
    return <div style={{ padding: "20px" }}>Se încarcă aplicările...</div>;
  }

  if (error) {
    return <div style={{ padding: "20px" }}>{error}</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Aplicările mele</h1>

      {applications.length === 0 ? (
        <p>Nu ai trimis încă nicio aplicare.</p>
      ) : (
        <div style={{ marginTop: "20px" }}>
          {applications.map((app) => (
            <div
              key={app.id || app._id}
              style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "16px",
                marginBottom: "12px",
              }}
            >
              <p>
                <strong>Status aplicare:</strong>{" "}
                <span style={{ color: getStatusColor(app.status), fontWeight: "bold" }}>
                  {app.status}
                </span>
              </p>

              {app.Title && (
                <p><strong>Job:</strong> {app.Title}</p>
              )}

              {app.applicantEmail && (
                <p><strong>Email aplicant:</strong> {app.applicantEmail}</p>
              )}

              {app.applied}

              {app.jobId && (
                <p style={{ marginTop: "10px" }}>
                  <Link to={`/jobs/${app.jobId}`}>Vezi jobul</Link>
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}