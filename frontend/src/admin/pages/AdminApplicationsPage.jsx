import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import StatusBadge from "../components/StatusBadge";
import ConfirmModal from "../components/ConfirmModal";
import {
  getAdminApplications,
  acceptAdminApplication,
  rejectAdminApplication,
  deleteAdminApplication,
} from "../api/adminApplicationsApi";

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterMessage, setFilterMessage] = useState("");

  const [filters, setFilters] = useState({
    email: "",
    status: "",
    jobId: "",
  });

  const [applicationToDelete, setApplicationToDelete] = useState(null);

  useEffect(() => {
    loadApplications();
  }, []);

  async function loadApplications() {
    try {
      setLoading(true);
      setError("");

      const data = await getAdminApplications();
      setApplications(data);
    } catch (err) {
      console.error(err);
      setError("Nu s-au putut încărca aplicările.");
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
    await loadApplications();
    setFilterMessage("Filtrele au fost aplicate.");
    setTimeout(() => setFilterMessage(""), 2000);
  }

  async function handleResetFilters() {
    const emptyFilters = {
      email: "",
      status: "",
      jobId: "",
    };

    setFilters(emptyFilters);
    setFilterMessage("");
    await loadApplications();
  }

  async function handleAccept(id) {
    try {
      await acceptAdminApplication(id);
      await loadApplications();
    } catch (err) {
      console.error(err);
      alert("Nu s-a putut accepta aplicarea.");
    }
  }

  async function handleReject(id) {
    try {
      await rejectAdminApplication(id);
      await loadApplications();
    } catch (err) {
      console.error(err);
      alert("Nu s-a putut respinge aplicarea.");
    }
  }

  async function handleDelete() {
    if (!applicationToDelete) return;

    try {
      await deleteAdminApplication(applicationToDelete.id);
      setApplicationToDelete(null);
      await loadApplications();
    } catch (err) {
      console.error(err);
      alert("Nu s-a putut șterge aplicarea.");
    }
  }

  const filteredApplications = useMemo(() => {
    return applications.filter((application) => {
      const matchesEmail =
        !filters.email ||
        (application.applicantEmail || "")
          .toLowerCase()
          .includes(filters.email.toLowerCase());

      const matchesStatus =
        !filters.status || application.status === filters.status;

      const matchesJobId =
        !filters.jobId ||
        (application.jobId || "")
          .toLowerCase()
          .includes(filters.jobId.toLowerCase());

      return matchesEmail && matchesStatus && matchesJobId;
    });
  }, [applications, filters]);

  return (
    <AdminLayout title="Administrare aplicări">
      <div style={styles.pageHeader}>
        <h2 style={styles.sectionTitle}>Lista aplicărilor</h2>
        <p style={styles.sectionSubtitle}>
          Poți filtra, accepta, respinge sau șterge aplicările din platformă.
        </p>
      </div>

      <div style={styles.filtersBox}>
        <input
          type="text"
          name="email"
          placeholder="Email aplicant"
          value={filters.email}
          onChange={handleChange}
          style={styles.input}
        />

        <input
          type="text"
          name="jobId"
          placeholder="Job ID"
          value={filters.jobId}
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
          <option value="PENDING">PENDING</option>
          <option value="ACCEPTED">ACCEPTED</option>
          <option value="REJECTED">REJECTED</option>
        </select>

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
      {loading && <p>Se încarcă aplicările...</p>}
      {error && <p style={styles.errorText}>{error}</p>}

      {!loading && !error && filteredApplications.length === 0 && (
        <div style={styles.emptyBox}>
          Nu există aplicări pentru filtrele selectate.
        </div>
      )}

      {!loading && !error && filteredApplications.length > 0 && (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Nume</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Job ID</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Data aplicării</th>
                <th style={styles.th}>Acțiuni</th>
              </tr>
            </thead>

            <tbody>
              {filteredApplications.map((application) => (
                <tr key={application.id} style={styles.tr}>
                  <td style={styles.td}>
                    {application.applicantFirstName} {application.applicantLastName}
                  </td>
                  <td style={styles.td}>{application.applicantEmail}</td>
                  <td style={styles.td}>{application.jobId}</td>
                  <td style={styles.td}>
                    <StatusBadge status={application.status} />
                  </td>
                  <td style={styles.td}>
                    {application.appliedAt
                      ? new Date(application.appliedAt).toLocaleString("ro-RO")
                      : "-"}
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actions}>
                      {application.status === "PENDING" && (
                        <>
                          <button
                            style={{ ...styles.actionButton, ...styles.acceptButton }}
                            onClick={() => handleAccept(application.id)}
                          >
                            Acceptă
                          </button>

                          <button
                            style={{ ...styles.actionButton, ...styles.rejectButton }}
                            onClick={() => handleReject(application.id)}
                          >
                            Respinge
                          </button>
                        </>
                      )}

                      <button
                        style={{ ...styles.actionButton, ...styles.deleteButton }}
                        onClick={() => setApplicationToDelete(application)}
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
        open={!!applicationToDelete}
        title="Ștergere aplicare"
        message={
          applicationToDelete
            ? `Ești sigur că vrei să ștergi aplicarea lui ${applicationToDelete.applicantFirstName} ${applicationToDelete.applicantLastName}?`
            : "Ești sigur că vrei să ștergi această aplicare?"
        }
        confirmText="Șterge"
        cancelText="Renunță"
        onCancel={() => setApplicationToDelete(null)}
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
  acceptButton: {
    backgroundColor: "#dcfce7",
    color: "#166534",
  },
  rejectButton: {
    backgroundColor: "#fef3c7",
    color: "#92400e",
  },
  deleteButton: {
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
  },
};