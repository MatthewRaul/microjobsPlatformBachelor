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
      setLoading(true);
      const data= await getMyJobs();
      setMyJobs(data);
    } catch (err) {
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
      fetchMyJobs();
    } catch (err) {
      setMessage("Nu s-a putut anula jobul.");
    }
  };

  const handleComplete = async (jobId) => {
    try {
      await completeJob(jobId);
      setMessage("Jobul a fost marcat ca finalizat.");
      fetchMyJobs();
    } catch (err) {
      setMessage("Nu s-a putut finaliza jobul.");
    }
  };

  if (loading) {
    return <div>Se încarcă joburile tale...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Joburile mele</h1>

      {message && <p>{message}</p>}

      {myJobs.length === 0 ? (
        <p>Nu ai postat încă niciun job.</p>
      ) : (
        myJobs.map((job) => {
          const jobId = job.id || job._id;

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
              <p><strong>Status:</strong> {job.status}</p>
              <p><strong>Capacitate:</strong> {job.neededWorkers ?? "Nespecificat"}</p>
              <p><strong>Salariu:</strong> {job.salary ?? "0"}</p>
              <p><strong>Locație:</strong> {job.location || "Nespecificată"}</p>

              <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                <Link to={`/jobs/${jobId}`}>Vezi detalii</Link>

                <button onClick={() => handleCancel(jobId)}>
                  Anulează
                </button>

                <button onClick={() => handleComplete(jobId)}>
                  Marchează finalizat
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}