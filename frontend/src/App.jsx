import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Home from './pages/Home.jsx'
import Play from './pages/Play.jsx'
import Results from './pages/Results.jsx'
import Leaderboard from './pages/Leaderboard.jsx'

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/play/:sessionId" element={<Play />} />
        <Route path="/results/:sessionId" element={<Results />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  )
}
