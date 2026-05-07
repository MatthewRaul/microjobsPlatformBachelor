export default function ConfirmModal({
  open,
  title = "Confirmare",
  message = "Ești sigur că vrei să continui?",
  confirmText = "Confirmă",
  cancelText = "Anulează",
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3 style={styles.title}>{title}</h3>
        <p style={styles.message}>{message}</p>

        <div style={styles.actions}>
          <button onClick={onCancel} style={{ ...styles.button, ...styles.cancelButton }}>
            {cancelText}
          </button>

          <button onClick={onConfirm} style={{ ...styles.button, ...styles.confirmButton }}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "16px",
  },
  modal: {
    width: "100%",
    maxWidth: "420px",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "24px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
  },
  title: {
    margin: "0 0 12px",
    fontSize: "20px",
    color: "#111827",
  },
  message: {
    margin: "0 0 20px",
    color: "#4b5563",
    lineHeight: 1.5,
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
  },
  button: {
    border: "none",
    borderRadius: "8px",
    padding: "10px 16px",
    fontWeight: "600",
    cursor: "pointer",
  },
  cancelButton: {
    backgroundColor: "#e5e7eb",
    color: "#111827",
  },
  confirmButton: {
    backgroundColor: "#dc2626",
    color: "#ffffff",
  },
};