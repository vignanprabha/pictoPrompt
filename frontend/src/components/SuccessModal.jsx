import React from 'react'
import MatchBars from './MatchBars'
import { useNavigate } from 'react-router-dom'

export default function SuccessModal({ open, stage, matches, onNext, nextStage }) {
  const navigate = useNavigate()
  if (!open) return null

  const isDone = nextStage === 'done'
  const title = isDone
    ? 'Challenge Completed! ✨'
    : stage === 'easy' ? 'Great job! Ready for Medium?'
    : stage === 'medium' ? 'Awesome! Ready for Hard?'
    : 'Stage cleared!'

  const icon = isDone ? '🏆' : (stage === 'easy' ? '🛫' : (stage === 'medium' ? '✈️' : '🚀'))

  const sessionId = window.location.pathname.split('/').pop()

  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.42)',
      display:'flex', justifyContent:'center', alignItems:'center', zIndex:50
    }}>
      <div className="card" style={{maxWidth:640, width:'92%', border:'1px solid #1f3b5b', background:'linear-gradient(180deg,#0c1727,#0b1322)'}}>
        <div style={{display:'flex', alignItems:'center', gap:10}}>
          <span style={{fontSize:22}}>{icon}</span>
          <h2 style={{margin:0, color:'#cfe9ff'}}>{title}</h2>
          {!isDone && (
            <span className="badge" style={{marginLeft:'auto', borderColor:'#22d3ee', color:'#22d3ee'}}>Awaiting your go</span>
          )}
        </div>
        {Array.isArray(matches) && matches.length > 0 && (
          <div style={{marginTop:12}}>
            <div className="small" style={{color:'#cbd5e1'}}>Your matches this stage:</div>
            <MatchBars items={matches} />
          </div>
        )}
        <div style={{marginTop:16, display:'flex', justifyContent:'flex-end', gap:10}}>
          {isDone ? (
            <>
              <button className="success" onClick={() => navigate(`/results/${sessionId}`)}>View Results</button>
              <button className="secondary" onClick={() => navigate('/leaderboard')}>Leaderboard</button>
            </>
          ) : (
            <button className="success" onClick={onNext}>Go to next level</button>
          )}
        </div>
      </div>
    </div>
  )
}
