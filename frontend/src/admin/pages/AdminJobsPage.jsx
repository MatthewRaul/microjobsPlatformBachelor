import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import StatusBadge from "../components/StatusBadge";
import ConfirmModal from "../components/ConfirmModal";
import {
  getAdminJobs,
  cancelAdminJob,
  completeAdminJob,
  deleteAdminJob,
} from "../api/adminJobsApi";

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterMessage, setFilterMessage] = useState("");

  const [filters, setFilters] = useState({
    title: "",
    location: "",
    county: "",
    status: "",
    startDate: "",
    endDate: "",
  });

  const [jobToDelete, setJobToDelete] = useState(null);

  useEffect(() => {
    loadJobs();
  }, []);

  async function loadJobs() {
    try {
      setLoading(true);
      setError("");

      const data = await getAdminJobs();
      setJobs(data);
    } catch (err) {
      console.error(err);
      setError("Nu s-au putut încărca joburile.");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleApplyFilters() {
    await loadJobs();
    setFilterMessage("Filtrele au fost aplicate.");
    setTimeout(() => setFilterMessage(""), 2000);
  }

  async function handleResetFilters() {
    setFilters({
      title: "",
      location: "",
      county: "",
      status: "",
      startDate: "",
      endDate: "",
    });
    setFilterMessage("");
    await loadJobs();
  }

  async function handleCancel(jobId) {
    try {
      await cancelAdminJob(jobId);
      await loadJobs();
    } catch (err) {
      console.error(err);
      alert("Nu s-a putut anula jobul.");
    }
  }

  async function handleComplete(jobId) {
    try {
      await completeAdminJob(jobId);
      await loadJobs();
    } catch (err) {
      console.error(err);
      alert("Nu s-a putut finaliza jobul.");
    }
  }

  async function handleDelete() {
    if (!jobToDelete) return;

    try {
      await deleteAdminJob(jobToDelete.id);
      setJobToDelete(null);
      await loadJobs();
    } catch (err) {
      console.error(err);
      alert("Nu s-a putut șterge jobul.");
    }
  }

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesTitle =
        !filters.title ||
        (job.title || "").toLowerCase().includes(filters.title.toLowerCase());

      const matchesLocation =
        !filters.location ||
        (job.location || "")
          .toLowerCase()
          .includes(filters.location.toLowerCase());

      const matchesCounty =
        !filters.county ||
        (job.county || "")
          .toLowerCase()
          .includes(filters.county.toLowerCase());

      const matchesStatus =
        !filters.status || job.status === filters.status;

      const matchesStartDate =
        !filters.startDate ||
        (job.startDate &&
          new Date(job.startDate) >= new Date(filters.startDate));

      const matchesEndDate =
        !filters.endDate ||
        (job.endDate &&
          new Date(job.endDate) <= new Date(filters.endDate + "T23:59:59"));

      return (
        matchesTitle &&
        matchesLocation &&
        matchesCounty &&
        matchesStatus &&
        matchesStartDate &&
        matchesEndDate
      );
    });
  }, [jobs, filters]);

  return (
    <AdminLayout title="Administrare joburi">
      <div style={styles.pageHeader}>
        <h2 style={styles.sectionTitle}>Lista joburilor</h2>
        <p style={styles.sectionSubtitle}>
          Poți filtra, anula, finaliza sau șterge joburile din platformă.
        </p>
      </div>

      <div style={styles.filtersBox}>
        <input
          type="text"
          name="title"
          placeholder="Titlu job"
          value={filters.title}
          onChange={handleChange}
          style={styles.input}
        />

        <input
          type="text"
          name="location"
          placeholder="Localitate"
          value={filters.location}
          onChange={handleChange}
          style={styles.input}
        />

        <input
          type="text"
          name="county"
          placeholder="Județ"
          value={filters.county}
          onChange={handleChange}
          style={styles.input}
        />

        <select
          name="status"
          value={filters.status}
          onChange={handleChange}
          style={styles.input}
        >
          <option value="">Toate statusurile</option>
          <option value="OPEN">OPEN</option>
          <option value="FILLED">FILLED</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="CANCELED">CANCELED</option>
        </select>

        <input
          type="date"
          name="startDate"
          value={filters.startDate}
          onChange={handleChange}
          style={styles.input}
        />

        <input
          type="date"
          name="endDate"
          value={filters.endDate}
          onChange={handleChange}
          style={styles.input}
        />

        <button
          type="button"
          onClick={handleApplyFilters}
          style={{ ...styles.button, ...styles.searchButton }}
        >
          Filtrează
        </button>

        <button
          type="button"
          onClick={handleResetFilters}
          style={{ ...styles.button, ...styles.resetButton }}
        >
          Reset
        </button>
      </div>

      {filterMessage && <p style={styles.successText}>{filterMessage}</p>}
      {loading && <p>Se încarcă joburile...</p>}
      {error && <p style={styles.errorText}>{error}</p>}

      {!loading && !error && filteredJobs.length === 0 && (
        <div style={styles.emptyBox}>
          Nu există joburi pentru filtrele selectate.
        </div>
      )}

      {!loading && !error && filteredJobs.length > 0 && (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Titlu</th>
                <th style={styles.th}>Locație</th>
                <th style={styles.th}>Județ</th>
                <th style={styles.th}>Owner</th>
                <th style={styles.th}>Start</th>
                <th style={styles.th}>End</th>
                <th style={styles.th}>Capacitate</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Acțiuni</th>
              </tr>
            </thead>

            <tbody>
              {filteredJobs.map((job) => (
                <tr key={job.id} style={styles.tr}>
                  <td style={styles.td}>{job.title}</td>
                  <td style={styles.td}>{job.location || "-"}</td>
                  <td style={styles.td}>{job.county || "-"}</td>
                  <td style={styles.td}>{job.postedBy}</td>

                  <td style={styles.td}>
                    {job.startDate
                      ? new Date(job.startDate).toLocaleString("ro-RO")
                      : "-"}
                  </td>

                  <td style={styles.td}>
                    {job.endDate
                      ? new Date(job.endDate).toLocaleString("ro-RO")
                      : "-"}
                  </td>

                  <td style={styles.td}>
                    {(job.acceptedWorkers ?? 0)} / {job.neededWorkers ?? 0}
                  </td>

                  <td style={styles.td}>
                    <StatusBadge status={job.status} />
                  </td>

                  <td style={styles.td}>
                    <div style={styles.actions}>
                      {job.status !== "CANCELED" && job.status !== "COMPLETED" && (
                        <>
                          <button
                            style={{ ...styles.actionButton, ...styles.cancelButton }}
                            onClick={() => handleCancel(job.id)}
                          >
                            Anulează
                          </button>

                          <button
                            style={{ ...styles.actionButton, ...styles.completeButton }}
                            onClick={() => handleComplete(job.id)}
                          >
                            Finalizează
                          </button>
                        </>
                      )}

                      <button
                        style={{ ...styles.actionButton, ...styles.deleteButton }}
                        onClick={() => setJobToDelete(job)}
                      >
                        Șterge
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        open={!!jobToDelete}
        title="Ștergere job"
        message={
          jobToDelete
            ? `Ești sigur că vrei să ștergi jobul "${jobToDelete.title}"?`
            : "Ești sigur că vrei să ștergi acest job?"
        }
        confirmText="Șterge"
        cancelText="Renunță"
        onCancel={() => setJobToDelete(null)}
        onConfirm={handleDelete}
      />
    </AdminLayout>
  );
}

const styles = {
  pageHeader: {
    marginBottom: "20px",
  },
  sectionTitle: {
    margin: 0,
    fontSize: "24px",
    color: "#111827",
  },
  sectionSubtitle: {
    marginTop: "6px",
    color: "#6b7280",
    fontSize: "14px",
  },
  filtersBox: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "12px",
    marginBottom: "20px",
    backgroundColor: "#ffffff",
    padding: "16px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
  },
  input: {
    padding: "12px 14px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    backgroundColor: "#ffffff",
  },
  button: {
    padding: "12px 16px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
  searchButton: {
    backgroundColor: "#2563eb",
    color: "#ffffff",
  },
  resetButton: {
    backgroundColor: "#e5e7eb",
    color: "#111827",
  },
  successText: {
    color: "#166534",
    fontWeight: "600",
    marginBottom: "12px",
  },
  errorText: {
    color: "#dc2626",
    fontWeight: "600",
    marginTop: "12px",
  },
  emptyBox: {
    marginTop: "20px",
    padding: "18px",
    backgroundColor: "#ffffff",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
    color: "#374151",
  },
  tableWrapper: {
    overflowX: "auto",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    marginTop: "10px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "14px",
    borderBottom: "1px solid #e5e7eb",
    backgroundColor: "#f9fafb",
    fontSize: "14px",
    color: "#374151",
  },
  tr: {
    borderBottom: "1px solid #f3f4f6",
  },
  td: {
    padding: "14px",
    fontSize: "14px",
    color: "#111827",
    verticalAlign: "top",
  },
  actions: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  actionButton: {
    border: "none",
    borderRadius: "8px",
    padding: "8px 12px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "13px",
  },
  cancelButton: {
    backgroundColor: "#fef3c7",
    color: "#92400e",
  },
  completeButton: {
    backgroundColor: "#dcfce7",
    color: "#166534",
  },
  deleteButton: {
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
  },
};