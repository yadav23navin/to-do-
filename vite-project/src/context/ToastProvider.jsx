import { useState, useCallback, useMemo, useRef } from 'react'
import { ToastContext } from './toastContext.js'
import ToastContainer from '../components/ToastContainer.jsx'

let idCounter = 0

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timersRef = useRef({})

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((t) => t.id !== id))
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id])
      delete timersRef.current[id]
    }
  }, [])

  // type: 'success' | 'error' | 'confirm'
  // success/error auto-dismiss after 3s. confirm stays until the user
  // clicks one of its two buttons (no auto-dismiss — you don't want a
  // delete confirmation disappearing on its own before the user answers).
  const push = useCallback((toast) => {
    const id = ++idCounter
    setToasts((current) => [...current, { id, ...toast }])

    if (toast.type !== 'confirm') {
      timersRef.current[id] = setTimeout(() => dismiss(id), 3000)
    }

    return id
  }, [dismiss])

  const success = useCallback((message) => push({ type: 'success', message }), [push])
  const error = useCallback((message) => push({ type: 'error', message }), [push])

  // Replaces window.confirm(). Usage:
  // toast.confirm("Delete this task?", () => deleteTask(id))
  const confirm = useCallback((message, onConfirm) => {
    const id = push({
      type: 'confirm',
      message,
      onConfirm: () => {
        dismiss(id)
        onConfirm()
      },
      onCancel: () => dismiss(id),
    })
    return id
  }, [push, dismiss])

  const value = useMemo(() => ({ success, error, confirm, dismiss }), [success, error, confirm, dismiss])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

export default ToastProvider