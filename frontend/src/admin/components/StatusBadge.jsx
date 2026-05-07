export default function StatusBadge({ status }) {
  const normalizedStatus = status?.toUpperCase?.() || "UNKNOWN";

  const badgeStyle = {
    ...styles.badge,
    ...(statusColors[normalizedStatus] || styles.defaultBadge),
  };

  return <span style={badgeStyle}>{normalizedStatus}</span>;
}

const styles = {
  badge: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "700",
    letterSpacing: "0.3px",
  },
  defaultBadge: {
    backgroundColor: "#e5e7eb",
    color: "#111827",
  },
};

const statusColors = {
  OPEN: {
    backgroundColor: "#dcfce7",
    color: "#166534",
  },
  FILLED: {
    backgroundColor: "#dbeafe",
    color: "#1d4ed8",
  },
  COMPLETED: {
    backgroundColor: "#ede9fe",
    color: "#6d28d9",
  },
  CANCELED: {
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
  },
  IN_PROGRESS: {
    backgroundColor: "#fef3c7",
    color: "#b45309",
  },
  PENDING: {
    backgroundColor: "#fef3c7",
    color: "#b45309",
  },
  ACCEPTED: {
    backgroundColor: "#dcfce7",
    color: "#166534",
  },
  REJECTED: {
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
  },
  ADMIN: {
    backgroundColor: "#dbeafe",
    color: "#1e40af",
  },
  USER: {
    backgroundColor: "#e5e7eb",
    color: "#374151",
  },
};