import "../styles/admin.css";

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
    <div className="admin-modal-overlay">
      <div className="admin-modal">
        <h3 className="admin-modal__title">{title}</h3>
        <p className="admin-modal__message">{message}</p>

        <div className="admin-modal__actions">
          <button onClick={onCancel} className="admin-modal__btn admin-modal__btn--cancel">
            {cancelText}
          </button>
          <button onClick={onConfirm} className="admin-modal__btn admin-modal__btn--confirm">
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}