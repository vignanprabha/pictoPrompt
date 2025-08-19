import React, { useEffect, useState } from 'react'

export default function Toast({ message, duration=2000, show, onDone }) {
  const [visible, setVisible] = useState(show)
  useEffect(() => {
    if (!show) return
    setVisible(true)
    const t = setTimeout(() => { setVisible(false); onDone?.() }, duration)
    return () => clearTimeout(t)
  }, [show, duration, onDone])
  if (!visible) return null
  return <div className="toast">{message}</div>
}
