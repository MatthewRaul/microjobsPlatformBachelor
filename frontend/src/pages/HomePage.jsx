import { useEffect, useState, useRef} from "react";
import { useAuth } from "../context/AuthContext";
import { getAllJobs, applyToJob,getMyApplications } from "../api/jobApi";
import {useNavigate} from "react-router-dom";

function HomePage() {

  // Luăm info despre autentificare din context
  const { user, isAuthenticated, logout } = useAuth();

  // jobs = lista de joburi venită din backend
  const [jobs, setJobs] = useState([]);

  // loadingJobs = ne spune dacă încă se încarcă lista
  const [loadingJobs, setLoadingJobs] = useState(true);

  // error = ținem minte dacă apare o problemă la cererea către backend
  const [error, setError] = useState("");

  const navigate=useNavigate();

  const [openMenuId,setOpenMenuId]=useState(null);
  const menuRef= useRef(null);

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

    const handleClickOutside=(event) =>{
      const clickedInsideMenu= event.target.closest(".job-owner-menu");

      if(!clickedInsideMenu){
        setOpenMenuId(null);
      }
    };
    document.addEventListener("click",handleClickOutside);
    return ()=>{
      document.removeEventListener("click",handleClickOutside);
    };
  }, []);


  const handleAddJobClick=()=>{
    if(isAuthenticated){
      navigate("/add-job");
    }else {
      navigate("/login",{
        state: {redirectTo: "/add-job"},
      });
    }
  };

  const handleApply=async (jobId) =>{
    if(!isAuthenticated){
      navigate("/login",
      {
        state: {redirectTo: "/"},

      });
      return;
    }
    try{
      await applyToJob(jobId);
      alert("Ai aplicat cu succes la acest job");
    }catch(err){
      console.error("Eroare la aplicare: ",err);
      alert("Nu s-a putut trimite aplicarea");
    }
  };

  return (
    <section className="page">
      <h1>Platformă de microjoburi</h1>

      {/* Afișăm rapid starea userului */}
      {isAuthenticated ? (
        <div className="card">
          <p>Bine ai venit, {user.firstName}!</p>
          

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
            {jobs.map((job) => {
              const isOwner=isAuthenticated && user?.email===job.postedBy;
              return (
                <div key={job.id} className="card">
                  <h3>{job.title}</h3>

              
                  <p>
                    <strong>Descriere:</strong> {job.description || "Fără descriere"}
                  </p>

                  <p>
                    <strong>Status:</strong> {job.status}
                  </p>

                  <p>
                    <strong>Capacitate:</strong> {job.neededWorkers ?? "Nespecificat"}
                  </p>

                  <p>
                    <strong>Salariu:</strong> {job.salary ?? "0"}
                  </p>

                  <p>
                    <strong>Start:</strong> {job.startDate ? new Date(job.startDate).toLocaleString("ro-RO"): "Nespecificat"}
                  </p>

                  <p>
                    <strong>Final:</strong> {job.endDate ? new Date(job.endDate).toLocaleString("ro-RO") : "Nespecificat"}
                  </p>

                  <div className="job-actions">
                    {isOwner ?(
                      <div className="job-owner-menu" ref={menuRef===job.id ? menuRef:null}>
                        <button
                          className="menu-button"
                          onClick={()=>
                            setOpenMenuId(openMenuId===job.id ? null :job.id)
                          }> . . .</button>
                      {openMenuId===job.id && (
                        <div className="dropdown-menu">
                          <button className="primary-button">Editeaza</button>
                          <button className="primary-button">Sterge</button>
                          <button className="primary-button">Informatii</button>
                        </div>
                      )}
                      </div>
                  ) : (
                    <button 
                      className="primary-button"
                      onClick={()=>handleApply(job.id)}>
                        Aplica la job
                    </button>
                  )
                }
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>
      <button
        className="primary-button"
        onClick={handleAddJobClick}>
        Posteaza un job
      </button>
      
    </section>
  );
}

export default HomePage;