export default function ConfirmModal({
  open = true,
  title = "Confirmare",
  message = "Ești sigur că vrei să continui?",
  confirmText = "Confirmă",
  cancelText = "Anulează",
  onConfirm,
  onCancel,
  isLoading = false,
  danger = false,
}) {
  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-dialog" role="dialog" aria-modal="true">
        <h3 className="modal-dialog__title">{title}</h3>
        <p className="modal-dialog__body">{message}</p>

        <div className="modal-dialog__actions">
          <button
            className={`primary-button modal-dialog__btn-confirm${danger ? " modal-dialog__btn-danger" : ""}`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Se procesează..." : confirmText}
          </button>
          <button
            className="primary-button modal-dialog__btn-cancel"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}