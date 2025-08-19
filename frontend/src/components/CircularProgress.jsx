import React from 'react'

export default function CircularProgress({ value=0, max=5, size=46, stroke=6, color='#60a5fa', track='#1f2937' }) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const pct = Math.max(0, Math.min(1, value / max))
  const offset = circumference * (1 - pct)

  return (
    <svg width={size} height={size} style={{display:'block'}}>
      <circle cx={size/2} cy={size/2} r={radius} stroke={track} strokeWidth={stroke} fill="none" />
      <circle
        cx={size/2} cy={size/2} r={radius} stroke={color} strokeWidth={stroke} fill="none"
        strokeDasharray={circumference.toFixed(2)}
        strokeDashoffset={offset.toFixed(2)}
        strokeLinecap="round"
        style={{transition: 'stroke-dashoffset .25s ease'}}
      />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" style={{fill:'#e5e7eb', fontSize: '12px', fontWeight: 700}}>
        {value}/{max}
      </text>
    </svg>
  )
}
