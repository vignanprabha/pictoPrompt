import React, { useEffect, useState } from 'react'
import { getLeaderboard } from '../api'

const tabs = ['easy','medium','hard']

export default function Leaderboards() {
  const [level, setLevel] = useState('easy')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const data = await getLeaderboard(level, 50)
        setRows(data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [level])

  return (
    <div className="container">
      <div className="card">
        <h2>Leaderboards</h2>
        <div className="row" style={{marginTop: 12}}>
          {tabs.map(t => (
            <button
              key={t}
              className={t === level ? 'success' : 'secondary'}
              onClick={() => setLevel(t)}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>
        {loading && <div style={{marginTop:12}}>Loading...</div>}
        {!loading && (
          <div style={{marginTop:12}}>
            {rows.length === 0 && <div className="small">No completed sessions yet.</div>}
            {rows.map(r => (
              <div key={`${r.rank}-${r.display_name}`} className="row" style={{justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid #1f2937'}}>
                <div>#{r.rank} — {r.display_name}</div>
                <div><strong>{r.total_score}</strong></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
