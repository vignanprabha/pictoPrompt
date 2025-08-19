import React from 'react'

export default function BanterModal({ open, message, onClose }) {
  if (!open) return null

  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.55)',
      display:'flex', justifyContent:'center', alignItems:'center', zIndex:60
    }}>
      <div className="card" style={{maxWidth:520, width:'92%', border:'1px solid #3b2a1b', background:'linear-gradient(180deg,#1c130a,#0e0a07)'}}>
        <div style={{display:'flex', alignItems:'center', gap:10}}>
          <span style={{fontSize:22}}>🛑</span>
          <h2 style={{margin:0, color:'#fbbf24'}}>Hold your horses, Captain!</h2>
        </div>
        <div style={{marginTop:10, color:'#fef3c7'}}>
          {message || "You've already flown this mission. No re-boarding allowed—ground control insists!"}
        </div>
        <div style={{marginTop:14, display:'flex', justifyContent:'flex-end', gap:10}}>
          <button className="secondary" onClick={onClose}>Okay, I’ll taxi back</button>
        </div>
      </div>
    </div>
  )
}
