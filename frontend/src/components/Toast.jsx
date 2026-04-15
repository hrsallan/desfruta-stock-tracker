import { useEffect } from 'react'

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => onClose?.(), toast.duration ?? 3800)
    return () => clearTimeout(t)
  }, [toast, onClose])

  if (!toast) return null

  const type = toast.type || 'info'

  return (
    <div className="toastWrap" role="status" aria-live="polite">
      <div className={`toast ${type}`}>
        <div className="toastHead">
          <div className="toastTitle">{toast.title || 'Aviso'}</div>
          <button className="toastClose" type="button" onClick={onClose} aria-label="Fechar">
            ×
          </button>
        </div>
        {toast.message ? <div className="toastMsg">{toast.message}</div> : null}
      </div>
    </div>
  )
}
