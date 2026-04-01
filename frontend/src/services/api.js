const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

async function apiGet(path, params = {}) {
  const url = new URL(`${API_BASE}${path}`, window.location.origin)
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, String(v))
  })
  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`API ${res.status}: ${text || res.statusText}`)
  }
  return await res.json()
}

async function apiPost(path, body = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`API ${res.status}: ${text || res.statusText}`)
  }
  return await res.json()
}

export const solveDoubt = async (question, subject) =>
  apiGet('/api/doubt', { query: `${subject}: ${question}` })

export const searchLecture = async (query) =>
  apiGet('/api/search', { query })

export const getStudyPlan = async (query = 'Generate current personalized plan') =>
  apiGet('/api/plan', { query })

export const getPerformance = async () =>
  apiGet('/api/performance', { query: 'Analyze latest student performance' })

export const uploadLecture = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch(`${API_BASE}/api/lecture/upload`, {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Upload failed ${res.status}: ${text || res.statusText}`)
  }
  return await res.json()
}

export const generateTest = async (topic, num_questions = 20, difficulty = 'medium') =>
  apiPost('/api/test/generate', { topic, num_questions, difficulty })

export const analyzeTest = async (payload) =>
  apiPost('/api/test/analyze', payload)