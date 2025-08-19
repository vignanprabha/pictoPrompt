import React, { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getStatus } from '../api'

export default function Results() {
  const { sessionId } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [openRows, setOpenRows] = useState({}) // {session_image_id: true/false}

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const st = await getStatus(sessionId)
        setData(st)
      } catch (e) {
        setError(e?.response?.data?.detail || 'Failed to load results')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [sessionId])

  const isWin = data?.state === 'completed'
  const title = isWin ? 'Mission Accomplished' : 'Eliminated'
  const subtitle = isWin
    ? `Score: ${Math.round(data?.total_score || 0)} • Completed: ${data?.images_completed || 0}`
    : `At: ${data?.eliminated_at || 'Unknown'} • Completed: ${data?.images_completed || 0}`

  const items = useMemo(() => {
    const arr = Array.isArray(data?.images) ? data.images : []
    // Sort by stage_order ascending
    return arr.slice().sort((a, b) => (a.stage_order || 0) - (b.stage_order || 0))
  }, [data])

  const toggleRow = (id) => {
    setOpenRows(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="container">
      <ResultsStyles />

      {loading && <div className="card">Loading results…</div>}

      {!loading && error && (
        <div className="card" style={{ border: '1px solid #3b1b1b', background: 'linear-gradient(180deg,#1a0f13,#0d0a0a)', color: '#fca5a5' }}>
          {error}
        </div>
      )}

      {!loading && !error && data && (
        <div className="card list-shell">
          {/* Sticky header summary */}
          <div className="list-header">
            <div className="list-title">
              <span className={`pill-state ${isWin ? 'ok' : 'bad'}`}>{isWin ? '✓ Completed' : '✗ Eliminated'}</span>
              <span className="list-headline">{title}</span>
              <span className="list-sub">{subtitle}</span>
            </div>
            <div className="list-actions">
              <Link to="/leaderboard"><button className="btn secondary">Leaderboard</button></Link>
              <Link to="/"><button className="btn">Home</button></Link>
            </div>
          </div>

          {/* Column headers */}
          <div className="list-cols">
            <div className="col col-img">Image</div>
            <div className="col col-meta">Details</div>
            <div className="col col-score">Match</div>
          </div>

          {/* Rows */}
          <div className="list-body">
            {items.length === 0 && (
              <div className="empty">No per-image data available.</div>
            )}

            {items.map((it) => {
              const score = typeof it.score === 'number' ? Math.max(0, Math.min(100, it.score)) : null
              const levelColor = it.level === 'easy' ? '#22d3ee' : it.level === 'medium' ? '#60a5fa' : '#8b5cf6'
              const open = !!openRows[it.session_image_id]
              return (
                <div key={it.session_image_id} className="list-row">
                  {/* Thumb */}
                  <div className="cell col-img">
                    {it.image_url ? (
                      <img src={it.image_url} alt={`#${it.stage_order}`} className="thumb" />
                    ) : (
                      <div className="thumb placeholder">N/A</div>
                    )}
                  </div>

                  {/* Meta */}
                  <div className="cell col-meta">
                    <div className="line1">
                      <span className="chip" style={{ borderColor: levelColor, color: levelColor }}>
                        {(it.level || '').toUpperCase()}
                      </span>
                      <span className="chip">#{it.stage_order}</span>
                      <span className="chip soft">{(it.stage_name || '').toUpperCase()}</span>
                    </div>

                    <button className="link" onClick={() => toggleRow(it.session_image_id)}>
                      {open ? 'Hide prompt' : 'Show prompt'}
                    </button>

                    {open && (
                      <div className="prompt-box">
                        {it.user_prompt ? it.user_prompt : <span style={{ color: '#94a3b8' }}>No prompt captured</span>}
                      </div>
                    )}
                  </div>

                  {/* Score */}
                  <div className="cell col-score">
                    <div className="bar">
                      <div className="bar-fill" style={{ width: `${score != null ? score : 0}%` }} />
                    </div>
                    <div className="pct">{score != null ? `${Math.round(score)}%` : '-'}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function ResultsStyles() {
  return (
    <style>{`
      .list-shell {
        padding: 0;
        overflow: hidden;
        border: 1px solid #14243e;
        background: linear-gradient(180deg, rgba(9,18,32,0.96), rgba(7,14,26,0.98));
      }

      .list-header {
        position: sticky; top: 0; z-index: 5;
        display: flex; align-items: center; gap: 10px;
        padding: 14px 18px;
        border-bottom: 1px solid #14243e;
        background: linear-gradient(90deg, rgba(22,34,57,0.6), rgba(22,34,57,0));
        backdrop-filter: blur(2px);
      }
      .list-title { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
      .pill-state {
        display: inline-block; padding: 6px 10px; border-radius: 999px; font-weight: 800; font-size: 12px;
        border: 1px solid #1f2a44; background: #0c172a; color: #d6e4ff;
      }
      .pill-state.ok { border-color: #22d3ee; color: #22d3ee; }
      .pill-state.bad { border-color: #f59e0b; color: #f59e0b; }
      .list-headline { font-weight: 900; letter-spacing: .35px; }
      .list-sub { color: #9fb4d1; font-size: 12px; }

      .list-actions { margin-left: auto; display: flex; gap: 8px; }
      .btn { background: #60a5fa; color: #07162a; border: none; padding: 8px 12px; border-radius: 10px; font-weight: 800; cursor: pointer; }
      .btn.secondary { background: #0c172a; color: #d6e4ff; border: 1px solid #1b2a48; }
      .btn:hover { filter: brightness(1.06) }

      .list-cols {
        display: grid; grid-template-columns: 120px 1fr 220px;
        gap: 12px; padding: 10px 18px; color: #8aa0c3; font-size: 12px;
        border-bottom: 1px solid #14243e;
      }
      @media (max-width: 900px) {
        .list-cols { grid-template-columns: 90px 1fr 150px; }
      }
      .col { opacity: .85; }
      .col-img { }
      .col-meta { }
      .col-score { text-align: right; }

      .list-body { padding: 6px 0; }
      .list-row {
        display: grid; grid-template-columns: 120px 1fr 220px; gap: 12px; align-items: center;
        padding: 10px 18px; border-bottom: 1px solid #101a2e;
        background: linear-gradient(180deg, rgba(12,23,42,.52), rgba(10,18,32,.88));
      }
      @media (max-width: 900px) {
        .list-row { grid-template-columns: 90px 1fr 150px; }
      }

      .cell { min-width: 0; }
      .thumb {
        width: 100%; max-width: 110px; height: 64px; object-fit: cover; border-radius: 10px; border: 1px solid #1a2b4c;
      }
      .thumb.placeholder { display: grid; place-items: center; color: #94a3b8; background: #0c172a; }

      .line1 { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-bottom: 6px; }
      .chip {
        display: inline-block; padding: 4px 8px; border-radius: 999px; border: 1px solid #1b2a48; color: #a4b3d1; font-size: 11px; background: #0c172a;
      }
      .chip.soft { color: #9fb4d1; border-color: #15233f; background: #0b1427; }

      .link {
        background: none; border: none; color: #9cc2ff; font-size: 12px; cursor: pointer; padding: 0;
      }
      .link:hover { text-decoration: underline; }

      .prompt-box {
        margin-top: 6px;
        border: 1px solid #1a2b4c;
        background: #0b1427;
        color: #d6e4ff;
        border-radius: 8px;
        padding: 8px;
        font-size: 13px;
        line-height: 1.4;
      }

      .bar {
        width: 100%; height: 10px; background: #16243d; border: 1px solid #1a2b4c; border-radius: 999px; overflow: hidden; display: inline-block;
      }
      .bar-fill {
        height: 100%; width: 0%; background: linear-gradient(90deg, #34d399, #22d3ee, #60a5fa); transition: width .7s ease;
      }
      .pct { display: inline-block; min-width: 48px; text-align: right; color: #d6e4ff; font-weight: 800; margin-left: 8px; }

      .empty { padding: 18px; color: #9fb4d1; text-align: center; }
    `}</style>
  )
}
