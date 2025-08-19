import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getNextStage, submitStage, getStatus } from '../api'
import ImagePromptCard from '../components/ImagePromptCard'
import EliminationModal from '../components/EliminationModal'
import SuccessModal from '../components/SuccessModal'
import Confetti from '../components/Confetti'
import Toast from '../components/Toast'
import CircularProgress from '../components/CircularProgress'

const stageTotals = { easy: 1, medium: 2, hard: 2 }
const thresholds = { easy: 70, medium: 75, hard: 85 }

export default function Play() {
  const { sessionId } = useParams()
  const [stage, setStage] = useState('easy')
  const [images, setImages] = useState([])
  const [prompts, setPrompts] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [imagesCompleted, setImagesCompleted] = useState(0)

  // Elimination
  const [elimOpen, setElimOpen] = useState(false)
  const [elimData, setElimData] = useState({ at: '', prompt: '', img: '', matches: [] })

  // Success
  const [confettiKey, setConfettiKey] = useState(0)
  const [toast, setToast] = useState({ show: false, msg: '' })
  const [successOpen, setSuccessOpen] = useState(false)
  const [successMatches, setSuccessMatches] = useState([])
  const [nextStage, setNextStage] = useState('easy')

  const navigate = useNavigate()
  const totalForStage = useMemo(() => stageTotals[stage] || 0, [stage])
  const stageBadgeColor = stage === 'easy' ? 'var(--cyan)' : (stage === 'medium' ? 'var(--accent)' : 'var(--violet)')
  const stageName = (s) => s.charAt(0).toUpperCase() + s.slice(1)

  const loadStage = async () => {
    setLoading(true)
    setPrompts({})
    try {
      const st = await getStatus(sessionId)
      // Only update if numeric; avoid resetting to 0 on transient/undefined
      if (typeof st.images_completed === 'number') {
        setImagesCompleted(st.images_completed)
        window.__lastCompleted = st.images_completed
      } else if (typeof window.__lastCompleted === 'number') {
        setImagesCompleted(window.__lastCompleted)
      }

      if (st.state === 'completed') { navigate(`/results/${sessionId}`); return }
      if (st.state === 'eliminated') { navigate(`/results/${sessionId}`); return }

      const ns = await getNextStage(sessionId)
      setStage(ns.current_stage)
      setImages(ns.images)
    } catch (e) {
      setError(e?.response?.data?.detail || 'Failed to load stage')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadStage() }, [sessionId])

  const onChangePrompt = (session_image_id, value) => {
    setPrompts(prev => ({ ...prev, [session_image_id]: value }))
  }

  const handleSubmitStage = async () => {
    setError('')
    if (images.some(img => !(prompts[img.session_image_id] || '').trim())) {
      setError('Please enter a prompt for every image.')
      return
    }
    setSubmitting(true)
    try {
      const items = images.map(img => ({
        session_image_id: img.session_image_id,
        user_prompt: (prompts[img.session_image_id] || '').trim()
      }))
      const res = await submitStage(sessionId, items)

      // Update total counter immediately and cache
      if (typeof res.images_completed === 'number') {
        setImagesCompleted(res.images_completed)
        window.__lastCompleted = res.images_completed
      }

      if (!res.passed) {
        setElimData({
          at: res.eliminated_at,
          prompt: res.eliminated_prompt || '',
          img: res.eliminated_image_url || '',
          matches: res.matches || []
        })
        setElimOpen(true)
        return
      }

      // Passed: show success modal with matches; no auto-advance
      setConfettiKey(k => k + 1)
      const msg = stage === 'easy' ? 'Great job! Ready for Medium...' :
                  stage === 'medium' ? 'Awesome! Ready for Hard...' :
                  'You did it!'
      setToast({ show: true, msg })

      setSuccessMatches(res.matches || [])
      setNextStage(res.next_stage)
      setSuccessOpen(true)
    } catch (e) {
      setError(e?.response?.data?.detail || 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleNextLevel = async () => {
    setSuccessOpen(false)
    if (nextStage === 'done') {
      navigate(`/results/${sessionId}`)
      return
    }
    await loadStage()
  }

  const currentStageProgress = useMemo(() => {
    let count = 0
    for (const img of images) {
      if ((prompts[img.session_image_id] || '').trim()) count += 1
    }
    return count
  }, [images, prompts])

  return (
    <div className="container">
      <Confetti trigger={confettiKey} />
      <Toast show={toast.show} message={toast.msg} duration={1400} onDone={() => setToast({ show:false, msg:'' })} />

      <div className="hud">
        <div className="left" style={{alignItems:'center'}}>
          <span className="badge" style={{borderColor: stageBadgeColor, color: stageBadgeColor}}>Stage: {stageName(stage)}</span>
          <span className="thresh">Threshold: ≥{thresholds[stage]}%</span>
          <span className="thresh">Stage Progress: {currentStageProgress}/{totalForStage}</span>
        </div>
        <div className="right" style={{alignItems:'center', gap:12}}>
          <CircularProgress value={imagesCompleted} max={5} />
        </div>
      </div>

      {loading && <div className="card">Loading...</div>}
      {!loading && (
        <>
          <div className="grid" style={{alignItems:'start'}}>
            {images.map(img => (
              <ImagePromptCard
                key={img.session_image_id}
                image={img}
                value={prompts[img.session_image_id] || ''}
                onChange={onChangePrompt}
              />
            ))}
          </div>
          {error && <div style={{color:'#fca5a5', marginTop:12}}>{error}</div>}
          <div style={{marginTop:16, display:'flex', justifyContent:'flex-end'}}>
            <button onClick={handleSubmitStage} disabled={submitting} className="success">
              {submitting ? 'Scoring...' : 'Submit Stage'}
            </button>
          </div>
        </>
      )}

      <EliminationModal
        open={elimOpen}
        eliminatedAt={elimData.at}
        originalPrompt={elimData.prompt}
        imageUrl={elimData.img}
        matches={elimData.matches}
        onClose={() => { setElimOpen(false); navigate('/') }}
      />

        <SuccessModal
        open={successOpen}
        stage={stage}
        matches={successMatches}
        onNext={handleNextLevel}
        nextStage={nextStage}
        />
    </div>
  )
}
