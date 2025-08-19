import React, { useEffect, useState } from 'react'

export default function MatchBars({ items=[] }) {
  const [vals, setVals] = useState(items.map(() => 0))
  useEffect(() => {
    const t = setTimeout(() => {
      setVals(items.map(i => Math.round(i.score || 0)))
    }, 30)
    return () => clearTimeout(t)
  }, [items])

  return (
    <div style={{marginTop:8}}>
      {items.map((m, idx) => (
        <div key={idx} style={{marginBottom:8}}>
          <div style={{display:'flex', justifyContent:'space-between', fontSize:12, color:'#9ca3af', marginBottom:4}}>
            <span>#{m.stage_order} {(m.level||'').toUpperCase()}</span>
            <span>{Math.round(vals[idx])}% — {m.points||0} pts</span>
          </div>
          <div style={{height:10, background:'#1f2937', borderRadius:999}}>
            <div style={{
              height:'100%',
              width: `${vals[idx]}%`,
              background: 'linear-gradient(90deg,#34d399,#22d3ee,#60a5fa)',
              borderRadius:999,
              transition: 'width .6s ease'
            }}/>
          </div>
        </div>
      ))}
    </div>
  )
}
