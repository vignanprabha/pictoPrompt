import React from 'react'

export default function ScoreBar({ value=0, max=100 }) {
  const width = Math.max(0, Math.min(100, (value/max)*100))
  return (
    <div className="progress"><div style={{ width: `${width}%` }}></div></div>
  )
}
