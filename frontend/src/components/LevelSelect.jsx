import React from 'react'

export default function LevelSelect({ level, setLevel }) {
  return (
    <div>
      <label>Choose Level</label>
      <select value={level} onChange={e => setLevel(e.target.value)}>
        <option value="easy">Easy</option>
        <option value="medium">Medium</option>
        <option value="hard">Hard</option>
      </select>
    </div>
  )
}
