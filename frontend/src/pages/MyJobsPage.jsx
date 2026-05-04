import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyJobs, cancelJob, completeJob } from "../api/jobApi";

export default function MyJobsPage() {
  const { user } = useAuth();

  const [myJobs, setMyJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchMyJobs = async () => {
    try {
      setError("");
      setLoading(true);
      const data = await getMyJobs();
      setMyJobs(data);
    } catch (err) {
      console.log("EROARE MY JOBS", err);
      setError("Nu am putut încărca joburile tale.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email) {
      fetchMyJobs();
    }
  }, [user]);

  const handleCancel = async (jobId) => {
    try {
      await cancelJob(jobId);
      setMessage("Jobul a fost anulat.");
      await fetchMyJobs();
    } catch (err) {
      setMessage("Nu s-a putut anula jobul.");
    }
  };

  const handleComplete = async (jobId) => {
    try {
      await completeJob(jobId);
      setMessage("Jobul a fost marcat ca finalizat.");
      await fetchMyJobs();
    } catch (err) {
      setMessage("Nu s-a putut finaliza jobul.");
    }
  };

  const getStatusColor = (status) => {
    if (status === "OPEN") return "green";
    if (status === "FILLED") return "#b8860b";
    if (status === "COMPLETED") return "#1e3a8a";
    if (status === "CANCELED") return "red";
    return "#333";
  };

  if (loading) {
    return <div style={{ padding: "20px" }}>Se încarcă joburile tale...</div>;
  }

  if (error) {
    return <div style={{ padding: "20px" }}>{error}</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Joburile mele</h1>

      {message && <p style={{ marginTop: "10px" }}>{message}</p>}

      {myJobs.length === 0 ? (
        <p>Nu ai postat încă niciun job.</p>
      ) : (
        <div style={{ marginTop: "20px" }}>
          {myJobs.map((job) => {
            const jobId = job.id || job._id;
            const isClosed =
              job.status === "CANCELED" || job.status === "COMPLETED";

            return (
              <div
                key={jobId}
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  padding: "16px",
                  marginBottom: "12px",
                }}
              >
                <h3>{job.title}</h3>

                <p><strong>Descriere:</strong> {job.description || "Fără descriere"}</p>

                <p>
                  <strong>Status:</strong>{" "}
                  <span style={{ color: getStatusColor(job.status), fontWeight: "bold" }}>
                    {job.status}
                  </span>
                </p>

                <p><strong>Capacitate:</strong> {job.neededWorkers ?? "Nespecificat"}</p>
                <p>
                  <strong>Locuri ocupate:</strong>{" "}
                  {job.acceptedWorkers ?? 0} / {job.neededWorkers ?? "Nespecificat"}
                </p>
                <p><strong>Salariu:</strong> {job.salary ?? "0"}</p>
                <p><strong>Locație:</strong> {job.location || "Nespecificată"}</p>

                <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                  <Link to={`/jobs/${jobId}`}>Vezi detalii</Link>

                  {!isClosed && (
                    <>
                      <button onClick={() => handleCancel(jobId)}>
                        Anulează
                      </button>

                      <button onClick={() => handleComplete(jobId)}>
                        Marchează finalizat
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}