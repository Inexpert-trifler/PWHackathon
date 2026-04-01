import { useState } from 'react'
import { Brain, MapPin, Clock, BookOpen, ArrowRight, Star, AlertCircle, CheckCircle, ArrowDown } from 'lucide-react'
import { generateRoadmap } from '../services/api'
import './Roadmap.css'

export default function Roadmap() {
  const [topic, setTopic] = useState('')
  const [loading, setLoading] = useState(false)
  const [roadmap, setRoadmap] = useState(null)
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    if (!topic.trim()) return
    setLoading(true)
    setRoadmap(null)
    setError('')
    try {
      const result = await generateRoadmap(topic)
      setRoadmap(result)
    } catch (err) {
      setError(err.message || 'Failed to generate roadmap.')
    }
    setLoading(false)
  }

  const getImportanceColor = (importance) => {
    switch (importance) {
      case 'high': return '#ef4444'
      case 'medium': return '#f97316'
      case 'low': return '#22c55e'
      default: return '#6b7280'
    }
  }

  const getImportanceBadgeColor = (importance) => {
    switch (importance) {
      case 'high': return '#fee2e2'
      case 'medium': return '#fed7aa'
      case 'low': return '#dcfce7'
      default: return '#f3f4f6'
    }
  }

  const renderMindmap = () => {
    if (!roadmap || !roadmap.subtopics) return null

    const centerX = 400
    const centerY = 300
    const radius = 150

    return (
      <svg width="800" height="600" viewBox="0 0 800 600" className="mindmap-svg">
        {/* Center node */}
        <g>
          <circle cx={centerX} cy={centerY} r="60" fill="#6c47ff" />
          <text x={centerX} y={centerY} textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">
            {roadmap.topic}
          </text>
        </g>

        {/* Subtopic nodes and connections */}
        {roadmap.subtopics.map((subtopic, index) => {
          const angle = (index * 2 * Math.PI) / roadmap.subtopics.length
          const x = centerX + radius * Math.cos(angle)
          const y = centerY + radius * Math.sin(angle)

          return (
            <g key={subtopic.name}>
              {/* Connection line */}
              <line
                x1={centerX}
                y1={centerY}
                x2={x}
                y2={y}
                stroke={getImportanceColor(subtopic.importance)}
                strokeWidth="2"
              />
              
              {/* Subtopic node */}
              <circle cx={x} cy={y} r="40" fill={getImportanceColor(subtopic.importance)} />
              <text
                x={x}
                y={y}
                textAnchor="middle"
                fill="white"
                fontSize="10"
                fontWeight="bold"
              >
                {subtopic.name.length > 15 ? subtopic.name.substring(0, 15) + '...' : subtopic.name}
              </text>
              
              {/* Study hours badge */}
              <rect x={x - 20} y={y + 25} width="40" height="20" rx="10" fill="white" />
              <text x={x} y={y + 38} textAnchor="middle" fontSize="8" fill="#333">
                {subtopic.study_hours}h
              </text>
            </g>
          )
        })}
      </svg>
    )
  }

  const renderFlowchart = () => {
    if (!roadmap || !roadmap.study_order) return null

    const boxWidth = 200
    const boxHeight = 60
    const verticalSpacing = 100
    const startX = 300

    return (
      <svg width="800" height={roadmap.study_order.length * verticalSpacing + 100} viewBox="0 0 800 800" className="flowchart-svg">
        {roadmap.study_order.map((subtopicName, index) => {
          const subtopic = roadmap.subtopics.find(st => st.name === subtopicName)
          if (!subtopic) return null

          const y = index * verticalSpacing + 50

          return (
            <g key={subtopicName}>
              {/* Box */}
              <rect
                x={startX}
                y={y}
                width={boxWidth}
                height={boxHeight}
                rx="8"
                fill={getImportanceColor(subtopic.importance)}
                fillOpacity="0.1"
                stroke={getImportanceColor(subtopic.importance)}
                strokeWidth="2"
              />
              
              {/* Text */}
              <text x={startX + boxWidth / 2} y={y + 25} textAnchor="middle" fontSize="14" fontWeight="bold" fill="#333">
                {subtopic.name}
              </text>
              <text x={startX + boxWidth / 2} y={y + 45} textAnchor="middle" fontSize="12" fill="#666">
                {subtopic.study_hours} hours • {subtopic.importance}
              </text>

              {/* Arrow to next */}
              {index < roadmap.study_order.length - 1 && (
                <ArrowDownIcon x={startX + boxWidth / 2} y={y + boxHeight} />
              )}
            </g>
          )
        })}
      </svg>
    )
  }

  const ArrowDownIcon = ({ x, y }) => (
    <g>
      <line x1={x} y1={y} x2={x} y2={y + 30} stroke="var(--pw-primary)" strokeWidth="2" />
      <path d={`M${x - 8},${y + 30} L${x + 8},${y + 30} L${x},${y + 40} Z`} fill="var(--pw-primary)" />
    </g>
  )

  return (
    <div className="roadmap-page">
      <div className="header-section text-center">
        <Brain size={48} color="var(--pw-primary)" />
        <h1 className="page-title">AI Study Roadmap Generator</h1>
        <p className="page-subtitle">Generate personalized learning paths with AI-powered insights</p>
      </div>

      <div className="input-section">
        <div className="card">
          <div className="input-group">
            <label className="input-label">Enter Study Topic</label>
            <input
              type="text"
              className="topic-input"
              placeholder="e.g., Machine Learning, Quantum Physics, Organic Chemistry..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
            />
          </div>
          <button
            className="btn-primary generate-btn"
            onClick={handleGenerate}
            disabled={loading || !topic.trim()}
          >
            {loading ? 'Generating Roadmap...' : 'Generate Roadmap'}
            <Brain size={20} />
          </button>
        </div>
      </div>

      {loading && (
        <div className="loading-section">
          <div className="loading-skeleton">
            <div className="skeleton-line shimmer h-8 w-1/3"></div>
            <div className="skeleton-line shimmer h-32 w-full"></div>
            <div className="skeleton-line shimmer h-24 w-full"></div>
          </div>
        </div>
      )}

      {error && (
        <div className="error-section">
          <div className="card error-card">
            <AlertCircle size={20} color="#ef4444" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {roadmap && (
        <div className="roadmap-content">
          {/* Overview Card */}
          <div className="card overview-card">
            <h2 className="section-title">
              <MapPin size={24} />
              {roadmap.topic} - Overview
            </h2>
            <p className="overview-text">{roadmap.overview}</p>
            <div className="stats-grid">
              <div className="stat-item">
                <Clock size={20} color="var(--pw-primary)" />
                <div>
                  <div className="stat-value">{roadmap.total_study_hours}h</div>
                  <div className="stat-label">Total Study Time</div>
                </div>
              </div>
              <div className="stat-item">
                <BookOpen size={20} color="var(--pw-primary)" />
                <div>
                  <div className="stat-value">{roadmap.subtopics.length}</div>
                  <div className="stat-label">Subtopics</div>
                </div>
              </div>
            </div>
          </div>

          {/* Mindmap */}
          <div className="card">
            <h3 className="section-title">
              <Star size={20} />
              Visual Mindmap
            </h3>
            <div className="mindmap-container">
              {renderMindmap()}
            </div>
          </div>

          {/* Study Flowchart */}
          <div className="card">
            <h3 className="section-title">
              <ArrowRight size={20} />
              Learning Flow
            </h3>
            <div className="flowchart-container">
              {renderFlowchart()}
            </div>
          </div>

          {/* Subtopics Details */}
          <div className="card">
            <h3 className="section-title">
              <BookOpen size={20} />
              Detailed Subtopics
            </h3>
            <div className="subtopics-grid">
              {roadmap.subtopics.map((subtopic) => (
                <div key={subtopic.name} className="subtopic-card">
                  <div className="subtopic-header">
                    <h4 className="subtopic-name">{subtopic.name}</h4>
                    <span 
                      className="importance-badge"
                      style={{
                        backgroundColor: getImportanceBadgeColor(subtopic.importance),
                        color: getImportanceColor(subtopic.importance)
                      }}
                    >
                      {subtopic.importance}
                    </span>
                  </div>
                  <p className="subtopic-description">{subtopic.description}</p>
                  <div className="subtopic-meta">
                    <span className="study-hours">
                      <Clock size={16} />
                      {subtopic.study_hours} hours
                    </span>
                  </div>
                  <div className="resources-section">
                    <h5>Resources:</h5>
                    <ul className="resources-list">
                      {subtopic.resources.map((resource, idx) => (
                        <li key={idx}>
                          <CheckCircle size={14} color="#22c55e" />
                          {resource}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Concepts */}
          <div className="card">
            <h3 className="section-title">
              <Star size={20} />
              Key Concepts
            </h3>
            <div className="tags-container">
              {roadmap.key_concepts.map((concept, index) => (
                <span key={index} className="concept-tag">{concept}</span>
              ))}
            </div>
          </div>

          {/* Prerequisites */}
          <div className="card">
            <h3 className="section-title">
              <AlertCircle size={20} />
              Prerequisites
            </h3>
            <div className="tags-container">
              {roadmap.prerequisites.map((prereq, index) => (
                <span key={index} className="prereq-tag">{prereq}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
