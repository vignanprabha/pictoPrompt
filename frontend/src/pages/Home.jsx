import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { startGame } from '../api'
import BanterModal from '../components/BanterModal'

export default function Home() {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [banterOpen, setBanterOpen] = useState(false)
  const [banterMsg, setBanterMsg] = useState('')
  const navigate = useNavigate()

  const handleStart = async () => {
    setError('')
    if (!name.trim()) { setError('Enter a display name'); return }
    setLoading(true)
    try {
      const data = await startGame(name.trim())
      navigate(`/play/${data.session_id}`)
    } catch (e) {
      const status = e?.response?.status
      const detail = e?.response?.data?.detail || 'Failed to start'
      if (status === 403) {
        setBanterMsg(detail)
        setBanterOpen(true)
      } else {
        setError(detail)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="container">
        <div className="card">
          <h1>PictoPrompt — Turn Pictures into Words</h1>
          <p className="small">Attempt 1 Easy, 2 Medium, and 2 Hard images. Pass thresholds to advance: Easy≥70, Medium≥75, Hard≥85. Single attempt per pilot.</p>
          <div className="row" style={{marginTop:16}}>
            <div style={{flex:1}}>
              <label>Display Name</label>
              <input value={name} onChange={e=>setName(e.target.value)} maxLength={80} placeholder="e.g., Vignan" />
            </div>
          </div>
          {error && <div style={{color:'#fca5a5', marginTop:12}}>{error}</div>}
          <div style={{marginTop:16}}>
            <button onClick={handleStart} disabled={loading} className="pulse">{loading ? 'Starting...' : 'Start Challenge'}</button>
          </div>
        </div>
        <div className="footer" style={{textAlign:'center', marginTop:18}}>
          Tip: Be specific—mention subject, style, lighting, lenses, composition, etc.
        </div>
      </div>

      <BanterModal open={banterOpen} message={banterMsg} onClose={() => setBanterOpen(false)} />
    </>
  )
}
