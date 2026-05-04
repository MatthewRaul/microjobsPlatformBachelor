// src/pages/MyApplicationsPage.jsx
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
        setError("Nu am putut încărca aplicările.");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  if (loading) {
    return <div>Se încarcă aplicările...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Aplicările mele</h1>

      {applications.length === 0 ? (
        <p>Nu ai trimis încă nicio aplicare.</p>
      ) : (
        <div>
          {applications.map((app) => (
            <div
              key={app.id}
              style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "16px",
                marginBottom: "12px",
              }}
            >
              <p><strong>Status aplicare:</strong> {app.status}</p>

              {app.jobId && (
                <p>
                  <Link to={`/jobs/${app.jobId}`}>Vezi jobul</Link>
                </p>
              )}

              {app.jobTitle && (
                <p><strong>Job:</strong> {app.jobTitle}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}