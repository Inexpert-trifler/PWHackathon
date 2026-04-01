import { useState, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import AskDoubt from './pages/AskDoubt'
import LectureSearch from './pages/LectureSearch'
import StudyPlan from './pages/StudyPlan'
import MockTest from './pages/MockTest'
import TestResults from './pages/TestResults'
import Roadmap from './pages/Roadmap'

function App() {
  const [loading, setLoading] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timer)
  }, [location.pathname])

  return (
    <div className="app-container">
      {loading && <div className="top-progress"></div>}
      <Navbar />
      <main className="container page-enter" style={{ paddingTop: '100px', paddingBottom: '60px' }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/ask-doubt" element={<AskDoubt />} />
          <Route path="/lecture-search" element={<LectureSearch />} />
          <Route path="/study-plan" element={<StudyPlan />} />
          <Route path="/test" element={<MockTest />} />
          <Route path="/test/results" element={<TestResults />} />
          <Route path="/roadmap" element={<Roadmap />} />
        </Routes>
      </main>
    </div>
  )
}

export default App