import axios from 'axios'
const api = axios.create({ baseURL: '' })

export const startGame = async (display_name) => {
  const { data } = await api.post('/api/start', { display_name })
  return data
}

export const getNextStage = async (sessionId) => {
  const { data } = await api.get(`/api/session/${sessionId}/next_stage`)
  return data
}

export const submitStage = async (sessionId, items) => {
  const { data } = await api.post(`/api/session/${sessionId}/submit_stage`, { items })
  return data
}

export const getStatus = async (sessionId) => {
  const { data } = await api.get(`/api/session/${sessionId}/status`)
  return data
}

export const getLeaderboard = async (limit=50) => {
  const { data } = await api.get(`/api/leaderboard?limit=${limit}`)
  return data
}
