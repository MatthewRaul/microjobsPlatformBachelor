import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axios";
import StatusBadge from "../components/StatusBadge";

const IconBriefcase = () => (
  <svg className="job-meta__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
  </svg>
);
const IconClock = () => (
  <svg className="job-meta__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IconMail = () => (
  <svg className="job-meta__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

export default function MyApplicationsPage() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await axiosInstance.get("/api/aplicari/me");
        setApplications(response.data);
      } catch {
        setError("Nu am putut încărca aplicările.");
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  if (loading) return <div className="page"><p>Se încarcă aplicările...</p></div>;
  if (error)   return <div className="page"><p className="error-message">{error}</p></div>;

  return (
    <div className="page">
      {applications.length === 0 ? (
        <>
          <div className="empty-state-box">
            <p className="empty-state-box__text">
              Nu ai trimis încă nicio aplicare. Explorează joburile disponibile!
            </p>
          </div>
          <button className="primary-button" onClick={() => navigate("/")}>
            Vezi joburile disponibile
          </button>
        </>
      ) : (
        applications.map((app) => {
          const jobId = app.jobId;
          const appliedAt = app.appliedAt
            ? new Date(app.appliedAt).toLocaleString("ro-RO", { dateStyle: "medium", timeStyle: "short" })
            : null;

          return (
            <div
              key={app.id || app._id}
              className="card"
              style={{ cursor: "pointer" }}
              onClick={() => jobId && navigate(`/jobs/${jobId}`)}
            >
              <div className="job-title">{app.jobTitle || "Job"}</div>

              <StatusBadge status={app.status} />

              <div className="job-meta">
                {app.jobOwnerEmail && (
                  <div className="job-meta__item">
                    <IconMail />
                    <span>{app.jobOwnerEmail}</span>
                  </div>
                )}
                {appliedAt && (
                  <div className="job-meta__item">
                    <IconClock />
                    <span>Aplicat la {appliedAt}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}