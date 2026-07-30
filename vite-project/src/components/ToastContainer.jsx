import './Toast.css'

function ToastContainer({ toasts, onDismiss }) {
  if (toasts.length === 0) return null

  const confirmToast = toasts.find((t) => t.type === 'confirm')
  const cornerToasts = toasts.filter((t) => t.type !== 'confirm')

  return (
    <>
      {cornerToasts.length > 0 && (
        <div className="toast-container">
          {cornerToasts.map((toast) => (
            <div key={toast.id} className={`toast toast-${toast.type}`}>
              <p>{toast.message}</p>
              <button
                type="button"
                className="toast-close"
                onClick={() => onDismiss(toast.id)}
                aria-label="Dismiss"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {confirmToast && (
        <div className="toast-confirm-backdrop">
          <div className="toast-confirm-modal">
            <p>{confirmToast.message}</p>
            <div className="toast-actions">
              <button
                type="button"
                className="toast-btn toast-btn-cancel"
                onClick={confirmToast.onCancel}
              >
                Cancel
              </button>
              <button
                type="button"
                className="toast-btn toast-btn-confirm"
                onClick={confirmToast.onConfirm}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ToastContainer