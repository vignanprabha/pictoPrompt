import React from 'react'
import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <div className="nav">
      <div className="inner">
        <Link to="/" className="brand">
          <img src="/static/logo.svg" alt="Logo" width="28" height="28" />
          <span>PictoPrompt</span>
        </Link>
        <div>
          <Link to="/" style={{marginRight:16}}>Home</Link>
          <Link to="/leaderboard">Leaderboard</Link>
        </div>
      </div>
    </div>
  )
}
