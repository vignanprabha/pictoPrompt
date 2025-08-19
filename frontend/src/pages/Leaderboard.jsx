// frontend/src/pages/Leaderboard.jsx
import React, { useEffect, useMemo, useState } from 'react'
import { getLeaderboard } from '../api'

export default function Leaderboard() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all') // 'all' | 'completed' | 'eliminated'
  const [query, setQuery] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await getLeaderboard(200)
        setRows(Array.isArray(data) ? data : [])
      } catch (e) {
        setError(e?.response?.data?.detail || 'Failed to load leaderboard')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    let out = rows
    if (filter === 'completed') {
      out = out.filter(r => r.state === 'completed')
    } else if (filter === 'eliminated') {
      out = out.filter(r => r.state === 'eliminated')
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      out = out.filter(r => (r.display_name || '').toLowerCase().includes(q))
    }
    return out
  }, [rows, filter, query])

  return (
    <div className="container">
      <div
        className="card"
        style={{
          overflow: 'hidden',
          padding: 0,
          border: '1px solid #1b2a48',
          background: 'linear-gradient(180deg, rgba(8,18,35,0.9), rgba(7,14,26,0.95))',
          boxShadow: '0 16px 40px rgba(0,0,0,0.35)'
        }}
      >
        {/* Header */}
        <div
          style={{
            position: 'relative',
            padding: '18px 22px',
            borderBottom: '1px solid #1b2a48',
            background: 'linear-gradient(90deg, rgba(24,38,63,0.65), rgba(24,38,63,0))',
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #60a5fa 0%, #8b5cf6 50%, #22d3ee 100%)',
              boxShadow: '0 0 18px rgba(96,165,250,0.35)',
              display: 'grid',
              placeItems: 'center',
              color: '#0b1224',
              fontWeight: 800
            }}
          >
            🏁
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: 0.3 }}>
              Leaderboard
            </div>
            <div className="small" style={{ color: '#9fb4d1' }}>
              Completed first, then highest scores
            </div>
          </div>

          {/* Filters */}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
            <div
              style={{
                display: 'flex',
                background: '#0c172a',
                border: '1px solid #1b2a48',
                borderRadius: 999,
                overflow: 'hidden'
              }}
            >
              <FilterButton label="All" active={filter === 'all'} onClick={() => setFilter('all')} />
              <FilterButton label="Completed" active={filter === 'completed'} onClick={() => setFilter('completed')} />
              <FilterButton label="Eliminated" active={filter === 'eliminated'} onClick={() => setFilter('eliminated')} />
            </div>

            <div style={{ position: 'relative' }}>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search name…"
                style={{
                  padding: '8px 12px 8px 32px',
                  borderRadius: 10,
                  border: '1px solid #1b2a48',
                  background: '#0b1427',
                  color: '#d6e4ff'
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  left: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#5b6b86',
                  fontSize: 14
                }}
              >
                🔎
              </span>
            </div>
          </div>

          <div
            style={{
              position: 'absolute',
              left: 0,
              bottom: 0,
              width: '100%',
              height: 2,
              background: 'linear-gradient(90deg, #22d3ee 0%, #60a5fa 50%, #8b5cf6 100%)',
              opacity: 0.35
            }}
          />
        </div>

        {/* Body */}
        <div style={{ padding: 18 }}>
          {error && (
            <div
              className="card"
              style={{
                background: 'linear-gradient(180deg,#1a0f13,#0d0a0a)',
                border: '1px solid #3b1b1b',
                color: '#fca5a5'
              }}
            >
              {error}
            </div>
          )}

          {loading && !error && (
            <div
              className="card"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                border: '1px solid #1b2a48'
              }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg,#60a5fa,#8b5cf6,#22d3ee)',
                  animation: 'pulseDot 1s ease-in-out infinite'
                }}
              />
              Loading…
              <style>
                {`
                  @keyframes pulseDot {
                    0% { transform: scale(1); opacity: .7 }
                    50%{ transform: scale(1.3); opacity: 1 }
                    100%{ transform: scale(1); opacity: .7 }
                  }
                `}
              </style>
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div
              className="card"
              style={{
                textAlign: 'center',
                border: '1px solid #1b2a48',
                color: '#9fb4d1'
              }}
            >
              No entries for this filter. Try switching tabs or clearing search.
            </div>
          )}

          {!loading && !error && filtered.length > 0 && (
            <div style={{ display: 'grid', gap: 10 }}>
              {filtered.map((r, idx) => {
                const isCompleted = r.state === 'completed'
                const accent =
                  idx === 0 ? '#f59e0b' : idx === 1 ? '#9ca3af' : idx === 2 ? '#b45309' : '#1f2a44'
                return (
                  <div
                    key={r.display_name + idx}
                    style={{
                      position: 'relative',
                      border: '1px solid #1b2a48',
                      borderRadius: 12,
                      padding: 14,
                      background: 'linear-gradient(180deg, rgba(11,22,40,0.65), rgba(9,16,30,0.9))',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      overflow: 'hidden'
                    }}
                  >
                    {/* Rank */}
                    <div
                      style={{
                        minWidth: 38,
                        height: 38,
                        borderRadius: 10,
                        border: `1px solid ${accent}`,
                        display: 'grid',
                        placeItems: 'center',
                        color: accent,
                        fontWeight: 800,
                        background:
                          idx < 3
                            ? 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(139,92,246,0.1))'
                            : 'transparent'
                      }}
                    >
                      #{idx + 1}
                    </div>

                    {/* Name and status */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 800,
                          letterSpacing: 0.3,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                        title={r.display_name}
                      >
                        {r.display_name}
                      </div>
                      <div className="small" style={{ marginTop: 4 }}>
                        {isCompleted ? (
                          <span
                            className="badge"
                            style={{
                              borderColor: '#22d3ee',
                              color: '#22d3ee',
                              background: 'rgba(34,211,238,0.08)'
                            }}
                          >
                            Completed
                          </span>
                        ) : (
                          <span
                            className="badge"
                            style={{
                              borderColor: '#f59e0b',
                              color: '#f59e0b',
                              background: 'rgba(245,158,11,0.08)'
                            }}
                          >
                            Eliminated
                          </span>
                        )}
                        {!isCompleted && r.eliminated_at ? (
                          <span className="small" style={{ color: '#fca5a5', marginLeft: 8 }}>
                            at {r.eliminated_at}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {/* Score pill */}
                    <div
                      style={{
                        padding: '8px 12px',
                        border: '1px solid #24324f',
                        borderRadius: 999,
                        fontWeight: 800,
                        color: '#d6e4ff',
                        background: 'linear-gradient(135deg, rgba(34,211,238,0.08), rgba(96,165,250,0.08))'
                      }}
                      title="Score"
                    >
                      {Math.round(r.total_score || 0)}
                    </div>

                    <div
                      style={{
                        position: 'absolute',
                        left: 0,
                        bottom: 0,
                        width: '100%',
                        height: 2,
                        background: 'linear-gradient(90deg, #34d399, #22d3ee, #60a5fa, #8b5cf6)',
                        opacity: 0.25
                      }}
                    />
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function FilterButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '8px 12px',
        border: 'none',
        background: active ? 'rgba(34,211,238,0.12)' : 'transparent',
        color: active ? '#22d3ee' : '#9fb4d1',
        borderRight: '1px solid #1b2a48',
        cursor: 'pointer',
        fontWeight: 700
      }}
    >
      {label}
    </button>
  )
}
