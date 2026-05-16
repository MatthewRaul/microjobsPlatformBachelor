import { useState } from "react";
import { createJob } from "../api/jobApi";
import { useNavigate } from "react-router-dom";
import LocationAutocomplete from "../components/LocationAutocomplete";
import "../styles/auth.css";

function AddJobPage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [neededWorkers, setNeededWorkers] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [salary, setSalary] = useState("");
  const [location, setLocation] = useState("");
  const [county, setCounty] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

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

    if (!county.trim()) {
      setError("Te rog selectează o localitate validă din listă.");
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
      county,
    };

    try {
      setLoading(true);
      await createJob(jobData);
      setSuccessMessage("Jobul a fost publicat cu succes.");
      setTitle("");
      setDescription("");
      setNeededWorkers(1);
      setStartDate("");
      setEndDate("");
      setSalary("");
      setLocation("");
      setCounty("");
      navigate("/");
    } catch (err) {
      console.error(err);
      setError("Nu s-a putut publica jobul. Încearcă din nou.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="form-box" style={{ maxWidth: "520px" }}>
        <h1>Publică un job</h1>

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
            <p style={{
              fontSize: "13px",
              color: "rgba(255,255,255,0.75)",
              marginTop: "-16px",
              marginBottom: "16px",
            }}>
              Județ: <strong style={{ color: "#ffffff" }}>{county}</strong>
            </p>
          )}

          {successMessage && <p className="form-success">{successMessage}</p>}
          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? "Se publică..." : "Publică jobul"}
          </button>
        </form>
      </div>
    </section>
  );
}

export default AddJobPage;