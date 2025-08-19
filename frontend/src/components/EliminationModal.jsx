import React, { useEffect } from 'react'
import MatchBars from './MatchBars'

export default function EliminationModal({ open, eliminatedAt, originalPrompt, imageUrl, matches, onClose, autoMs=4500 }) {
  useEffect(() => {
    if (!open) return
    const t = setTimeout(() => onClose?.(), autoMs)
    return () => clearTimeout(t)
  }, [open, onClose, autoMs])

  if (!open) return null

  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.55)',
      display:'flex', justifyContent:'center', alignItems:'center', zIndex:50
    }}>
      <div className="card flash-bad" style={{maxWidth:740, width:'92%', border:'1px solid #3b1b1b', background:'linear-gradient(180deg,#1a0f13,#0d0a0a)'}}>
        <div style={{display:'flex', alignItems:'center', gap:10}}>
          <span style={{fontSize:24}}>💥</span>
          <h2 style={{margin:0, color:'var(--bad)'}}>Eliminated</h2>
          <span className="badge" style={{marginLeft:'auto', borderColor:'#ef4444', color:'#ef4444'}}>{eliminatedAt}</span>
        </div>

        <div className="row" style={{marginTop:12, alignItems:'flex-start'}}>
          {imageUrl && (
            <div style={{flex:'1 1 260px', minWidth:240, display:'flex', justifyContent:'center'}}>
              <img src={imageUrl} alt="Failed" style={{maxWidth:'100%', maxHeight:280, objectFit:'contain', borderRadius:12, border:'1px solid #2a2a2a'}} />
            </div>
          )}
          <div style={{flex:'2 1 360px', minWidth:300}}>
            <div className="small" style={{color:'#fca5a5'}}>Original prompt for the failed image:</div>
            <div style={{marginTop:8, background:'#121212', border:'1px solid #2a2a2a', padding:12, borderRadius:10, color:'#f3f4f6'}}>
              {originalPrompt || 'Unavailable'}
            </div>
            {Array.isArray(matches) && matches.length > 0 && (
              <div style={{marginTop:12}}>
                <div className="small" style={{color:'#cbd5e1'}}>Your matches in this stage:</div>
                <MatchBars items={matches} />
              </div>
            )}
          </div>
        </div>

        <div style={{marginTop:16, display:'flex', justifyContent:'flex-end', gap:10}}>
          <button className="secondary" onClick={onClose}>Go Home</button>
        </div>
      </div>
    </div>
  )
}
