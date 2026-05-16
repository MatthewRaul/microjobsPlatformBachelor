import { useEffect, useState } from "react";
import { getJobById, updateJob } from "../api/jobApi";
import { useNavigate, useParams, Link } from "react-router-dom";
import "../styles/auth.css";

function EditJobPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [neededWorkers, setNeededWorkers] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [salary, setSalary] = useState("");
  const [location, setLocation] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingJob, setLoadingJob] = useState(true);

  const formatDateTimeLocal = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60000);
    return localDate.toISOString().slice(0, 16);
  };

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setError("");
        const job = await getJobById(id);
        setTitle(job.title || "");
        setDescription(job.description || "");
        setNeededWorkers(job.neededWorkers ?? 1);
        setStartDate(formatDateTimeLocal(job.startDate));
        setEndDate(formatDateTimeLocal(job.endDate));
        setSalary(job.salary ?? "");
        setLocation(job.location || "");
      } catch (err) {
        console.error("Eroare la încărcarea jobului:", err);
        setError("Nu s-au putut încărca datele jobului.");
      } finally {
        setLoadingJob(false);
      }
    };

    fetchJob();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !description.trim() || !startDate.trim() || !endDate.trim() || !location.trim()) {
      setError("Completează toate câmpurile obligatorii.");
      return;
    }

    if (Number(neededWorkers) < 1) {
      setError("Numărul de participanți trebuie să fie minim 1.");
      return;
    }

    if (salary === "") {
      setError("Salariul este obligatoriu.");
      return;
    }

    if (Number(salary) < 0) {
      setError("Salariul nu poate fi negativ.");
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      setError("Data de finalizare trebuie să fie după data de start.");
      return;
    }

    const jobData = {
      title,
      description,
      neededWorkers: Number(neededWorkers),
      startDate,
      endDate,
      salary: Number(salary),
      location,
    };

    try {
      setLoading(true);
      await updateJob(id, jobData);
      navigate(`/jobs/${id}`);
    } catch (err) {
      console.error("Eroare la actualizarea jobului:", err);
      setError("Nu s-a putut actualiza jobul.");
    } finally {
      setLoading(false);
    }
  };

  if (loadingJob) {
    return <div style={{ padding: "20px", color: "#333" }}>Se încarcă datele jobului...</div>;
  }

  return (
    <section className="auth-page">
      <div className="form-box" style={{ maxWidth: "520px" }}>
        <h1>Editează jobul</h1>

        <form onSubmit={handleSubmit}>
          <div className="user-box">
            <input
              id="title"
              type="text"
              placeholder=" "
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <label htmlFor="title">Denumire post</label>
          </div>

          <div className="user-box">
            <textarea
              id="description"
              placeholder=" "
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ resize: "vertical", minHeight: "80px" }}
            />
            <label htmlFor="description">Descriere job</label>
          </div>

          <div className="user-box">
            <input
              id="neededWorkers"
              type="number"
              min="1"
              placeholder=" "
              value={neededWorkers}
              onChange={(e) => setNeededWorkers(e.target.value)}
            />
            <label htmlFor="neededWorkers">Număr participanți</label>
          </div>

          <div className="user-box">
            <input
              id="startDate"
              type="datetime-local"
              placeholder=" "
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <label htmlFor="startDate">Data și ora de start</label>
          </div>

          <div className="user-box">
            <input
              id="endDate"
              type="datetime-local"
              placeholder=" "
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <label htmlFor="endDate">Data și ora de finalizare</label>
          </div>

          <div className="user-box">
            <input
              id="salary"
              type="number"
              min="0"
              placeholder=" "
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
            />
            <label htmlFor="salary">Salariu (RON)</label>
          </div>

          <div className="user-box">
            <input
              id="location"
              type="text"
              placeholder=" "
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <label htmlFor="location">Locație</label>
          </div>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? "Se salvează..." : "Salvează modificările"}
          </button>
        </form>

        <p className="form-footer">
          <Link to={`/jobs/${id}`}>Înapoi la job</Link>
        </p>
      </div>
    </section>
  );
}

export default EditJobPage;