import { useEffect, useState } from "react";
import { getJobById, updateJob } from "../api/jobApi";
import { useNavigate, useParams } from "react-router-dom";

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

    if (
      !title.trim() ||
      !description.trim() ||
      !startDate.trim() ||
      !endDate.trim() ||
      !location.trim()
    ) {
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
      setError("Data de sfârșit trebuie să fie după data de început.");
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
    return <div style={{ padding: "20px" }}>Se încarcă datele jobului...</div>;
  }

  return (
    <section className="page auth-page">
      <h1>Editează jobul</h1>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label htmlFor="title">Denumire post</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label htmlFor="description">Descriere job</label>
        <input
          id="description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <label htmlFor="neededWorkers">Număr participanți</label>
        <input
          id="neededWorkers"
          type="number"
          min="1"
          value={neededWorkers}
          onChange={(e) => setNeededWorkers(e.target.value)}
        />

        <label htmlFor="startDate">Data și ora start</label>
        <input
          id="startDate"
          type="datetime-local"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />

        <label htmlFor="endDate">Data și ora finalizare</label>
        <input
          id="endDate"
          type="datetime-local"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />

        <label htmlFor="salary">Salariu</label>
        <input
          id="salary"
          type="number"
          min="0"
          value={salary}
          onChange={(e) => setSalary(e.target.value)}
        />

        <label htmlFor="location">Locație</label>
        <input
          id="location"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="primary-button" disabled={loading}>
          {loading ? "Se salvează..." : "Salvează modificările"}
        </button>
      </form>
    </section>
  );
}

export default EditJobPage;