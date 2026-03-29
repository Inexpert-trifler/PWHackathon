import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trophy, TrendingUp, TrendingDown, Clock, RotateCcw, Home } from 'lucide-react'
import './TestResults.css'

export default function TestResults() {
  const navigate = useNavigate()
  const [result, setResult] = useState(null)
  const [topic, setTopic] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('testResult')
    const savedTopic = localStorage.getItem('testTopic')
    if (!saved) { navigate('/test'); return }
    setResult(JSON.parse(saved))
    setTopic(savedTopic || '')
  }, [navigate])

  if (!result) return null

  const gradeColor = {
    'A+': '#16a34a', 'A': '#22c55e',
    'B': '#3b82f6', 'C': '#f59e0b', 'D': '#ef4444'
  }[result.grade] || '#6c47ff'

  const formatTime = (s) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}m ${sec}s`
  }

  return (
    <div className="results-page">

      {/* Hero Score */}
      <div className="results-hero">
        <Trophy size={40} color="#f59e0b" />
        <h1>Test Complete!</h1>
        <p className="results-topic">{topic}</p>

        <div className="score-circle" style={{ borderColor: gradeColor }}>
          <span className="score-number" style={{ color: gradeColor }}>
            {result.total_score}/{result.total_questions}
          </span>
          <span className="score-percent" style={{ color: gradeColor }}>
            {result.percentage}%
          </span>
          <span className="score-grade" style={{ background: gradeColor }}>
            {result.grade}
          </span>
        </div>

        <div className="results-meta">
          <div className="meta-item">
            <Clock size={16} />
            <span>{formatTime(result.time_taken_seconds)}</span>
          </div>
          <div className="meta-item">
            <TrendingUp size={16} color="#16a34a" />
            <span>{result.strong_topics.length} strong topics</span>
          </div>
          <div className="meta-item">
            <TrendingDown size={16} color="#ef4444" />
            <span>{result.weak_topics.length} weak topics</span>
          </div>
        </div>
      </div>

      {/* AI Feedback */}
      <div className="results-section feedback-card">
        <h2>🤖 AI Feedback</h2>
        <p className="feedback-text">{result.ai_feedback}</p>
      </div>

      {/* Topic Performance Graph */}
      <div className="results-section">
        <h2>📊 Topic-wise Performance</h2>
        <div className="topic-bars">
          {result.topic_scores.map((t, i) => (
            <div key={i} className="topic-bar-row">
              <div className="topic-bar-label">{t.topic}</div>
              <div className="topic-bar-track">
                <div
                  className="topic-bar-fill"
                  style={{
                    width: `${t.percentage}%`,
                    background: t.percentage >= 75
                      ? '#16a34a'
                      : t.percentage >= 50
                      ? '#f59e0b'
                      : '#ef4444'
                  }}
                />
              </div>
              <div className="topic-bar-score">
                {t.correct}/{t.total} ({t.percentage}%)
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weak vs Strong */}
      <div className="results-two-col">
        <div className="results-section weak-section">
          <h2>⚠️ Weak Topics</h2>
          {result.weak_topics.length === 0
            ? <p className="no-items">No weak topics — great job!</p>
            : result.weak_topics.map((t, i) => (
              <div key={i} className="topic-tag weak">{t}</div>
            ))
          }
        </div>
        <div className="results-section strong-section">
          <h2>✅ Strong Topics</h2>
          {result.strong_topics.length === 0
            ? <p className="no-items">Keep practicing to build strengths!</p>
            : result.strong_topics.map((t, i) => (
              <div key={i} className="topic-tag strong">{t}</div>
            ))
          }
        </div>
      </div>

      {/* Actions */}
      <div className="results-actions">
        <button className="action-btn secondary" onClick={() => navigate('/test')}>
          <RotateCcw size={18} /> Take Another Test
        </button>
        <button className="action-btn primary" onClick={() => navigate('/')}>
          <Home size={18} /> Back to Dashboard
        </button>
      </div>
    </div>
  )
}