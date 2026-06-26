import { useEffect, useState } from "react";
import DatePickerInput from "../components/DatePickerInput";
import { getJobById, updateJob } from "../api/jobApi";
import { useNavigate, useParams, Link } from "react-router-dom";
import LocationAutocomplete from "../components/LocationAutocomplete";
import "../styles/auth.css";

function EditJobPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [neededWorkers, setNeededWorkers] = useState(1);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [salary, setSalary] = useState("");
  const [location, setLocation] = useState("");
  const [county, setCounty] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingJob, setLoadingJob] = useState(true);

  const parseToDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString);
  };

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setError("");
        const job = await getJobById(id);
        setTitle(job.title || "");
        setDescription(job.description || "");
        setNeededWorkers(job.neededWorkers ?? 1);
        setStartDate(parseToDate(job.startDate));
        setEndDate(parseToDate(job.endDate));
        setSalary(job.salary ?? "");
        setLocation(job.location || "");
        setCounty(job.county || "");
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

    if (!title.trim() || !description.trim() || !startDate || !endDate || !location.trim()) {
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

    if (startDate < new Date()) {
      setError("Data de start nu poate fi în trecut.");
      return;
    }

    if (endDate < startDate) {
      setError("Data de finalizare trebuie să fie după data de start.");
      return;
    }

    const jobData = {
      title,
      description,
      neededWorkers: Number(neededWorkers),
      startDate: startDate ? startDate.toISOString() : "",
      endDate: endDate ? endDate.toISOString() : "",
      salary: Number(salary),
      location,
      county,
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
              rows={1}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = e.target.scrollHeight + "px";
              }}
              style={{ resize: "none", overflow: "hidden" }}
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

          <DatePickerInput
            label="Data și ora de start"
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            minDate={new Date()}
            filterTime={(time) => {
              const now = new Date();
              if (!startDate) return time > now;
              const isToday = startDate.toDateString() === now.toDateString();
              return isToday ? time > now : true;
            }}
          />

          <DatePickerInput
            label="Data și ora de finalizare"
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            minDate={startDate}
          />

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

          <LocationAutocomplete
            value={location}
            onChange={(value) => {
              setLocation(value);
              setCounty("");
            }}
            onSelect={(selectedLocation) => {
              setLocation(selectedLocation.location || "");
              setCounty(selectedLocation.county || "");
            }}
            label="Localitate"
          />

          {county && (
            <div className="user-box">
              <input
                id="county"
                type="text"
                placeholder=" "
                value={county}
                onChange={(e) => setCounty(e.target.value)}
              />
              <label htmlFor="county">Județ</label>
            </div>
          )}

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? "Se salvează..." : "Salvează modificările"}
          </button>
        </form>

      </div>
    </section>
  );
}

export default EditJobPage;