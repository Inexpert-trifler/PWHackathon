import { useState, useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { User, Flame, X, Calendar } from 'lucide-react'
import './Navbar.css'

// ── Streak start date — change this to your actual start date ──
const STREAK_START_DATE = new Date('2025-02-10') // ~47 days ago

function getDaysSince(date) {
  const today = new Date()
  const diff = today - date
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

function formatDate(date) {
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function getLast7Days(startDate) {
  const days = []
  const today = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    days.push({
      label: d.toLocaleDateString('en-IN', { weekday: 'short' }),
      active: d >= startDate,
    })
  }
  return days
}

export default function Navbar() {
  const [showStreak, setShowStreak] = useState(false)
  const popupRef = useRef(null)
  const streakDays = getDaysSince(STREAK_START_DATE)
  const last7 = getLast7Days(STREAK_START_DATE)

  const links = [
    { path: '/', label: 'Dashboard' },
    { path: '/ask-doubt', label: 'Ask Doubt' },
    { path: '/lecture-search', label: 'Lecture Search' },
    { path: '/study-plan', label: 'Study Plan' },
    { path: '/roadmap', label: 'Roadmap' },
    { path: '/test', label: ' Mock Test' },
  ]

  // Close popup on outside click
  useEffect(() => {
    function handleClick(e) {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setShowStreak(false)
      }
    }
    if (showStreak) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showStreak])

  return (
    <nav className="navbar glass-panel">
      <div className="container navbar-container">

        {/* ── Logo ── */}
        <div className="navbar-logo">
          <div className="pw-logo-icon">
            <span className="pw-logo-text">PW</span>
          </div>
          <span className="logo-text">AI Platform</span>
        </div>

        {/* ── Links ── */}
        <ul className="navbar-links">
          {links.map((link) => (
            <li key={link.path}>
              <NavLink
                to={link.path}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                end={link.path === '/'}
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* ── Profile ── */}
        <div className="navbar-profile">

          {/* Streak Badge */}
          <div className="streak-wrapper" ref={popupRef}>
            <button
              className="streak-badge"
              onClick={() => setShowStreak(s => !s)}
            >
              <Flame size={16} color="#FF6B00" />
              <span>{streakDays} Days</span>
            </button>

            {/* Streak Popup */}
            {showStreak && (
              <div className="streak-popup">
                <button
                  className="streak-popup-close"
                  onClick={() => setShowStreak(false)}
                >
                  <X size={14} />
                </button>

                <div className="streak-popup-header">
                  <Flame size={28} color="#FF6B00" />
                  <div>
                    <h3 className="streak-popup-days">{streakDays} Day Streak! 🔥</h3>
                    <p className="streak-popup-sub">Keep it up, Stack Masters!</p>
                  </div>
                </div>

                <div className="streak-popup-divider" />

                <div className="streak-start-info">
                  <Calendar size={14} color="#888" />
                  <span>Started on {formatDate(STREAK_START_DATE)}</span>
                </div>

                {/* Last 7 days */}
                <div className="streak-week">
                  {last7.map((day, i) => (
                    <div key={i} className="streak-day">
                      <div className={`streak-dot ${day.active ? 'active' : ''}`}>
                        {day.active ? '🔥' : ''}
                      </div>
                      <span className="streak-day-label">{day.label}</span>
                    </div>
                  ))}
                </div>

                <div className="streak-popup-footer">
                  🏆 You're in the top 10% of learners!
                </div>
              </div>
            )}
          </div>

          {/* User */}
          <div className="user-avatar-wrapper">
            <div className="user-text">
              <span className="user-name">Stack Masters</span>
            </div>
            <div className="avatar">
              <User size={20} />
            </div>
          </div>

        </div>
      </div>
    </nav>
  )
}