import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Brain, Clock, ChevronRight, ChevronLeft, Send } from 'lucide-react'
import { generateTest, analyzeTest } from '../services/api'
import './MockTest.css'

const DIFFICULTIES = [
  { key: 'beginner', label: '🌱 Beginner', color: '#16a34a' },
  { key: 'easy',     label: '😊 Easy',     color: '#2563eb' },
  { key: 'medium',   label: '⚡ Medium',   color: '#6c47ff' },
  { key: 'hard',     label: '🔥 Hard',     color: '#ea580c' },
  { key: 'expert',   label: '💀 Expert',   color: '#dc2626' },
]

export default function MockTest() {
  const navigate = useNavigate()

  const [topic, setTopic] = useState('')
  const [numQuestions, setNumQuestions] = useState(20)
  const [difficulty, setDifficulty] = useState('medium')
  const [phase, setPhase] = useState('setup')

  const [questions, setQuestions] = useState([])
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [error, setError] = useState('')
  const timerRef = useRef(null)

  useEffect(() => {
    if (phase === 'test') {
      timerRef.current = setInterval(() => {
        setTimeElapsed(t => t + 1)
      }, 1000)
    }
    return () => clearInterval(timerRef.current)
  }, [phase])

  const formatTime = (s) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  }

  const handleStart = async () => {
    if (!topic.trim()) return
    setPhase('loading')
    setError('')
    try {
      const data = await generateTest(topic, numQuestions, difficulty)
      setQuestions(data.questions)
      setAnswers({})
      setTimeElapsed(0)
      setCurrent(0)
      setPhase('test')
    } catch (err) {
      setError(err.message || 'Failed to generate test.')
      setPhase('setup')
    }
  }

  const handleAnswer = (questionId, key) => {
    setAnswers(prev => ({ ...prev, [questionId]: key }))
  }

  const handleSubmit = async () => {
    clearInterval(timerRef.current)
    setPhase('submitting')

    const answersPayload = questions.map(q => ({
      question_id: q.id,
      question: q.question,
      topic: q.topic,
      correct: q.correct,
      user_answer: answers[q.id] || '',
    }))

    try {
      const result = await analyzeTest({
        topic,
        total_questions: questions.length,
        time_taken_seconds: timeElapsed,
        answers: answersPayload,
      })
      localStorage.setItem('testResult', JSON.stringify(result))
      localStorage.setItem('testTopic', topic)
      navigate('/test/results')
    } catch (err) {
      setError(err.message || 'Failed to analyze test.')
      setPhase('test')
    }
  }

  const answeredCount = Object.keys(answers).length
  const progress = questions.length ? (answeredCount / questions.length) * 100 : 0
  const selectedDifficulty = DIFFICULTIES.find(d => d.key === difficulty)

  // ── SETUP ──
  if (phase === 'setup') {
    return (
      <div className="mock-test-page">
        <div className="test-setup-card">
          <div className="test-setup-icon">
            <Brain size={40} color="#6c47ff" />
          </div>
          <h1 className="test-setup-title">AI Mock Test Generator</h1>
          <p className="test-setup-sub">
            Enter a topic and our AI will generate a personalized MCQ test for you.
          </p>

          {error && <div className="test-error">{error}</div>}

          <div className="test-setup-form">

            {/* Topic */}
            <div className="form-group">
              <label>Topic / Subject</label>
              <input
                type="text"
                placeholder="e.g. Newton's Laws, Organic Chemistry, Integration..."
                value={topic}
                onChange={e => setTopic(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleStart()}
                className="test-input"
              />
            </div>

            {/* Number of Questions */}
            <div className="form-group">
              <label>Number of Questions</label>
              <div className="question-count-pills">
                {[5, 10, 15, 20].map(n => (
                  <button
                    key={n}
                    className={`count-pill ${numQuestions === n ? 'active' : ''}`}
                    onClick={() => setNumQuestions(n)}
                  >
                    {n} Qs
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div className="form-group">
              <label>Difficulty Level</label>
              <div className="difficulty-pills">
                {DIFFICULTIES.map(d => (
                  <button
                    key={d.key}
                    className={`difficulty-pill ${difficulty === d.key ? 'active' : ''}`}
                    style={difficulty === d.key ? {
                      background: d.color,
                      borderColor: d.color,
                      color: '#fff'
                    } : {}}
                    onClick={() => setDifficulty(d.key)}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              className="btn-start-test"
              onClick={handleStart}
              disabled={!topic.trim()}
            >
              🚀 Generate & Start Test
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── LOADING ──
  if (phase === 'loading') {
    return (
      <div className="mock-test-page">
        <div className="test-loading">
          <div className="loading-spinner"></div>
          <h2>Generating your {numQuestions}-question test</h2>
          <h3 className="loading-topic">"{topic}"</h3>
          <div
            className="loading-difficulty-badge"
            style={{ background: selectedDifficulty?.color }}
          >
            {selectedDifficulty?.label}
          </div>
          <p>Our AI is crafting personalized questions for you...</p>
        </div>
      </div>
    )
  }

  // ── TEST ──
  if (phase === 'test' || phase === 'submitting') {
    const q = questions[current]

    return (
      <div className="mock-test-page">
        {/* Header */}
        <div className="test-header">
          <div className="test-header-left">
            <span className="test-topic-badge">{topic}</span>
            <span
              className="test-difficulty-badge"
              style={{ background: selectedDifficulty?.color }}
            >
              {selectedDifficulty?.label}
            </span>
            <span className="test-progress-text">
              {answeredCount}/{questions.length} answered
            </span>
          </div>
          <div className="test-timer">
            <Clock size={16} />
            {formatTime(timeElapsed)}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="test-progress-bar">
          <div className="test-progress-fill" style={{ width: `${progress}%` }} />
        </div>

        {/* Question Card */}
        <div className="question-card">
          <div className="question-number">Question {current + 1} of {questions.length}</div>
          <div className="question-topic-tag">{q.topic}</div>
          <h2 className="question-text">{q.question}</h2>

          <div className="options-grid">
            {q.options.map(opt => (
              <button
                key={opt.key}
                className={`option-btn ${answers[q.id] === opt.key ? 'selected' : ''}`}
                onClick={() => handleAnswer(q.id, opt.key)}
              >
                <span className="option-key">{opt.key}</span>
                <span className="option-value">{opt.value}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="test-navigation">
          <button
            className="nav-btn"
            onClick={() => setCurrent(c => Math.max(0, c - 1))}
            disabled={current === 0}
          >
            <ChevronLeft size={20} /> Previous
          </button>

          <div className="question-dots">
            {questions.map((_, i) => (
              <button
                key={i}
                className={`dot ${i === current ? 'current' : ''} ${answers[questions[i].id] ? 'answered' : ''}`}
                onClick={() => setCurrent(i)}
              />
            ))}
          </div>

          {current < questions.length - 1 ? (
            <button
              className="nav-btn"
              onClick={() => setCurrent(c => Math.min(questions.length - 1, c + 1))}
            >
              Next <ChevronRight size={20} />
            </button>
          ) : (
            <button
              className="nav-btn submit-btn"
              onClick={handleSubmit}
              disabled={phase === 'submitting'}
            >
              <Send size={16} />
              {phase === 'submitting' ? 'Analyzing...' : 'Submit Test'}
            </button>
          )}
        </div>

        {error && <div className="test-error">{error}</div>}
      </div>
    )
  }
}