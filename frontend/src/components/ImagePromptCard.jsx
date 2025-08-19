import React from 'react'

export default function ImagePromptCard({ image, value, onChange }) {
  return (
    <div className="card fade-in" style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
      <div className="row" style={{alignItems:'center', justifyContent:'space-between', width:'100%'}}>
        <span className="badge">Image {image.stage_order}</span>
        <span className="badge">{(image.level||'').toUpperCase()}</span>
      </div>
      <div style={{marginTop:12, width:'100%', display:'flex', justifyContent:'center'}}>
        <img
          src={image.image_url}
          alt={`Image ${image.stage_order}`}
          style={{
            maxWidth:'100%', height:'auto', maxHeight:320,
            objectFit:'contain', borderRadius:12, border:'1px solid #1f2a44'
          }}
        />
      </div>
      <div style={{marginTop:12, width:'100%'}}>
        <label>Write your prompt (max 300 chars)</label>
        <textarea
          rows={4}
          maxLength={300}
          value={value}
          onChange={e => onChange(image.session_image_id, e.target.value)}
          placeholder="Describe the image as if prompting an AI... (style, subject, composition)"
        />
      </div>
    </div>
  )
}
