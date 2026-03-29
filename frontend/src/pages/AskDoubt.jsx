import { useState } from 'react'
import { Sparkles, CircleDot } from 'lucide-react'
import { solveDoubt } from '../services/api'
import './AskDoubt.css'

export default function AskDoubt() {
  const [question, setQuestion] = useState('')
  const [subject, setSubject] = useState('Physics')
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState(null)
  const [error, setError] = useState('')

  const subjects = ['Physics', 'Chemistry', 'Mathematics', 'Biology']

  const handleSolve = async () => {
    if (!question.trim()) return
    setLoading(true)
    setResponse(null)
    setError('')
    try {
      const res = await solveDoubt(question, subject)
      setResponse(res)
    } catch (err) {
      setError(err.message || 'Failed to solve doubt.')
    }
    setLoading(false)
  }

  return (
    <div className="ask-doubt-page">
      <div className="header-section text-center">
        <div className="live-ai-badge">
          <CircleDot size={12} className="pulse-dot" color="#22c55e" />
          <span>Live AI</span>
        </div>
        <h1 className="page-title text-gradient">AI Doubt <span className="text-gradient-orange">Resolution Engine</span></h1>
      </div>

      <div className="card doubt-input-card">
        <textarea 
          className="doubt-textarea"
          placeholder="Type your doubt here... e.g. Why does a capacitor block DC?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        
        <div className="subject-selector">
          {subjects.map(sub => (
            <button 
              key={sub}
              className={`tag-pill ${subject === sub ? 'active' : ''}`}
              onClick={() => setSubject(sub)}
            >
              {sub}
            </button>
          ))}
        </div>

        <button className="btn-primary solve-btn" onClick={handleSolve} disabled={loading || !question.trim()}>
          {loading ? 'Analyzing Query...' : 'Solve My Doubt'}
          {!loading && <Sparkles size={18} />}
        </button>
      </div>

      {loading && (
        <div className="loading-skeleton">
          <div className="skeleton-line shimmer h-8 w-1/3"></div>
          <div className="skeleton-line shimmer h-24 w-full"></div>
          <div className="skeleton-line shimmer h-12 w-full"></div>
        </div>
      )}

      {error && <div className="card mt-4 text-secondary">{error}</div>}

      {response && (
        <div className="card response-card ai-glow fade-in">
          <h3 className="section-title">AI Solution</h3>
          
          <div className="response-section">
            <span className="label-text">Concept</span>
            <p className="typewriter">{response.concept}</p>
          </div>

          <div className="response-section">
            <span className="label-text">Formula / Derivation</span>
            <div className="code-block typewriter-delay-1">
              <code>{response.formula}</code>
            </div>
          </div>

          <div className="response-section">
            <span className="label-text">Detailed Explanation</span>
            <p className="text-secondary typewriter-delay-2">{response.explanation}</p>
          </div>

          <div className="response-section mt-6">
            <span className="label-text">Related Topics</span>
            <div className="flex flex-wrap gap-2 mt-2 typewriter-delay-3">
              {response.relatedTopics.map((topic, i) => (
                <span key={i} className="tag-pill">{topic}</span>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
