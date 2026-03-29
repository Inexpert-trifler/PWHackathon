import { Link } from 'react-router-dom'
import {
  BrainCircuit, Search, Calendar, ClipboardList,
  ArrowRight, Zap, BookOpen, Target, TrendingUp
} from 'lucide-react'
import './Dashboard.css'

const tips = [
  "Consistency beats intensity — study 2hrs daily rather than 10hrs once a week.",
  "After every mock test, spend equal time reviewing wrong answers.",
  "Solve previous year JEE papers — 40% questions follow similar patterns.",
  "Weak in a topic? Watch a short lecture, then immediately solve 10 problems.",
  "Take breaks every 45 mins — your brain consolidates memory during rest.",
]

const todayTip = tips[new Date().getDay() % tips.length]

export default function Dashboard() {
  return (
    <div className="dashboard-page">

      {/* ── Hero ── */}
      <section className="dash-hero">
        <div className="dash-hero-text">
          <h1 className="hero-title">
            Your AI-Powered JEE{' '}
            <span className="text-gradient-orange">Command Center</span>
          </h1>
          <p className="hero-subtext">
            Smarter preparation. Faster results. Powered by AI.
          </p>
        </div>

        {/* Tip of the Day */}
        <div className="tip-banner">
          <span className="tip-icon">💡</span>
          <div>
            <span className="tip-label">Tip of the Day</span>
            <p className="tip-text">{todayTip}</p>
          </div>
        </div>
      </section>

      {/* ── 4 Feature Cards ── */}
      <section className="features-section">
        <h2 className="section-label">Explore Features</h2>
        <div className="features-grid">

          <Link to="/ask-doubt" className="feature-card fc-purple">
            <div className="fc-icon">
              <BrainCircuit size={28} />
            </div>
            <div className="fc-content">
              <h3>AI Doubt Solver</h3>
              <p>Get instant step-by-step solutions to any JEE problem.</p>
            </div>
            <ArrowRight size={18} className="fc-arrow" />
          </Link>

          <Link to="/lecture-search" className="feature-card fc-amber">
            <div className="fc-icon">
              <BookOpen size={28} />
            </div>
            <div className="fc-content">
              <h3>Lecture Analyzer</h3>
              <p>Upload any video — get AI transcript and topic timestamps.</p>
            </div>
            <ArrowRight size={18} className="fc-arrow" />
          </Link>

          <Link to="/test" className="feature-card fc-green">
            <div className="fc-icon">
              <ClipboardList size={28} />
            </div>
            <div className="fc-content">
              <h3>Mock Test</h3>
              <p>AI-generated MCQs with weak topic analysis and grade.</p>
            </div>
            <ArrowRight size={18} className="fc-arrow" />
          </Link>

          <Link to="/study-plan" className="feature-card fc-blue">
            <div className="fc-icon">
              <Calendar size={28} />
            </div>
            <div className="fc-content">
              <h3>Study Planner</h3>
              <p>Your personalized daily roadmap based on weak areas.</p>
            </div>
            <ArrowRight size={18} className="fc-arrow" />
          </Link>

        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="how-section">
        <h2 className="section-label">How It Works</h2>
        <div className="how-steps">

          <div className="how-step">
            <div className="step-number">01</div>
            <div className="step-icon"><Target size={22} color="#6c47ff" /></div>
            <h4>Pick a Topic</h4>
            <p>Choose any JEE subject or concept you want to master.</p>
          </div>

          <div className="how-divider" />

          <div className="how-step">
            <div className="step-number">02</div>
            <div className="step-icon"><Zap size={22} color="#f59e0b" /></div>
            <h4>Take AI Mock Test</h4>
            <p>Our AI generates 20 custom MCQs tailored to your topic.</p>
          </div>

          <div className="how-divider" />

          <div className="how-step">
            <div className="step-number">03</div>
            <div className="step-icon"><TrendingUp size={22} color="#16a34a" /></div>
            <h4>Get Analyzed</h4>
            <p>See your score, weak topics, and AI-powered feedback instantly.</p>
          </div>

          <div className="how-divider" />

          <div className="how-step">
            <div className="step-number">04</div>
            <div className="step-icon"><Search size={22} color="#3b82f6" /></div>
            <h4>Deep Dive</h4>
            <p>Upload lectures or ask doubts to strengthen weak areas.</p>
          </div>

        </div>
      </section>

      {/* ── Quick Start Banner ── */}
      <section className="quick-start-banner">
        <div className="qs-left">
          <h3>Ready to test your knowledge?</h3>
          <p>Generate a personalized AI mock test in under 30 seconds.</p>
        </div>
        <Link to="/test" className="qs-btn">
          🚀 Start Mock Test <ArrowRight size={18} />
        </Link>
      </section>

    </div>
  )
}