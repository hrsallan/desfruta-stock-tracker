import { useEffect } from 'react'

function Toast({ id, type = 'info', title, message, duration = 4000, onDismiss }) {
  useEffect(() => {
    // não auto-fecha se duration for 0
    if (!duration) return
    const t = setTimeout(() => onDismiss?.(id), duration)
    return () => clearTimeout(t)
  }, [duration, id, onDismiss])

  return (
    <div className={`toast toast--${type}`} role="status" aria-live="polite">
      <div className="toast__content">
        {title ? <div className="toast__title">{title}</div> : null}
        <div className="toast__message">{message}</div>
      </div>

      <button
        type="button"
        className="toast__close"
        aria-label="Fechar notificação"
        onClick={() => onDismiss?.(id)}
      >
        <span aria-hidden="true">×</span>
      </button>
    </div>
  )
}

export function ToastViewport({ toasts = [], onDismiss }) {
  if (!toasts.length) return null

  return (
    <div className="toastViewport" aria-label="Notificações">
      {toasts.map((t) => (
        <Toast key={t.id} {...t} onDismiss={onDismiss} />
      ))}
    </div>
  )
}
