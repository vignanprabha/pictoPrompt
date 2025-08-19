import React, { useEffect, useState } from 'react'

const COLORS = ['#60a5fa','#8b5cf6','#22d3ee','#34d399','#f59e0b','#ef4444']

export default function Confetti({ burst=40, trigger }) {
  const [dots, setDots] = useState([])

  useEffect(() => {
    if (!trigger) return
    const arr = Array.from({ length: burst }).map((_, i) => ({
      id: i + '-' + Date.now(),
      left: Math.random() * 100,
      delay: Math.random() * 200,
      color: COLORS[Math.floor(Math.random() * COLORS.length)]
    }))
    setDots(arr)
    const t = setTimeout(() => setDots([]), 1000)
    return () => clearTimeout(t)
  }, [trigger, burst])

  return (
    <div className="confetti" aria-hidden>
      {dots.map(d => (
        <div key={d.id}
          className="dot"
          style={{
            left: d.left+'vw',
            top: '10vh',
            background: d.color,
            animationDelay: `${d.delay}ms`
          }}
        />
      ))}
    </div>
  )
}
