// import React, { useEffect, useState } from 'react'
// import { useNavigate, useParams } from 'react-router-dom'
// import { getSessionStatus, submitAll } from '../api'
// import ImagePromptCard from '../components/ImagePromptCard'

// export default function PlayLevel() {
//   const { sessionId } = useParams()
//   const [images, setImages] = useState([])
//   const [prompts, setPrompts] = useState({})
//   const [imageCount, setImageCount] = useState(3)
//   const [state, setState] = useState('active')
//   const [loading, setLoading] = useState(true)
//   const [submitting, setSubmitting] = useState(false)
//   const [error, setError] = useState('')
//   const navigate = useNavigate()

//   const load = async () => {
//     setLoading(true)
//     try {
//       const st = await getSessionStatus(sessionId)
//       setState(st.state)
//       setImageCount(st.image_count)
//       setImages(st.images.map(i => ({ image_id: i.image_id, image_url: i.image_url, position: i.position })))
//       if (st.state === 'completed') navigate(`/results/${sessionId}`)
//     } finally {
//       setLoading(false)
//     }
//   }

//   useEffect(() => { load() }, [sessionId])

//   const onChangePrompt = (image_id, value) => {
//     setPrompts(prev => ({ ...prev, [image_id]: value }))
//   }

//   const handleSubmitAll = async () => {
//     setError('')
//     // Validate all prompts present and non-empty
//     const items = images.map(img => ({ image_id: img.image_id, user_prompt: (prompts[img.image_id] || '').trim() }))
//     if (items.some(it => !it.user_prompt)) {
//       setError('Please enter a prompt for every image.')
//       return
//     }
//     setSubmitting(true)
//     try {
//       const res = await submitAll(sessionId, items)
//       navigate(`/results/${sessionId}`)
//     } catch (e) {
//       const detail = e?.response?.data?.detail || 'Submission failed'
//       setError(detail)
//     } finally {
//       setSubmitting(false)
//     }
//   }

//   return (
//     <div className="container">
//       <div className="row" style={{justifyContent:'space-between', alignItems:'center'}}>
//         <h2>Play — {imageCount} {imageCount === 1 ? 'image' : 'images'}</h2>
//         <span className="badge">{state === 'active' ? 'Active' : 'Completed'}</span>
//       </div>
//       {loading && <div className="card" style={{marginTop:16}}>Loading...</div>}
//       {!loading && state === 'active' && (
//         <>
//           <div className="grid" style={{marginTop:16}}>
//             {images.map(img => (
//               <ImagePromptCard
//                 key={img.image_id}
//                 image={img}
//                 value={prompts[img.image_id] || ''}
//                 onChange={onChangePrompt}
//               />
//             ))}
//           </div>
//           {error && <div style={{color:'#fca5a5', marginTop:12}}>{error}</div>}
//           <div style={{marginTop:16, display:'flex', justifyContent:'flex-end'}}>
//             <button className="success" onClick={handleSubmitAll} disabled={submitting}>
//               {submitting ? 'Submitting...' : 'Submit All'}
//             </button>
//           </div>
//         </>
//       )}
//       {!loading && state !== 'active' && (
//         <div className="card" style={{marginTop:16}}>
//           <div>Session completed.</div>
//           <div style={{marginTop:12}}>
//             <a href={`/results/${sessionId}`}><button>View Results</button></a>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }
