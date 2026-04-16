// HomePage.jsx

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getAllJobs } from "../api/jobApi";

function HomePage() {
  // Luăm info despre autentificare din context
  const { user, isAuthenticated, logout } = useAuth();

  // jobs = lista de joburi venită din backend
  const [jobs, setJobs] = useState([]);

  // loadingJobs = ne spune dacă încă se încarcă lista
  const [loadingJobs, setLoadingJobs] = useState(true);

  // error = ținem minte dacă apare o problemă la cererea către backend
  const [error, setError] = useState("");

  // useEffect rulează automat după ce componenta se afișează.
  // Aici îl folosim ca să cerem joburile din backend.
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoadingJobs(true);

        // Cerem lista de joburi
        const data = await getAllJobs();

        // Salvăm joburile în state
        setJobs(data);
      } catch (err) {
        setError("Nu am putut încărca joburile.");
      } finally {
        setLoadingJobs(false);
      }
    };

    fetchJobs();
  }, []);

  return (
    <section className="page">
      <h1>Platformă de microjoburi</h1>

      {/* Afișăm rapid starea userului */}
      {isAuthenticated ? (
        <div className="card">
          <p>Bine ai venit, {user.firstName}!</p>
          <p>Email: {user.email}</p>
          <p>Rol: {user.role}</p>

          <button className="primary-button" onClick={logout}>
            Logout
          </button>
        </div>
      ) : (
        <p>Nu ești logat.</p>
      )}

      <div className="jobs-section">
        <h2>Joburi disponibile</h2>

        {/* Dacă încă se încarcă */}
        {loadingJobs && <p>Se încarcă joburile...</p>}

        {/* Dacă a apărut eroare */}
        {error && <p className="error-message">{error}</p>}

        {/* Dacă nu mai încărcăm, nu avem eroare și lista e goală */}
        {!loadingJobs && !error && jobs.length === 0 && (
          <p>Nu există joburi disponibile momentan.</p>
        )}

        {/* Dacă avem joburi, le afișăm */}
        {!loadingJobs && !error && jobs.length > 0 && (
          <div className="jobs-list">
            {jobs.map((job) => (
              <div key={job.id} className="card">
                <h3>{job.title}</h3>

                {/* Punem fallback-uri simple dacă anumite câmpuri lipsesc */}
                <p>
                  <strong>Descriere:</strong> {job.description || "Fără descriere"}
                </p>

                <p>
                  <strong>Status:</strong> {job.status}
                </p>

                {/* Dacă backend-ul are și alte câmpuri, le putem adăuga după */}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default HomePage;