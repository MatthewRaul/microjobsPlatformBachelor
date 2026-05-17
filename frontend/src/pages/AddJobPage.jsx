import { useState } from "react";
import DatePickerInput from "../components/DatePickerInput";
import { createJob } from "../api/jobApi";
import { useNavigate } from "react-router-dom";
import LocationAutocomplete from "../components/LocationAutocomplete";
import "../styles/auth.css";

function AddJobPage() {
  const navigate = useNavigate();

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
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !title.trim() ||
      !description.trim() ||
      !startDate ||
      !endDate ||
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
      await createJob(jobData);
      setSuccessMessage("Jobul a fost publicat cu succes.");
      setTitle("");
      setDescription("");
      setNeededWorkers(1);
      setStartDate(null);
      setEndDate(null);
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